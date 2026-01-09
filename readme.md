# Render Service

Uma microserviço Node.js production-ready para renderizar templates HTML em imagens PNG usando Playwright e fazer upload para Supabase Storage.

## 📋 Requisitos

- Node.js 18+
- Docker (opcional, para containerização)
- Conta Supabase com Storage habilitado

## 🚀 Início Rápido

### Instalação Local

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

   Edite `.env` com suas configurações:
   ```env
   PORT=3000
   RENDER_TOKEN=seu-token-seguro-aqui
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta
   SUPABASE_BUCKET=creative-assets
   ```

3. **Inicie o servidor:**
   ```bash
   npm start
   ```

   Para desenvolvimento com auto-reload:
   ```bash
   npm run dev
   ```

4. **Teste a saúde do servidor:**
   ```bash
   curl http://localhost:3000/health
   ```

### Docker

1. **Build da imagem:**
   ```bash
   docker build -t render-service:1.0.0 .
   ```

2. **Execute o container:**
   ```bash
   docker run -d \
     --name render-service \
     -p 3000:3000 \
     -e PORT=3000 \
     -e RENDER_TOKEN=seu-token-seguro-aqui \
     -e SUPABASE_URL=https://seu-projeto.supabase.co \
     -e SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta \
     -e SUPABASE_BUCKET=creative-assets \
     render-service:1.0.0
   ```

3. **Verifique os logs:**
   ```bash
   docker logs render-service
   ```

4. **Teste a saúde:**
   ```bash
   curl http://localhost:3000/health
   ```

## 📡 API

### GET /health

Health check endpoint para monitoramento.

**Resposta:**
```json
{
  "ok": true
}
```

### POST /render

Renderiza um template HTML em imagem PNG e faz upload para Supabase Storage.

**Headers:**
```
Authorization: Bearer seu-render-token
Content-Type: application/json
```

**Body:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "template": "template_01",
  "title": "Bem-vindo!",
  "subtitle": "Crie conteúdo incrível em segundos",
  "cta": "Saiba Mais",
  "image_url": "https://exemplo.com/imagem.jpg"
}
```

**Resposta (200):**
```json
{
  "render_key": "jobs/550e8400-e29b-41d4-a716-446655440000/final.png",
  "render_url": "https://seu-projeto.supabase.co/storage/v1/object/public/creative-assets/jobs/550e8400-e29b-41d4-a716-446655440000/final.png"
}
```

**Erros:**

- `400 Bad Request` - Campos obrigatórios faltando
- `401 Unauthorized` - Token inválido ou ausente
- `500 Internal Server Error` - Erro ao renderizar ou fazer upload

```json
{
  "error": "error-message",
  "message": "Descrição detalhada do erro"
}
```

## 🔐 Segurança

### Autenticação

O endpoint `/render` requer um token Bearer no header `Authorization`:

```bash
curl -X POST http://localhost:3000/render \
  -H "Authorization: Bearer seu-render-token" \
  -H "Content-Type: application/json" \
  -d '{"job_id":"...","template":"template_01",...}'
```

**IMPORTANTE:** Nunca exponha seu `RENDER_TOKEN` em código ou logs.

### Variáveis de Ambiente

- `RENDER_TOKEN` - Token de autenticação para o endpoint `/render`
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase (secreto!)
- Logs nunca exibem secrets ou valores sensíveis

## 📁 Estrutura do Projeto

```
render-service/
├── index.js                    # Servidor Express
├── lib/
│   └── render.js              # Lógica de renderização
├── templates/
│   └── template_01.html       # Template padrão (1080x1080)
├── package.json               # Dependências
├── Dockerfile                 # Build Docker
├── .env.example               # Variáveis de exemplo
└── README.md                  # Este arquivo
```

## ⚙️ Configuração Supabase

1. **Crie um bucket** no Supabase Storage chamado `creative-assets` (ou use outro nome)
2. **Configure as permissões** para permitir uploads via API
3. **Obtenha a chave de serviço** em Projeto Settings → API → Service Role Key
4. **Defina as variáveis de ambiente** com a URL e chave

## 🎨 Templates

### Placeholders Disponíveis

Os templates suportam os seguintes placeholders que serão substituídos:

- `{{TITLE}}` - Título do render
- `{{SUBTITLE}}` - Subtítulo
- `{{CTA}}` - Texto do botão de ação
- `{{IMAGE_URL}}` - URL da imagem de fundo

### Criar Novo Template

1. Crie um arquivo em `templates/template_novo.html`
2. Use os placeholders acima
3. Dimensão recomendada: 1080x1080px
4. Use o template: `POST /render` com `"template": "template_novo"`

## 📊 Monitoramento

### Health Check

```bash
curl http://localhost:3000/health
```

### Docker Health Check

O Dockerfile inclui um health check automático que valida o servidor a cada 30 segundos.

### Logs

Logs são estruturados com prefixo `[LEVEL] mensagem`:

- `[SERVER]` - Informações do servidor
- `[RENDER]` - Status de renders
- `[ERROR]` - Erros

**Exemplo:**
```
[SERVER] render-service listening on port 3000
[RENDER] Starting render for job_id: 550e8400-e29b-41d4-a716-446655440000
[RENDER] Successfully completed job_id: 550e8400-e29b-41d4-a716-446655440000
```

## 🛠️ Desenvolvimento

### Variáveis de Desenvolvimento

```env
PORT=3000
RENDER_TOKEN=dev-token-123
SUPABASE_URL=https://seu-projeto-dev.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-dev
```

### Watch Mode

```bash
npm run dev
```

O servidor reiniciará automaticamente ao detectar alterações.

## 🐳 Deployment no EasyPanel

1. **Push do código** para seu repositório Git
2. **Configure as variáveis de ambiente** no EasyPanel:
   - `PORT=3000`
   - `RENDER_TOKEN=seu-token-seguro`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
3. **Defina o comando de build:**
   ```
   npm install
   ```
4. **Defina o comando de start:**
   ```
   npm start
   ```
5. **Configure a porta:** 3000
6. **Health check:**
   ```
   GET /health
   ```

## 📝 Licença

MIT

## 🤝 Suporte

Para problemas ou dúvidas, verifique:
- Logs do servidor (`docker logs render-service`)
- Variáveis de ambiente configuradas
- Token de autenticação válido
- Credenciais Supabase corretas
- Permissões no bucket Supabase
