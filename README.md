# be-shopee-order-hub

Configuração mínima para usar TypeScript + Express + CORS + MongoDB.

Quickstart

1. Instalar dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
# edite .env se necessário (MONGODB_URI)
```

3. Rodar em desenvolvimento:

```bash
npm run dev
```

Endpoints

- GET `/` → status do servidor
- GET `/api/ping` → health check (retorna { pong: true })
