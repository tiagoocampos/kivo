# KirvoAgenda — Storefront (página pública de agendamento)

O que o cliente final abre pelo link da barbearia (`/:slug`): escolhe serviço, profissional, dia e
horário, confirma, e (opcionalmente) tem conta pra ver e cancelar os próprios agendamentos.

React 19 + Vite 8 + TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · react-router-dom · axios ·
react-hook-form + zod · next-themes · vite-plugin-pwa.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
```

Sem `.env`, em desenvolvimento o front usa o backend em `http://localhost:3333`. Para apontar pra outro:

```bash
# .env (ignorado pelo git)
VITE_BACKEND_API=http://localhost:3333
```

O backend precisa listar a origem do front em `ALLOWED_ORIGINS` (CORS).

### Sem o backend: mock

As rotas públicas (`/booking/...`) **ainda não existem no backend** — ver [`docs/api-contract.md`](docs/api-contract.md).
Pra usar e testar o fluxo inteiro mesmo assim:

```bash
npm run mock       # API de mentira na porta 3333 (PORT=... pra mudar)
npm run dev
```

Barbearias de exemplo: `/barbearia-demo` (completa), `/sem-marca` (sem logo/banner/telefone/horários —
testa os fallbacks) e `/indisponivel` (endpoint de horários responde 404, como está hoje no backend real).

### Scripts

| | |
|---|---|
| `npm run build` | `tsc -b && vite build` (gera também o service worker) |
| `npm test` | vitest — datas por fuso, horário de funcionamento, telefone, dinheiro, regras de status |
| `npm run lint` | oxlint |

## Como o fluxo funciona

Uma tela só (`BookingPage`), sem trocar de rota entre etapas: **Serviço → Profissional → Data e hora →
Confirmar**, depois a tela de confirmação. O estado da seleção vive em `context/BookingContext`.

- Escolher serviço/profissional já leva à próxima etapa pendente; mudar uma escolha invalida só o que
  depende dela (o horário nunca sobrevive a uma troca de serviço, profissional ou dia).
- A barra fixa inferior mostra o resumo ("Corte de cabelo · Ter, 22/09 · 09:30"), abre a revisão com
  "Alterar" e traz o botão "Continuar" / "Confirmar agendamento".
- **Fuso**: dia e horário são sempre os da barbearia (`tenant.timezone`), não os do aparelho.
- **Horário ocupado (409)** entre a consulta e a confirmação: avisa, volta pra escolha de horário e recarrega.
- **Disponibilidade ausente/fora do ar**: mensagem clara + telefone da barbearia (404/501) ou "tentar
  novamente" (rede) — sem toast de erro.
- **Conta opcional**: convidado informa nome e telefone; logado é identificado pela conta. Sessão em
  `localStorage`, isolada por barbearia (`kirvo_customer_session:<slug>`).

## Identidade visual

A aparência é da **barbearia**, não do KirvoAgenda: logo, banner e favicon vêm do tenant, e qualquer um
pode faltar — o fallback é o nome em texto + ícone genérico (`components/TenantAvatar`), nunca imagem quebrada.

As cores são variáveis CSS em `src/index.css` (paleta neutra cinza-azulada). Uma barbearia troca a marca
sobrescrevendo **`--brand`** (barra do topo e menu) e **`--primary`** (botões e destaques) — nenhum
componente tem cor fixa. A personalização por barbearia ainda não está implementada; ao trocar `--brand`,
atualizar também `src/lib/theme.ts` (usado pelo manifest do PWA, que não enxerga CSS).

## PWA

Cada barbearia instala "o app dela": o manifest é gerado na hora (`lib/pwaManifest.ts`) com nome, ícone
(logo ou o ícone genérico) e `start_url` da barbearia. `/:slug/instalar` é a página de instalação
(`InstallAppPage`). O service worker (`src/sw.ts`) só faz o precache do app.

## Decisões pra revisar

- **Data e horário na mesma tela**: são duas etapas no roteiro original, mas escolher o dia e ver os
  horários logo abaixo evita um passo a mais. Os componentes (`DatePicker`, `TimeSlotPicker`) são separados.
- **Política de cancelamento**: texto genérico em `src/lib/bookingPolicy.ts` até a antecedência mínima ser decidida.
- **`.env.example` não existe** (o `.gitignore` da raiz ignora qualquer arquivo env, por pedido) — a única
  variável é `VITE_BACKEND_API`, documentada acima.
