# Super Bom — Sistema de Fechamento de Caixa

Aplicativo web responsivo (mobile-first) para registro de fechamento de caixa diário da padaria **Super Bom 24h**.

---

## 🗂️ Estrutura do Projeto (Monorepo)

```
caixa/
├── apps/
│   ├── api/          # Backend Node.js + Express + TypeScript + Prisma (SQLite)
│   └── web/          # Frontend React + Vite + TypeScript + TailwindCSS
├── packages/
│   └── shared/       # Tipos e interfaces compartilhados (TypeScript)
├── package.json      # Raiz do monorepo (npm workspaces)
└── docker-compose.yml # Opcional - usado apenas se migrar para PostgreSQL
```

---

## 🚀 Como Rodar Localmente (Sem Docker)

O projeto usa **SQLite** como banco de dados local — zero instalação extra!

### 1. Instalar dependências

```powershell
npm install
```

### 2. Iniciar a API (Backend)

```powershell
# No diretório apps/api
cd apps/api
npm run dev
```

A API estará disponível em: `http://localhost:3000`

### 3. Iniciar o Frontend (novo terminal)

```powershell
# Na raiz do projeto
npm run dev:web
```

O frontend estará disponível em: `http://localhost:5173`

---

## 👤 Usuários Padrão (Seed)

| Função        | E-mail                      | Senha          |
|---------------|-----------------------------|----------------|
| Administrador | admin@superbom.local        | Admin@123      |
| Gerente       | gerente@superbom.local      | Gerente@123    |
| Supervisor    | supervisor@superbom.local   | Supervisor@123 |
| Caixa 1       | caixa1@superbom.local       | Caixa@123      |
| Caixa 2       | caixa2@superbom.local       | Caixa@123      |

> **Administradores** podem criar novos usuários, editar e excluir usuários existentes pela tela de Gerenciamento de Usuários.

---

## 🔐 Controle de Acesso por Papel (RBAC)

| Permissão                          | ADMIN | GERENTE | SUPERVISOR | CAIXA |
|------------------------------------|:-----:|:-------:|:----------:|:-----:|
| Login                              | ✅    | ✅      | ✅         | ✅    |
| Registrar novo fechamento          | ✅    | ✅      | —          | ✅    |
| Editar próprio fechamento (rascunho)| ✅   | ✅      | —          | ✅    |
| Enviar/Finalizar fechamento        | ✅    | ✅      | —          | ✅    |
| Ver todos os fechamentos           | ✅    | ✅      | ✅         | Próprios |
| Reabrir fechamento enviado         | ✅    | —       | ✅         | —     |
| Ver relatórios e exportar          | ✅    | ✅      | ✅         | —     |
| Criar/Editar/Excluir usuários      | ✅    | —       | —          | —     |
| Ver logs de auditoria              | ✅    | ✅      | ✅         | —     |

---

## 🗄️ Banco de Dados

O projeto usa **SQLite** por padrão (arquivo `apps/api/prisma/superbom.db`).

### Recriar o banco (se necessário)

```powershell
cd apps/api
npx prisma migrate dev --name init
# O seed é executado automaticamente após a migração
```

### Visualizar banco de dados

```powershell
cd apps/api
npx prisma studio
```

---

## 📦 Comandos Úteis

| Comando                        | O que faz                                    |
|--------------------------------|----------------------------------------------|
| `npm install`                  | Instala todas as dependências do monorepo     |
| `npm run dev:api`              | Inicia a API em modo desenvolvimento          |
| `npm run dev:web`              | Inicia o frontend em modo desenvolvimento     |
| `cd apps/api && npx prisma studio` | Interface visual do banco de dados       |

---

## 📱 Uso em Android WebView

Configure a URL base no `WebView` do aplicativo Android:

```
http://<IP_DO_SERVIDOR>:5173
```

> Certifique-se de que o servidor e o dispositivo Android estejam na mesma rede local (Wi-Fi).

---

## 🔄 Migrar para PostgreSQL (Produção)

1. Instale o Docker Desktop
2. Execute: `docker compose up -d`
3. Altere `apps/api/.env`: `DATABASE_URL="postgresql://superbom:superbom_password@localhost:5432/superbom_db"`
4. Altere `apps/api/prisma/schema.prisma`: `provider = "postgresql"`
5. Restaure os tipos `Decimal` e `@db.Text` no schema
6. Execute: `cd apps/api && npx prisma migrate dev --name postgres-init`
