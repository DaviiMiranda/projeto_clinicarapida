# 🧪 Exemplos de Testes - TypeORM

## 📋 Cenários de Teste Completos

### ✅ Teste 1: Criar Usuário com Sucesso

**Comando:**
```bash
curl -X POST http://localhost:3000/users-typeorm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "medico@clinica.com",
    "name": "Dr. João Silva",
    "password": "senha123",
    "role": "MEDICO"
  }'
```

**Resposta esperada (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "medico@clinica.com",
  "name": "Dr. João Silva",
  "role": "MEDICO",
  "active": true,
  "createdAt": "2024-11-10T17:00:00.000Z",
  "updatedAt": "2024-11-10T17:00:00.000Z"
}
```

**Verificações:**
- ✅ Status 201 Created
- ✅ ID UUID gerado
- ✅ Senha NÃO retornada na resposta
- ✅ Role definido corretamente
- ✅ Active = true por padrão
- ✅ Timestamps automáticos

---

### ❌ Teste 2: Email Duplicado

**Comando:**
```bash
# Criar primeiro usuário
curl -X POST http://localhost:3000/users-typeorm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "name": "Teste 1",
    "password": "senha123"
  }'

# Tentar criar com mesmo email
curl -X POST http://localhost:3000/users-typeorm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "name": "Teste 2",
    "password": "senha456"
  }'
```

**Resposta esperada (409):**
```json
{
  "statusCode": 409,
  "message": "Email já cadastrado",
  "error": "Conflict"
}
```

---

### ❌ Teste 3: Validação de Email

**Comando:**
```bash
curl -X POST http://localhost:3000/users-typeorm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email-invalido",
    "name": "João Silva",
    "password": "senha123"
  }'
```

**Resposta esperada (400):**
```json
{
  "statusCode": 400,
  "message": ["Email inválido"],
  "error": "Bad Request"
}
```

---

### ❌ Teste 4: Senha Muito Curta

**Comando:**
```bash
curl -X POST http://localhost:3000/users-typeorm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "João Silva",
    "password": "123"
  }'
```

**Resposta esperada (400):**
```json
{
  "statusCode": 400,
  "message": ["Senha deve ter no mínimo 6 caracteres"],
  "error": "Bad Request"
}
```

---

### ✅ Teste 5: Listar Todos os Usuários

**Comando:**
```bash
curl http://localhost:3000/users-typeorm
```

**Resposta esperada (200):**
```json
[
  {
    "id": "uuid-1",
    "email": "admin@clinica.com",
    "name": "Administrador",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2024-11-10T17:00:00.000Z",
    "updatedAt": "2024-11-10T17:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "email": "medico@clinica.com",
    "name": "Dr. João Silva",
    "role": "MEDICO",
    "active": true,
    "createdAt": "2024-11-10T17:01:00.000Z",
    "updatedAt": "2024-11-10T17:01:00.000Z"
  }
]
```

---

### ✅ Teste 6: Buscar por ID

**Comando:**
```bash
# Substitua pelo UUID real
curl http://localhost:3000/users-typeorm/550e8400-e29b-41d4-a716-446655440000
```

**Resposta esperada (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "medico@clinica.com",
  "name": "Dr. João Silva",
  "role": "MEDICO",
  "active": true,
  "createdAt": "2024-11-10T17:00:00.000Z",
  "updatedAt": "2024-11-10T17:00:00.000Z"
}
```

---

### ❌ Teste 7: Buscar ID Inexistente

**Comando:**
```bash
curl http://localhost:3000/users-typeorm/00000000-0000-0000-0000-000000000000
```

**Resposta esperada (404):**
```json
{
  "statusCode": 404,
  "message": "Usuário com ID 00000000-0000-0000-0000-000000000000 não encontrado",
  "error": "Not Found"
}
```

---

### ✅ Teste 8: Atualizar Usuário

**Comando:**
```bash
# Substitua pelo UUID real
curl -X PATCH http://localhost:3000/users-typeorm/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. João Silva Atualizado",
    "role": "ADMIN"
  }'
```

**Resposta esperada (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "medico@clinica.com",
  "name": "Dr. João Silva Atualizado",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2024-11-10T17:00:00.000Z",
  "updatedAt": "2024-11-10T17:05:00.000Z"
}
```

**Verificações:**
- ✅ Nome atualizado
- ✅ Role atualizado
- ✅ `updatedAt` modificado automaticamente
- ✅ Outros campos mantidos

---

### ✅ Teste 9: Atualizar Senha

**Comando:**
```bash
curl -X PATCH http://localhost:3000/users-typeorm/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "novaSenha123"
  }'
```

**Verificações:**
- ✅ Senha hashada automaticamente
- ✅ Hash bcrypt aplicado
- ✅ Senha antiga invalidada

---

### ✅ Teste 10: Remover Usuário

**Comando:**
```bash
curl -X DELETE http://localhost:3000/users-typeorm/550e8400-e29b-41d4-a716-446655440000
```

**Resposta esperada (204):**
- Status: 204 No Content
- Body: vazio

---

### ❌ Teste 11: Remover ID Inexistente

**Comando:**
```bash
curl -X DELETE http://localhost:3000/users-typeorm/00000000-0000-0000-0000-000000000000
```

**Resposta esperada (404):**
```json
{
  "statusCode": 404,
  "message": "Usuário com ID 00000000-0000-0000-0000-000000000000 não encontrado",
  "error": "Not Found"
}
```

---

## 🗄️ Testes Direto no PostgreSQL

### Verificar Usuários Criados
```sql
SELECT id, email, name, role, active, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Verificar Hash de Senha
```sql
SELECT email, password FROM users WHERE email = 'teste@example.com';
```

**Verificação:**
- ✅ Senha deve começar com `$2b$` (bcrypt hash)
- ✅ Tamanho: ~60 caracteres

### Contar Usuários por Role
```sql
SELECT role, COUNT(*) as total 
FROM users 
GROUP BY role;
```

---

## 🔍 Verificar Logs SQL

Ao executar as requisições, você verá logs no terminal:

```
[Nest] LOG [TypeOrmModule] Starting TypeORM...
query: SELECT * FROM "users" WHERE "email" = $1
query: INSERT INTO "users"("email", "name", "password", "role", "active") 
       VALUES ($1, $2, $3, $4, $5) RETURNING "id", "created_at", "updated_at"
```

---

## 📊 Checklist de Testes

### Criação de Usuários
- [ ] Criar usuário PACIENTE
- [ ] Criar usuário MEDICO
- [ ] Criar usuário ADMIN
- [ ] Tentar email duplicado (deve falhar)
- [ ] Tentar email inválido (deve falhar)
- [ ] Tentar senha curta (deve falhar)
- [ ] Verificar hash de senha no banco

### Leitura
- [ ] Listar todos os usuários
- [ ] Buscar usuário por ID válido
- [ ] Buscar usuário por ID inválido (deve retornar 404)
- [ ] Verificar que senha não é retornada

### Atualização
- [ ] Atualizar nome
- [ ] Atualizar role
- [ ] Atualizar senha
- [ ] Verificar timestamp updatedAt
- [ ] Atualizar ID inexistente (deve retornar 404)

### Remoção
- [ ] Remover usuário existente
- [ ] Tentar remover novamente (deve retornar 404)
- [ ] Verificar remoção no banco

---

## 🎯 Testes de Carga (Opcional)

### Criar 100 Usuários
```bash
for i in {1..100}; do
  curl -X POST http://localhost:3000/users-typeorm \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"user${i}@test.com\",
      \"name\": \"User ${i}\",
      \"password\": \"senha123\"
    }" &
done
wait
```

### Verificar Performance
```sql
SELECT COUNT(*) FROM users;
SELECT pg_size_pretty(pg_total_relation_size('users'));
```

---

## 🐛 Debug de Erros

### Erro de Conexão
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Ver logs do container
docker logs clinica_postgres

# Testar conexão manual
docker exec -it clinica_postgres psql -U clinica_user -d clinica_db
```

### Erro de Schema
```sql
-- Verificar se tabela existe
SELECT tablename FROM pg_tables WHERE tablename = 'users';

-- Ver estrutura da tabela
\d users

-- Recriar tabela (⚠️ PERDA DE DADOS!)
DROP TABLE users;
-- Reinicie o servidor NestJS para recriar
```

---

## ✅ Resultado Esperado

Após executar todos os testes:

- ✅ Todos os endpoints funcionando
- ✅ Validações corretas
- ✅ Erros tratados adequadamente
- ✅ Senhas hashadas no banco
- ✅ Timestamps automáticos
- ✅ Constraints do banco respeitadas

---

## 📝 Script de Teste Automatizado

Crie um arquivo `test-typeorm.sh`:

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/users-typeorm"

echo "🧪 Testando TypeORM API"

# Teste 1: Criar usuário
echo "1. Criando usuário..."
RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "name": "Teste Silva",
    "password": "senha123"
  }')

USER_ID=$(echo $RESPONSE | jq -r '.id')
echo "✅ Usuário criado: $USER_ID"

# Teste 2: Listar usuários
echo "2. Listando usuários..."
curl -s $BASE_URL | jq
echo "✅ Listagem concluída"

# Teste 3: Buscar por ID
echo "3. Buscando usuário..."
curl -s $BASE_URL/$USER_ID | jq
echo "✅ Busca concluída"

# Teste 4: Atualizar
echo "4. Atualizando usuário..."
curl -s -X PATCH $BASE_URL/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste Atualizado"}' | jq
echo "✅ Atualização concluída"

# Teste 5: Remover
echo "5. Removendo usuário..."
curl -s -X DELETE $BASE_URL/$USER_ID
echo "✅ Remoção concluída"

echo "🎉 Todos os testes completados!"
```

**Executar:**
```bash
chmod +x test-typeorm.sh
./test-typeorm.sh
```

---

✅ **Todos os testes documentados e prontos para execução!**
