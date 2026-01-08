# 🚀 Guia de Deploy - Nanas Financial Control

Este guia explica como fazer o deploy gratuito da aplicação Nanas usando:
- **Frontend:** Vercel
- **Backend:** Render
- **Banco de Dados:** Neon (PostgreSQL)

---

## 📋 Pré-requisitos

1. Conta no [GitHub](https://github.com)
2. Conta no [Vercel](https://vercel.com) (pode logar com GitHub)
3. Conta no [Render](https://render.com) (pode logar com GitHub)
4. Conta no [Neon](https://neon.tech) (pode logar com GitHub)
5. Projeto configurado no [Firebase](https://console.firebase.google.com)

---

## 🗄️ Passo 1: Configurar Banco de Dados (Neon)

### 1.1 Criar conta e projeto
1. Acesse [Neon.tech](https://neon.tech) e crie uma conta
2. Clique em **Create Project**
3. Nome do projeto: `nanas-db`
4. Região: Escolha a mais próxima (ex: São Paulo)

### 1.2 Obter credenciais
Após criar, você receberá uma **Connection String** similar a:
```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

⚠️ **GUARDE ESSA STRING!** Você precisará dela no Render.

---

## ⚙️ Passo 2: Deploy do Backend (Render)

### 2.1 Preparar repositório
Certifique-se que seu código está no GitHub com:
- ✅ `Dockerfile` na pasta `nanas-backend/`
- ✅ `application.properties` usando variáveis de ambiente
- ✅ `firebase-adminsdk.json` no `.gitignore`

### 2.2 Criar Web Service no Render
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **New** → **Web Service**
3. Conecte ao GitHub e selecione o repositório
4. Configure:
   - **Name:** `nanas-backend`
   - **Region:** Oregon (ou mais próximo)
   - **Root Directory:** `nanas-backend`
   - **Runtime:** Docker
   - **Instance Type:** Free

### 2.3 Configurar variáveis de ambiente
Na seção **Environment Variables**, adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` |
| `DATABASE_USERNAME` | (usuário do Neon) |
| `DATABASE_PASSWORD` | (senha do Neon) |
| `CORS_ALLOWED_ORIGINS` | `https://seu-app.vercel.app` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JPA_DDL_AUTO` | `update` |

### 2.4 Configurar Firebase (IMPORTANTE!)
Para o Firebase funcionar no Render, você tem 2 opções:

**Opção A - Variável de ambiente (Recomendado):**
1. Abra o arquivo `firebase-adminsdk.json`
2. Copie TODO o conteúdo
3. No Render, adicione a variável:
   - Key: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: (cole o conteúdo do JSON)

4. Modifique `FirebaseConfig.java` para ler da variável:
```java
String credentialsJson = System.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON");
InputStream serviceAccount = new ByteArrayInputStream(credentialsJson.getBytes());
```

**Opção B - Secret File:**
1. No Render, vá em **Settings** → **Secret Files**
2. Crie um arquivo chamado `firebase-adminsdk.json`
3. Cole o conteúdo do JSON

### 2.5 Deploy
1. Clique em **Create Web Service**
2. Aguarde o build (pode levar 5-10 minutos)
3. Após sucesso, você terá uma URL como: `https://nanas-backend.onrender.com`

⚠️ **ATENÇÃO:** O plano gratuito do Render "dorme" após 15 minutos de inatividade. O próximo request pode demorar ~30 segundos.

---

## 🌐 Passo 3: Deploy do Frontend (Vercel)

### 3.1 Preparar repositório
Certifique-se que:
- ✅ `.env` está no `.gitignore`
- ✅ `.env.example` existe com as variáveis necessárias

### 3.2 Criar projeto no Vercel
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Add New** → **Project**
3. Importe o repositório do GitHub
4. Configure:
   - **Root Directory:** `nanas-frontend`
   - **Framework Preset:** Vite

### 3.3 Configurar variáveis de ambiente
Na seção **Environment Variables**, adicione:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://nanas-backend.onrender.com` |

### 3.4 Deploy
1. Clique em **Deploy**
2. Aguarde o build
3. Sua aplicação estará disponível em: `https://nanas-xxx.vercel.app`

### 3.5 Atualizar CORS no Backend
Após ter a URL do Vercel, volte ao Render e atualize:
- `CORS_ALLOWED_ORIGINS` = `https://nanas-xxx.vercel.app`

Clique em **Save Changes** para reiniciar o backend.

---

## 🔥 Passo 4: Configurar Firebase

### 4.1 Adicionar domínio autorizado
1. No [Firebase Console](https://console.firebase.google.com)
2. Vá em **Authentication** → **Settings** → **Authorized domains**
3. Adicione: `nanas-xxx.vercel.app` (seu domínio Vercel)

### 4.2 Atualizar firebase.ts no frontend
O arquivo `src/firebase.ts` deve estar configurado com suas credenciais Firebase.
**NUNCA commite este arquivo!** Ele está no `.gitignore`.

Para o Vercel, você pode usar variáveis de ambiente:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... outras configs
};
```

E adicione as variáveis no Vercel.

---

## ✅ Checklist Final

- [ ] Banco Neon criado e funcionando
- [ ] Backend no Render com todas variáveis configuradas
- [ ] Backend respondendo em `/actuator/health`
- [ ] Frontend no Vercel
- [ ] CORS configurado corretamente
- [ ] Firebase domains atualizados
- [ ] Testar login e criação de dados

---

## 🐛 Troubleshooting

### Backend não inicia
- Verifique os logs no Render
- Confirme que `DATABASE_URL` está correto
- Confirme que `firebase-adminsdk.json` está configurado

### CORS errors
- Verifique se `CORS_ALLOWED_ORIGINS` tem a URL **exata** do frontend
- Sem barra no final!
- Use `https://` e não `http://`

### Firebase auth errors
- Verifique se o domínio está autorizado no Firebase Console
- Confirme que as credenciais do SDK estão corretas

### Backend "dormindo" (cold start)
- Normal no plano gratuito do Render
- Primeira requisição após inatividade pode demorar 30+ segundos
- Para evitar: use UptimeRobot para pingar a cada 14 minutos

---

## 📊 Limites dos Planos Gratuitos

| Serviço | Limite |
|---------|--------|
| **Neon** | 500MB storage, 100 horas de compute/mês |
| **Render** | 750 horas/mês, sleep após 15min |
| **Vercel** | 100GB bandwidth/mês, builds ilimitados |

Para um projeto acadêmico, estes limites são mais que suficientes! 🎓
