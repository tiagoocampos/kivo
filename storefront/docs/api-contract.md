# Contrato de API — página pública de agendamento

O storefront foi construído **contra este contrato**. O backend do KirvoAgenda hoje só tem CRUD
autenticado do painel (`/tenant/me`, `/professionals`, `/services`); **nenhuma das rotas abaixo existe
ainda**. `scripts/mock-api.mjs` implementa tudo isto em memória (`npm run mock`) e serve de referência
executável. Se o backend divergir, ajustar em `src/services/` e `src/types/index.ts` — são os únicos
lugares que conhecem estes formatos.

Base: `VITE_BACKEND_API` (em dev, sem `.env`, cai em `http://localhost:3333`).
Erros seguem o padrão do backend: `{ "error": "mensagem" }` ou, em validação,
`{ "error": "Erro de validação", "details": [{ "message": "...", "path": "..." }] }`. O front mostra
`details[0].message` ou `error` num toast.

## Convenções de data e hora

- A agenda é sempre no **fuso da barbearia** (`tenant.timezone`, IANA — ex: `America/Sao_Paulo`), nunca no
  do aparelho do cliente. "Hoje", "aberto agora" e a grade de dias usam esse fuso.
- `date` é `"YYYY-MM-DD"` (dia no fuso da barbearia); `time` é `"HH:mm"` (24h, no mesmo fuso).
- Instantes que voltam da API (`scheduledAt`, `endsAt`) são **ISO 8601 em UTC**; o front os converte pro
  relógio da barbearia pra exibir.
- Preço sempre em **centavos**.
- Telefone vai pra API **só com dígitos** (10 ou 11, DDD + número), igual à validação do backend.

## Rotas públicas (sem login)

### `GET /booking/:slug`
Dados públicos da barbearia + o que ela oferece. `404` se o slug não existe.

```jsonc
{
  "tenant": {
    "id": "…", "name": "Barbearia do João", "slug": "barbearia-do-joao",
    "phone": "(54) 99906-7417",          // ou null
    "description": null, "address": "Rua das Flores, 123", "city": "Caxias do Sul", "instagramUrl": null,
    "logoUrl": null, "bannerUrl": null, "faviconUrl": null,   // qualquer um pode ser null (fallback genérico)
    "timezone": "America/Sao_Paulo",
    "businessHours": [ { "dayOfWeek": 2, "isClosed": false, "opensAt": "09:00", "closesAt": "18:00" } /* … 7 dias */ ]  // ou null
  },
  "services":      [ { "id": "…", "name": "Corte", "description": null, "durationMinutes": 30, "price": 4500 } ],
  "professionals": [ { "id": "…", "name": "Carlos", "photoUrl": null } ]   // só os ativos
}
```

### `GET /booking/:slug/availability?serviceId=&professionalId=&date=`
Horários livres do dia. `professionalId` **ausente = "qualquer profissional"** (união dos horários de todos).
Resposta: array de `"HH:mm"`, ordenado; `[]` se não há vaga.

```json
["09:00", "09:30", "10:00"]
```

> **Não existe no backend ainda.** O front trata `404`/`501` como "horários ainda não disponíveis pra
> agendamento online" (com o telefone da barbearia) e qualquer outra falha como "tentar novamente" —
> sem toast de erro em nenhum dos dois casos. O motor deve: descartar horário passado (se `date` é hoje),
> respeitar o expediente do profissional (`WorkingHours`) e não colidir com agendamento existente.

### `POST /booking/:slug/appointments`
Cria o agendamento. Sessão opcional: com `Authorization: Bearer <token de cliente>` o agendamento é da conta.

```jsonc
// request
{
  "serviceId": "…",
  "professionalId": "…",        // omitido = "qualquer profissional": o BACKEND escolhe quem estiver livre nesse horário
  "date": "2026-09-25", "time": "14:30",
  "customerName": "Cliente", "customerPhone": "54999067417"
}
// 201
{
  "id": "…", "status": "agendado",
  "scheduledAt": "2026-09-25T17:30:00.000Z", "endsAt": "2026-09-25T18:00:00.000Z",
  "price": 4500, "customerName": "Cliente", "customerPhone": "54999067417",
  "cancelReason": null, "canceledBy": null, "createdAt": "…",
  "service":      { "id": "…", "name": "Corte", "durationMinutes": 30 },
  "professional": { "id": "…", "name": "Carlos", "photoUrl": null }   // o profissional REAL (relevante no "qualquer")
}
```

**`409 Conflict`** quando o horário foi ocupado entre a consulta e a confirmação: o front avisa (toast com a
mensagem do backend), volta pra escolha de horário e recarrega a grade. É o único status com tratamento
especial — o backend deve usá-lo pra colisão de horário.

## Conta do cliente final (token `type: "customer"`, já suportado por `AuthenticateCustomer`)

| Rota | Body / resposta |
|---|---|
| `POST /booking/:slug/customer/register` | `{ name, phone, email?, password }` → `201 { token, customer }` |
| `POST /booking/:slug/customer/login` | `{ phone, password }` → `200 { token, customer }` |
| `GET  /booking/:slug/customer/me` | → `{ id, name, phone, email }` |
| `GET  /booking/:slug/customer/appointments` | → array de agendamentos (mesmo formato do `POST` acima) |
| `PATCH /booking/:slug/customer/appointments/:id/cancel` | `{ reason }` (obrigatório) → agendamento atualizado com `status: "cancelado"`, `canceledBy: "customer"` |

`customer` = `{ id, name, phone, email | null }`. A conta é **por barbearia** (mesma pessoa, uma conta em cada).
O cancelamento só é oferecido na UI enquanto `status === "agendado"` (regra já decidida); o backend deve
recusar os demais.

## O que está em aberto

- **Antecedência mínima** pra cancelar/remarcar: não decidida. O texto mostrado ao cliente é genérico e mora
  em `src/lib/bookingPolicy.ts` (trocar lá quando houver a regra).
- **Quanto tempo à frente** dá pra agendar: o front não limita (a navegação de semanas é livre); se houver
  um limite, o motor devolve `[]` além dele.
- **Notificação/lembrete** (push): fora desta fase; `src/sw.ts` só faz o precache do PWA.
