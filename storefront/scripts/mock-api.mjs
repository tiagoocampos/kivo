// Mock do backend do KirvoAgenda, só pra desenvolver/testar o storefront enquanto
// as rotas públicas (/booking/...) não existem no backend real. Implementa o
// contrato descrito em docs/api-contract.md, em memória, sem dependências.
//
//   npm run mock          (porta 3333, a mesma padrão do backend)
//
// Barbearias de exemplo:
//   /barbearia-demo   completa (logo, banner, horários, contato)
//   /sem-marca        recém-criada: sem logo, banner, telefone nem horários (testa os fallbacks)
//   /indisponivel     como a demo, mas o endpoint de disponibilidade responde 404 (como hoje no backend real)
//
// Regras simuladas: expediente ter–sáb 09:00–18:00 com almoço 12:00–13:00, horários de 30 em 30 min,
// o serviço precisa caber inteiro no expediente e não pode colidir com outro agendamento do profissional.

import http from "node:http"
import { randomUUID } from "node:crypto"

const PORT = Number(process.env.PORT ?? 3333)
const TIMEZONE = "America/Sao_Paulo"
const UTC_OFFSET = "-03:00" // São Paulo não tem horário de verão desde 2019
const SLOT_STEP = 30

const svg = (fill, label) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" height="300" fill="${fill}"/><text x="300" y="165" font-size="42" text-anchor="middle" fill="#fff" font-family="sans-serif">${label}</text></svg>`
  )}`

const SERVICES = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Corte de cabelo", description: "Corte masculino na tesoura ou máquina.", durationMinutes: 30, price: 4500 },
  { id: "22222222-2222-4222-8222-222222222222", name: "Barba", description: null, durationMinutes: 30, price: 3000 },
  { id: "33333333-3333-4333-8333-333333333333", name: "Corte + Barba", description: "O combo completo, com toalha quente.", durationMinutes: 60, price: 7000 },
]

const PROFESSIONALS = [
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Carlos Silva", photoUrl: null },
  { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", name: "Marcos Souza", photoUrl: null },
]

const BUSINESS_HOURS = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
  const open = dayOfWeek >= 2 && dayOfWeek <= 6
  return { dayOfWeek, isClosed: !open, opensAt: open ? "09:00" : null, closesAt: open ? "18:00" : null }
})

const TENANTS = {
  "barbearia-demo": {
    id: "t-demo", name: "Barbearia do João", slug: "barbearia-demo", phone: "(54) 99906-7417",
    description: "Tradição e estilo no centro da cidade desde 2015.", address: "Rua das Flores, 123", city: "Caxias do Sul",
    instagramUrl: "https://instagram.com/barbeariadojoao", logoUrl: svg("#7c2d12", "BJ"), bannerUrl: svg("#292524", "Barbearia do João"),
    faviconUrl: null, timezone: TIMEZONE, businessHours: BUSINESS_HOURS,
  },
  "sem-marca": {
    id: "t-vazia", name: "Cortes & Cia", slug: "sem-marca", phone: null, description: null, address: null, city: null,
    instagramUrl: null, logoUrl: null, bannerUrl: null, faviconUrl: null, timezone: TIMEZONE, businessHours: null,
  },
}
TENANTS.indisponivel = { ...TENANTS["barbearia-demo"], id: "t-indisp", name: "Barbearia Sem Agenda", slug: "indisponivel" }

const appointments = [] // { id, slug, professionalId, serviceId, start, end, customerId, name, phone, status, ... }
const customers = [] // { id, slug, name, phone, email, password }

// ------------------------------------------------------------------ utilidades
const pad = (n) => String(n).padStart(2, "0")
const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
const toTime = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
const instant = (date, time) => new Date(`${date}T${time}:00${UTC_OFFSET}`)
const weekdayOf = (date) => new Date(`${date}T12:00:00Z`).getUTCDay()

function nowInTz() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date())
  const get = (t) => parts.find((p) => p.type === t).value
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: toMinutes(`${get("hour")}:${get("minute")}`) }
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  })
  res.end(body === undefined ? undefined : JSON.stringify(body))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}") } catch { return {} }
}

function authCustomer(req, slug) {
  const token = (req.headers.authorization ?? "").replace(/^Bearer /, "")
  const id = token.startsWith("mock.") ? token.slice(5) : null
  return customers.find((c) => c.id === id && c.slug === slug) ?? null
}

const publicCustomer = ({ id, name, phone, email }) => ({ id, name, phone, email: email ?? null })

function toAppointmentJson(a) {
  const service = SERVICES.find((s) => s.id === a.serviceId)
  const professional = PROFESSIONALS.find((p) => p.id === a.professionalId)
  return {
    id: a.id, status: a.status, scheduledAt: a.start.toISOString(), endsAt: a.end.toISOString(), price: a.price,
    customerName: a.name, customerPhone: a.phone, cancelReason: a.cancelReason ?? null, canceledBy: a.canceledBy ?? null,
    createdAt: a.createdAt, service: { id: service.id, name: service.name, durationMinutes: service.durationMinutes },
    professional: { id: professional.id, name: professional.name, photoUrl: professional.photoUrl },
  }
}

// ------------------------------------------------- motor de disponibilidade (simulado)
function isFree(slug, professionalId, start, end) {
  return !appointments.some(
    (a) => a.slug === slug && a.professionalId === professionalId && a.status !== "cancelado" && a.start < end && start < a.end
  )
}

function freeSlots(slug, professionalIds, service, date) {
  const weekday = weekdayOf(date)
  if (weekday < 2) return [] // domingo e segunda: fechado
  const now = nowInTz()
  const slots = []
  for (let minutes = 9 * 60; minutes + service.durationMinutes <= 18 * 60; minutes += SLOT_STEP) {
    const startsInLunch = minutes < 13 * 60 && minutes + service.durationMinutes > 12 * 60
    if (startsInLunch) continue
    if (date < now.date || (date === now.date && minutes <= now.minutes)) continue
    const start = instant(date, toTime(minutes))
    const end = new Date(start.getTime() + service.durationMinutes * 60_000)
    if (professionalIds.some((id) => isFree(slug, id, start, end))) slots.push(toTime(minutes))
  }
  return slots
}

// ----------------------------------------------------------------------- rotas
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname
  const method = req.method

  if (method === "OPTIONS") return send(res, 204)

  let m
  // GET /booking/:slug
  if (method === "GET" && (m = path.match(/^\/booking\/([^/]+)$/))) {
    const tenant = TENANTS[m[1]]
    if (!tenant) return send(res, 404, { error: "Barbearia não encontrada" })
    return send(res, 200, { tenant, services: SERVICES, professionals: PROFESSIONALS })
  }

  // GET /booking/:slug/availability?serviceId=&professionalId=&date=
  if (method === "GET" && (m = path.match(/^\/booking\/([^/]+)\/availability$/))) {
    const slug = m[1]
    if (!TENANTS[slug]) return send(res, 404, { error: "Barbearia não encontrada" })
    if (slug === "indisponivel") return send(res, 404, { error: "Rota não encontrada" }) // como o backend real hoje
    const service = SERVICES.find((s) => s.id === url.searchParams.get("serviceId"))
    const date = url.searchParams.get("date") ?? ""
    if (!service || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return send(res, 400, { error: "Erro de validação" })
    const professionalId = url.searchParams.get("professionalId")
    const ids = professionalId ? [professionalId] : PROFESSIONALS.map((p) => p.id)
    if (professionalId && !PROFESSIONALS.some((p) => p.id === professionalId)) return send(res, 404, { error: "Profissional não encontrado" })
    await new Promise((r) => setTimeout(r, 250)) // latência, pra ver o estado de carregando
    return send(res, 200, freeSlots(slug, ids, service, date))
  }

  // POST /booking/:slug/appointments
  if (method === "POST" && (m = path.match(/^\/booking\/([^/]+)\/appointments$/))) {
    const slug = m[1]
    if (!TENANTS[slug]) return send(res, 404, { error: "Barbearia não encontrada" })
    const body = await readBody(req)
    const service = SERVICES.find((s) => s.id === body.serviceId)
    const customer = authCustomer(req, slug)
    const name = customer?.name ?? String(body.customerName ?? "").trim()
    const phone = customer?.phone ?? String(body.customerPhone ?? "").replace(/\D/g, "")
    if (!service || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || !/^\d{2}:\d{2}$/.test(body.time ?? "") || !name || !/^\d{10,11}$/.test(phone)) {
      return send(res, 400, { error: "Erro de validação", details: [{ message: "Dados do agendamento inválidos", path: "body" }] })
    }
    const candidates = body.professionalId ? [body.professionalId] : PROFESSIONALS.map((p) => p.id)
    if (body.professionalId && !PROFESSIONALS.some((p) => p.id === body.professionalId)) return send(res, 404, { error: "Profissional não encontrado" })
    const chosen = candidates.find((id) => freeSlots(slug, [id], service, body.date).includes(body.time))
    if (!chosen) return send(res, 409, { error: "Esse horário acabou de ser ocupado. Escolha outro." })
    const start = instant(body.date, body.time)
    const appointment = {
      id: randomUUID(), slug, professionalId: chosen, serviceId: service.id, start,
      end: new Date(start.getTime() + service.durationMinutes * 60_000), price: service.price,
      customerId: customer?.id ?? null, name, phone, status: "agendado", createdAt: new Date().toISOString(),
    }
    appointments.push(appointment)
    return send(res, 201, toAppointmentJson(appointment))
  }

  // Conta do cliente
  if (method === "POST" && (m = path.match(/^\/booking\/([^/]+)\/customer\/register$/))) {
    const slug = m[1]
    const body = await readBody(req)
    const phone = String(body.phone ?? "").replace(/\D/g, "")
    if (!body.name || !/^\d{10,11}$/.test(phone) || String(body.password ?? "").length < 6) return send(res, 400, { error: "Erro de validação", details: [{ message: "Dados inválidos", path: "body" }] })
    if (customers.some((c) => c.slug === slug && c.phone === phone)) return send(res, 400, { error: "Já existe uma conta com este telefone" })
    const customer = { id: randomUUID(), slug, name: body.name, phone, email: body.email ?? null, password: body.password }
    customers.push(customer)
    return send(res, 201, { token: `mock.${customer.id}`, customer: publicCustomer(customer) })
  }

  if (method === "POST" && (m = path.match(/^\/booking\/([^/]+)\/customer\/login$/))) {
    const slug = m[1]
    const body = await readBody(req)
    const phone = String(body.phone ?? "").replace(/\D/g, "")
    const customer = customers.find((c) => c.slug === slug && c.phone === phone && c.password === body.password)
    if (!customer) return send(res, 401, { error: "Telefone ou senha incorretos" })
    return send(res, 200, { token: `mock.${customer.id}`, customer: publicCustomer(customer) })
  }

  if (method === "GET" && (m = path.match(/^\/booking\/([^/]+)\/customer\/me$/))) {
    const customer = authCustomer(req, m[1])
    return customer ? send(res, 200, publicCustomer(customer)) : send(res, 401, { error: "Token inválido" })
  }

  if (method === "GET" && (m = path.match(/^\/booking\/([^/]+)\/customer\/appointments$/))) {
    const customer = authCustomer(req, m[1])
    if (!customer) return send(res, 401, { error: "Token inválido" })
    return send(res, 200, appointments.filter((a) => a.customerId === customer.id).map(toAppointmentJson))
  }

  if (method === "PATCH" && (m = path.match(/^\/booking\/([^/]+)\/customer\/appointments\/([^/]+)\/cancel$/))) {
    const customer = authCustomer(req, m[1])
    if (!customer) return send(res, 401, { error: "Token inválido" })
    const appointment = appointments.find((a) => a.id === m[2] && a.customerId === customer.id)
    if (!appointment) return send(res, 404, { error: "Agendamento não encontrado" })
    const body = await readBody(req)
    if (!String(body.reason ?? "").trim()) return send(res, 400, { error: "Erro de validação", details: [{ message: "O motivo do cancelamento é obrigatório", path: "reason" }] })
    if (appointment.status !== "agendado") return send(res, 400, { error: "Só é possível cancelar agendamentos com status “agendado”" })
    Object.assign(appointment, { status: "cancelado", cancelReason: String(body.reason).trim(), canceledBy: "customer" })
    return send(res, 200, toAppointmentJson(appointment))
  }

  // Só do mock: muda o status de um agendamento (simula a barbearia mexendo no painel).
  if (method === "POST" && (m = path.match(/^\/__mock\/appointments\/([^/]+)\/status$/))) {
    const appointment = appointments.find((a) => a.id === m[1])
    if (!appointment) return send(res, 404, { error: "Agendamento não encontrado" })
    const { status } = await readBody(req)
    appointment.status = status
    return send(res, 200, toAppointmentJson(appointment))
  }

  return send(res, 404, { error: "Rota não encontrada" })
})

server.listen(PORT, () => {
  console.log(`Mock do KirvoAgenda em http://localhost:${PORT}`)
  console.log("Barbearias: barbearia-demo · sem-marca · indisponivel")
})
