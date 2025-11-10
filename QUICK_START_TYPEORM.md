# ⚡ Quick Start - TypeORM

## 🚀 Início Rápido em 3 Passos

### 1. Iniciar PostgreSQL
```bash
# Com Docker
docker compose up -d

# Verificar status
docker ps
```

### 2. Iniciar Servidor NestJS
```bash
npm run start:dev
```

### 3. Testar API
Acesse: http://localhost:3000/api

---

## 📝 Comandos Úteis

### Criar Usuário
```bash
curl -X POST http://localhost:3000/users-typeorm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "name": "Teste Silva",
    "password": "senha123",
    "role": "PACIENTE"
  }'
```

### Listar Usuários
```bash
curl http://localhost:3000/users-typeorm
```

### Buscar por ID
```bash
curl http://localhost:3000/users-typeorm/{UUID}
```

---

## 🗄️ Acessar PostgreSQL

```bash
# Entrar no container
docker exec -it clinica_postgres psql -U clinica_user -d clinica_db

# Comandos úteis
\dt              # Listar tabelas
\d users         # Ver estrutura da tabela
SELECT * FROM users;  # Ver todos os usuários
\q               # Sair
```

---

## 🔧 Variáveis de Ambiente

Arquivo `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=clinica_user
DB_PASSWORD=clinica_pass
DB_NAME=clinica_db
PORT=3000
```

---

## 📊 Estrutura da Tabela Users

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| email | VARCHAR | Único, obrigatório |
| name | VARCHAR | Nome completo |
| password | VARCHAR | Hash bcrypt |
| role | ENUM | ADMIN, MEDICO, PACIENTE |
| active | BOOLEAN | Status ativo |
| created_at | TIMESTAMP | Data criação |
| updated_at | TIMESTAMP | Data atualização |

---

## 🎯 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /users-typeorm | Criar usuário |
| GET | /users-typeorm | Listar todos |
| GET | /users-typeorm/:id | Buscar por ID |
| PATCH | /users-typeorm/:id | Atualizar |
| DELETE | /users-typeorm/:id | Remover |

---

## ⚠️ IMPORTANTE

- ✅ `synchronize: true` está habilitado (apenas desenvolvimento)
- ✅ Senhas são hashadas automaticamente com bcrypt
- ✅ Email deve ser único
- ✅ Senha mínimo 6 caracteres
- ⚠️ Desabilitar `synchronize` em produção!

---

## 🆘 Problemas Comuns

### Servidor não inicia
```bash
# Verificar se porta 3000 está livre
lsof -i :3000

# Matar processo
kill -9 {PID}
```

### Banco não conecta
```bash
# Verificar se PostgreSQL está rodando
docker ps

# Ver logs do container
docker logs clinica_postgres

# Reiniciar container
docker compose restart
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte: **TYPEORM_SETUP_GUIDE.md**
