# Informações Importantes para Deploy

## 📝 Antes de Começar

### 1. Firebase Admin SDK (CRÍTICO!)
Você precisará do conteúdo completo do arquivo `firebase-adminsdk.json` para configurar no Render.

**Como obter:**
```bash
# No terminal, execute:
cat nanas-backend/src/main/resources/firebase-adminsdk.json
```

Copie TODO o conteúdo (é um JSON grande). Você vai colar isso como variável de ambiente no Render.

### 2. Commit para GitHub
Antes de fazer deploy, certifique-se que todo código está no GitHub:

```bash
# Verifique o status
git status

# Adicione as mudanças
git add .

# Commit
git commit -m "Refatoração completa para deploy em produção"

# Push para GitHub
git push origin main
```

### 3. Ordem Recomendada
1. **Neon** (banco) → Você precisa da connection string
2. **Render** (backend) → Você precisa da URL do backend
3. **Vercel** (frontend) → Você precisa da URL do frontend
4. **Ajustes** → Atualizar CORS e Firebase

---

## 🗄️ Passo 1: Neon (PostgreSQL)

1. Acesse https://neon.tech
2. Crie uma conta (pode usar GitHub)
3. Clique em **Create Project**
4. Nome: `nanas-db`
5. Região: **São Paulo** (ou mais próxima)
6. Após criar, copie a **Connection String** que aparece

A string será algo como:
```
postgresql://nanas_user:AbC123XyZ@ep-cool-name-123456.us-east-2.aws.neon.tech/nanas_db?sslmode=require
```

**GUARDE ESSA STRING!** Você vai precisar dela no Render.

---

## ⚙️ Passo 2: Render (Backend)

### 2.1 Criar Web Service
1. Acesse https://dashboard.render.com
2. Clique em **New** → **Web Service**
3. Conecte ao GitHub e selecione o repositório `Nanas`
4. Configure:
   - **Name:** `nanas-backend`
   - **Region:** Oregon (Free)
   - **Root Directory:** `nanas-backend`
   - **Runtime:** Docker
   - **Instance Type:** Free

### 2.2 Variáveis de Ambiente
Clique em **Advanced** e adicione:

#### DATABASE_URL
```
jdbc:postgresql://ep-xxx.neon.tech/nanas_db?sslmode=require
```
(Pegue da connection string do Neon e adicione `jdbc:` no início)

#### DATABASE_USERNAME
```
nanas_user
```
(Extraia da connection string do Neon - parte antes do `@`)

#### DATABASE_PASSWORD
```
AbC123XyZ
```
(Extraia da connection string do Neon - parte depois de `:` e antes de `@`)

#### GOOGLE_APPLICATION_CREDENTIALS_JSON
Cole TODO o conteúdo do `firebase-adminsdk.json` aqui.

#### CORS_ALLOWED_ORIGINS
```
http://localhost:5173
```
(Vamos atualizar depois com a URL do Vercel)

#### SPRING_PROFILES_ACTIVE
```
prod
```

#### JPA_DDL_AUTO
```
update
```

### 2.3 Deploy
1. Clique em **Create Web Service**
2. Aguarde o build (5-10 minutos)
3. Após sucesso, copie a URL: `https://nanas-backend-xxx.onrender.com`

---

## 🌐 Passo 3: Vercel (Frontend)

### 3.1 Criar Projeto
1. Acesse https://vercel.com/dashboard
2. Clique em **Add New** → **Project**
3. Importe o repositório do GitHub
4. Configure:
   - **Root Directory:** `nanas-frontend`
   - **Framework Preset:** Vite

### 3.2 Variável de Ambiente
Adicione:

**VITE_API_BASE_URL**
```
https://nanas-backend-xxx.onrender.com
```
(Use a URL que você copiou do Render)

### 3.3 Deploy
1. Clique em **Deploy**
2. Aguarde o build
3. Copie a URL: `https://nanas-xxx.vercel.app`

---

## 🔄 Passo 4: Ajustes Finais

### 4.1 Atualizar CORS no Render
1. Volte ao Render Dashboard
2. Vá em **Environment**
3. Edite `CORS_ALLOWED_ORIGINS`:
```
https://nanas-xxx.vercel.app
```
(Use a URL exata do Vercel, SEM barra no final)

4. Clique em **Save Changes** (vai reiniciar automaticamente)

### 4.2 Firebase Console
1. Acesse https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Clique em **Add domain**
5. Adicione: `nanas-xxx.vercel.app` (sem https://)

---

## ✅ Teste Final

1. Acesse a URL do Vercel: `https://nanas-xxx.vercel.app`
2. Faça login com suas credenciais
3. Tente criar uma carteira ou transação
4. Verifique se os dados aparecem

**Se tudo funcionar, parabéns! 🎉 Seu app está no ar!**

---

## 🐛 Problemas Comuns

### Backend não inicia no Render
- Verifique os logs no Render
- Confirme que todas variáveis de ambiente estão corretas
- Verifique se o `firebase-adminsdk.json` foi colado corretamente

### CORS errors
- Certifique-se que `CORS_ALLOWED_ORIGINS` tem a URL EXATA do Vercel
- Sem `http://`, apenas `https://`
- Sem barra `/` no final

### Firebase auth errors
- Verifique se o domínio do Vercel está em "Authorized domains"
- Aguarde alguns minutos após adicionar o domínio

### Backend "dormindo"
- Normal no plano gratuito
- Primeira requisição pode demorar 30+ segundos
- Para evitar: use UptimeRobot para pingar a cada 14 minutos
