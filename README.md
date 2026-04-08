# ViewX — Analisador de Reels do Instagram

Aplicação web full-stack que coleta os 20 Reels mais recentes de qualquer conta pública do Instagram e exibe as métricas de engajamento.

## Stack

- **Frontend / Backend**: Next.js 14 (App Router) + TypeScript
- **Scraper**: API interna do Instagram (os mesmos endpoints que o browser usa) — sem Playwright, sem Apify
- **Estilização**: Tailwind CSS
- **Deploy**: Docker + Docker Compose

## Funcionalidades

- Views, likes e comentários por Reel
- Data de publicação (formato relativo)
- Extração de legenda
- Detecção de cross-post para o Facebook com badge + link
- Cache em memória (TTL de 5 min) para evitar rate limiting
- Tratamento de erros tipado (perfil privado, usuário não encontrado, rate limit, sessão expirada)

## Pré-requisitos

- [Docker](https://www.docker.com/get-started) e Docker Compose
- Uma conta do Instagram (necessária para obter o cookie de sessão)

## Setup

### 1. Obter o session ID do Instagram

1. Abra o [instagram.com](https://www.instagram.com) no Chrome e faça login
2. Pressione **F12** → **Application** → **Storage** → **Cookies** → `https://www.instagram.com`
3. Copie o **Value** de cada cookie listado abaixo

### 2. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

Abra o `.env` e cole os três valores de cookies do seu browser:

```
INSTAGRAM_SESSION_ID=   # cookie: sessionid
INSTAGRAM_CSRF_TOKEN=   # cookie: csrftoken
INSTAGRAM_DS_USER_ID=   # cookie: ds_user_id
```

### 3. Rodar a aplicação

```bash
docker compose up --build
```

Acesse [http://localhost:3000](http://localhost:3000).

## Como usar

Digite um username público do Instagram (com ou sem `@`) e clique em **Search**. Os 20 Reels mais recentes são exibidos com suas métricas.

## API

```
GET /api/reels?username={username}
```

**Resposta de sucesso:**
```json
{
  "reels": [
    {
      "id": "3456789012345678901",
      "url": "https://www.instagram.com/reel/ABC123xyz/",
      "thumbnail": "https://scontent.cdninstagram.com/...",
      "caption": "Confira isso! #reels",
      "publishedAt": "2024-03-15T10:30:00.000Z",
      "views": 125000,
      "likes": 8400,
      "comments": 312,
      "crossPostedToFacebook": true,
      "facebookUrl": "https://www.facebook.com/reel/..."
    }
  ]
}
```

**Respostas de erro:**

| Status | Causa |
|--------|-------|
| 400 | Username ausente ou inválido |
| 401 | Session ID expirado — atualize o `.env` e reinicie |
| 403 | Conta privada |
| 404 | Usuário não encontrado |
| 429 | Rate limit do Instagram — aguarde alguns minutos |
| 500 | `INSTAGRAM_SESSION_ID` não configurado no ambiente |

## Decisão de arquitetura — Por que cookies?

Scraping autenticado do Instagram exige uma identidade válida. As alternativas consideradas foram:

- **Requisições anônimas** — bloqueadas pelo Instagram na maioria dos endpoints de Reels
- **Selenium / Playwright** — funcionam, mas exigem um browser headless rodando em produção: imagem Docker ~1 GB, consumo de memória alto, e a detecção de bots pelo Instagram é agressiva
- **Serviços de proxy / SERP APIs** — resolvem o problema, mas são pagos e violam a regra do desafio de não usar Apify ou similar
- **Cookies de sessão** — a mesma autenticação que o browser usa. Estável, leve, sem dependências extras

A escolha pelos cookies foi deliberada: o custo é um passo manual de configuração no `.env`, mas em troca o scraper é estável, roda em qualquer ambiente sem infraestrutura adicional, e a imagem Docker fica abaixo de 200 MB. Em produção real, esse passo seria substituído por um fluxo OAuth ou uma conta de serviço dedicada.

## Abordagem de scraping

A aplicação chama a mesma API REST interna que o frontend web do Instagram usa:

1. `GET /api/v1/users/web_profile_info/?username={username}` — resolve o ID numérico do usuário
2. `GET /api/v1/feed/user/{userId}/reels_media/?count=20` — busca o feed de Reels

As requisições são autenticadas com o cookie `sessionid` e incluem os headers padrão do browser (`X-IG-App-ID`, `Referer`, `X-Requested-With`) que o Instagram valida. Nenhum browser headless é necessário.

### Detecção de cross-post para o Facebook

Um Reel é marcado como cross-postado no Facebook quando qualquer um dos seguintes campos está presente na resposta da API:
- `has_shared_to_fb === 1`
- `crosspost_metadata.facebook_url` preenchido
- `fb_user_tags.in` não vazio

### Expiração do session ID

Session IDs expiram após aproximadamente 90 dias ou ao fazer logout. Quando isso acontece, a API retorna `401 AUTH_FAILED`. Para corrigir: obtenha um novo `sessionid` no seu browser, atualize o `.env` e rode `docker compose restart`.

## Desenvolvimento local

```bash
npm install
cp .env.example .env  # preencha com seu session ID
npm run dev
```

O servidor de desenvolvimento roda em [http://localhost:3000](http://localhost:3000).

## O que eu priorizei

Dado o escopo do desafio, priorizei o **backend** (camada de scraping) em detrimento do polimento visual do frontend.

O scraper usa a API interna do Instagram diretamente via `fetch` — sem bibliotecas de scraping de terceiros. O tratamento de erros é explícito e tipado de ponta a ponta: cada modo de falha (conta privada, sessão expirada, rate limit, usuário não encontrado, sem reels) mapeia para um tipo de erro específico em `src/lib/instagram.ts` e um status HTTP correspondente na rota da API.

O frontend é funcional e limpo, mas foi mantido intencionalmente simples para refletir a prioridade declarada.

