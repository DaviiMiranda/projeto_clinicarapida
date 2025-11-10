# 🔐 Documentação de Autenticação JWT - Clínica Rápida

## ✅ Implementação Completa

A autenticação JWT foi implementada com sucesso no projeto. O sistema utiliza:

- **JWT (JSON Web Tokens)** para autenticação stateless
- **Bcrypt** para hash de senhas
- **Passport** com estratégias Local e JWT
- **Class-validator** para validação de dados
- **Role-based Access Control (RBAC)** com três níveis: ADMIN, MEDICO, PACIENTE

---

## 📁 Estrutura de Arquivos Criados

```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts          # Validação de login
│   │   └── register.dto.ts       # Validação de registro
│   ├── strategies/
│   │   ├── local.strategy.ts     # Estratégia de login (email/senha)
│   │   └── jwt.strategy.ts       # Estratégia JWT (validação de token)
│   ├── auth.controller.ts        # Endpoints de autenticação
│   ├── auth.service.ts           # Lógica de autenticação
│   └── auth.module.ts            # Módulo de autenticação
│
├── users/
│   ├── users.service.ts          # Serviço de usuários
│   └── users.module.ts           # Módulo de usuários
│
├── prisma/
│   ├── prisma.service.ts         # Serviço Prisma (DB)
│   └── prisma.module.ts          # Módulo global Prisma
│
└── common/
    ├── guards/
    │   ├── jwt-auth.guard.ts     # Proteção de rotas autenticadas
    │   ├── local-auth.guard.ts   # Guard de login
    │   └── roles.guard.ts        # Proteção por role
    └── decorators/
        ├── roles.decorator.ts    # Decorator @Roles()
        └── current-user.decorator.ts  # Decorator @CurrentUser()
```

---

## 🚀 Como Usar

### 1. **Iniciar o Servidor**

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### 2. **Acessar Documentação Swagger**
```
http://localhost:3000/api
```

---

## 🔑 Endpoints Disponíveis

### **POST /auth/register**
Registrar novo usuário

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123",
  "name": "João Silva",
  "role": "PACIENTE"
}
```

**Roles disponíveis:** `ADMIN`, `MEDICO`, `PACIENTE`

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "João Silva",
    "role": "PACIENTE"
  }
}
```

---

### **POST /auth/login**
Fazer login

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "João Silva",
    "role": "PACIENTE"
  }
}
```

---

### **GET /auth/profile**
Obter perfil do usuário autenticado (requer token)

**Headers:**
```
Authorization: Bearer {seu_token_jwt}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "João Silva",
  "role": "PACIENTE",
  "active": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "medico": null,
  "paciente": {
    "id": "uuid",
    "cpf": "12345678900",
    "telefone": "(11) 99999-9999"
  }
}
```

---

## 🛡️ Como Proteger Rotas

### **Proteção Básica (Usuário Autenticado)**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('consultas')
export class ConsultasController {
  
  @UseGuards(JwtAuthGuard)
  @Get()
  minhasConsultas(@CurrentUser() user: any) {
    console.log(user); // { id, email, name, role }
    return `Consultas do usuário ${user.name}`;
  }
}
```

### **Proteção por Role (ADMIN, MEDICO, PACIENTE)**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  dashboard() {
    return 'Apenas administradores podem acessar';
  }

  @Roles(UserRole.ADMIN, UserRole.MEDICO)
  @Get('relatorios')
  relatorios() {
    return 'Admins e médicos podem acessar';
  }
}
```

---

## 🧪 Testando com cURL

### **1. Registrar Usuário**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@test.com",
    "password": "senha123",
    "name": "Maria Silva",
    "role": "PACIENTE"
  }'
```

### **2. Fazer Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@test.com",
    "password": "senha123"
  }'
```

### **3. Acessar Perfil (com token)**
```bash
# Substitua SEU_TOKEN pelo token recebido no login
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🔧 Variáveis de Ambiente

Configure no arquivo `.env`:

```env
DATABASE_URL="postgresql://clinica_user:clinica_pass@localhost:5432/clinica_db?schema=public"
JWT_SECRET="clinica_rapida_jwt_secret_key_change_in_production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

⚠️ **IMPORTANTE:** Altere `JWT_SECRET` em produção para uma chave segura!

---

## 📊 Schema do Banco de Dados

O modelo User no Prisma:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  medico   Medico?
  paciente Paciente?
}

enum UserRole {
  ADMIN
  MEDICO
  PACIENTE
}
```

---

## 🎯 Próximos Passos Sugeridos

1. **Implementar Refresh Token** para renovação automática
2. **Adicionar Rate Limiting** para prevenir ataques de força bruta
3. **Implementar Recuperação de Senha** via email
4. **Adicionar Verificação de Email** no registro
5. **Criar Logs de Auditoria** para ações sensíveis
6. **Implementar 2FA (Two-Factor Authentication)**

---

## ❓ Troubleshooting

### Erro: "Module @prisma/client has no exported member 'UserRole'"
**Solução:** Execute `npx prisma generate` para gerar o cliente Prisma

### Erro: "Credenciais inválidas"
**Solução:** Verifique se o email e senha estão corretos. Senhas são armazenadas com hash bcrypt.

### Erro: "Unauthorized"
**Solução:** Verifique se o token JWT está sendo enviado no header `Authorization: Bearer {token}`

---

## 📚 Recursos Úteis

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js](http://www.passportjs.org/)
- [JWT.io - Debug tokens](https://jwt.io/)
- [Prisma Docs](https://www.prisma.io/docs/)

---

**✅ Implementação concluída com sucesso!**
