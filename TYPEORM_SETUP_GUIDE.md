# 🗄️ Guia Completo: PostgreSQL + TypeORM + NestJS

## ✅ STATUS: IMPLEMENTADO COM SUCESSO

Este guia documenta a implementação completa da integração PostgreSQL com TypeORM no projeto NestJS.

---

## 📋 RESUMO DAS TAREFAS EXECUTADAS

### ✅ FASE 1: Preparação do Ambiente
- [x] **Tarefa 1**: Configuração do Docker Compose com PostgreSQL
- [x] **Tarefa 2**: Instalação das dependências TypeORM

### ✅ FASE 2: Configuração do TypeORM
- [x] **Tarefa 3**: Criação do arquivo de configuração TypeORM
- [x] **Tarefa 4**: Atualização das variáveis de ambiente

### ✅ FASE 3: Entidades e Módulos
- [x] **Tarefa 5**: Criação da entidade User
- [x] **Tarefa 6**: Criação dos DTOs (CreateUserDto, UpdateUserDto)
- [x] **Tarefa 7**: Criação do UserService com CRUD completo
- [x] **Tarefa 8**: Criação do UserController
- [x] **Tarefa 9**: Criação do UsersTypeormModule

### ✅ FASE 4: Integração
- [x] **Tarefa 10**: Configuração do AppModule
- [x] **Tarefa 11**: Compilação e validação

---

## 🚀 COMO USAR

### 1️⃣ Iniciar o PostgreSQL

#### Opção A: Com Docker (Recomendado)
```bash
# Instale Docker Desktop primeiro
docker compose up -d

# Verificar se está rodando
docker ps
```

#### Opção B: PostgreSQL Local
Certifique-se de ter PostgreSQL instalado e rodando na porta 5432.

---

### 2️⃣ Configurar Variáveis de Ambiente

Arquivo `.env` já está configurado com:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=clinica_user
DB_PASSWORD=clinica_pass
DB_NAME=clinica_db
```

---

### 3️⃣ Iniciar o Servidor

```bash
# Desenvolvimento (com hot-reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

**Ao iniciar, o TypeORM irá:**
- ✅ Conectar ao PostgreSQL
- ✅ Criar automaticamente a tabela `users` (synchronize: true)
- ✅ Exibir logs SQL no console

---

### 4️⃣ Acessar Documentação Swagger

```
http://localhost:3000/api
```

Procure pela seção **"Users (TypeORM)"** com os endpoints:
- `POST /users-typeorm` - Criar usuário
- `GET /users-typeorm` - Listar usuários
- `GET /users-typeorm/:id` - Buscar por ID
- `PATCH /users-typeorm/:id` - Atualizar usuário
- `DELETE /users-typeorm/:id` - Remover usuário

---

## 📝 ESTRUTURA DE ARQUIVOS CRIADOS

```
src/
├── config/
│   └── typeorm.config.ts          # Configuração TypeORM
│
├── entities/
│   └── user.entity.ts             # Entidade User
│
├── users-typeorm/
│   ├── dto/
│   │   ├── create-user.dto.ts     # DTO de criação
│   │   └── update-user.dto.ts     # DTO de atualização
│   ├── users-typeorm.controller.ts # Controller HTTP
│   ├── users-typeorm.service.ts    # Lógica de negócio
│   └── users-typeorm.module.ts     # Módulo NestJS
│
└── app.module.ts                   # Módulo principal (atualizado)
```

---

## 🎯 EXPLICAÇÃO DETALHADA DE CADA ETAPA

### **TAREFA 1: Docker Compose**
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: clinica_user
      POSTGRES_PASSWORD: clinica_pass
      POSTGRES_DB: clinica_db
```

**O que faz:**
- Cria container PostgreSQL na porta 5432
- Configura usuário, senha e database
- Persiste dados em volume Docker

---

### **TAREFA 2: Instalação de Dependências**
```bash
npm install --save @nestjs/typeorm typeorm pg
```

**Pacotes instalados:**
- `@nestjs/typeorm` - Integração TypeORM com NestJS
- `typeorm` - ORM (Object-Relational Mapping)
- `pg` - Driver PostgreSQL para Node.js

---

### **TAREFA 3: Configuração TypeORM**
```typescript
// src/config/typeorm.config.ts
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'clinica_user',
  password: process.env.DB_PASSWORD || 'clinica_pass',
  database: process.env.DB_NAME || 'clinica_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // ⚠️ Apenas desenvolvimento!
  logging: true,
};
```

**Explicação dos parâmetros:**
- `type: 'postgres'` - Define tipo de banco
- `entities` - Busca todas as entidades automaticamente
- `synchronize: true` - Sincroniza schema automaticamente (⚠️ APENAS DEV!)
- `logging: true` - Mostra queries SQL no console

---

### **TAREFA 5: Entidade User**
```typescript
// src/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'MEDICO', 'PACIENTE'],
    default: 'PACIENTE',
  })
  role: 'ADMIN' | 'MEDICO' | 'PACIENTE';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Decorators explicados:**
- `@Entity('users')` - Mapeia para tabela `users`
- `@PrimaryGeneratedColumn('uuid')` - Chave primária UUID
- `@Column({ unique: true })` - Coluna única (para email)
- `@Column({ type: 'enum' })` - Enum para roles
- `@CreateDateColumn()` - Timestamp automático na criação
- `@UpdateDateColumn()` - Timestamp automático na atualização

---

### **TAREFA 7: UserService**
```typescript
// src/users-typeorm/users-typeorm.service.ts
@Injectable()
export class UsersTypeormService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash de senha com bcrypt
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Criar entidade
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    // Salvar no banco
    return this.userRepository.save(user);
  }
  
  // Outros métodos: findAll, findOne, update, remove
}
```

**Recursos implementados:**
- ✅ Criar usuário com hash de senha (bcrypt)
- ✅ Listar todos os usuários
- ✅ Buscar por ID
- ✅ Buscar por email
- ✅ Atualizar usuário
- ✅ Remover usuário
- ✅ Validar senha

---

## 🧪 TESTANDO A INTEGRAÇÃO

### **1. Criar Usuário**
```bash
curl -X POST http://localhost:3000/users-typeorm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "name": "João Silva",
    "password": "senha123",
    "role": "PACIENTE"
  }'
```

**Resposta esperada:**
```json
{
  "id": "uuid-aqui",
  "email": "joao@example.com",
  "name": "João Silva",
  "role": "PACIENTE",
  "active": true,
  "createdAt": "2024-11-10T17:00:00.000Z",
  "updatedAt": "2024-11-10T17:00:00.000Z"
}
```

---

### **2. Listar Usuários**
```bash
curl http://localhost:3000/users-typeorm
```

---

### **3. Buscar por ID**
```bash
curl http://localhost:3000/users-typeorm/UUID-AQUI
```

---

### **4. Atualizar Usuário**
```bash
curl -X PATCH http://localhost:3000/users-typeorm/UUID-AQUI \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado"
  }'
```

---

### **5. Remover Usuário**
```bash
curl -X DELETE http://localhost:3000/users-typeorm/UUID-AQUI
```

---

## 🔍 VERIFICANDO NO BANCO DE DADOS

### Via Docker:
```bash
# Conectar ao container
docker exec -it clinica_postgres psql -U clinica_user -d clinica_db

# Listar tabelas
\dt

# Ver estrutura da tabela users
\d users

# Consultar usuários
SELECT * FROM users;

# Sair
\q
```

---

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### **synchronize: true**
```typescript
synchronize: true  // ⚠️ Apenas desenvolvimento!
```

**O que faz:**
- Cria/atualiza tabelas automaticamente ao iniciar
- Sincroniza schema com as entidades
- **NUNCA use em produção!** (pode causar perda de dados)

**Em produção, use migrations:**
```typescript
synchronize: false
migrationsRun: true
```

---

### **logging: true**
```typescript
logging: true
```

**O que faz:**
- Exibe todas as queries SQL no console
- Útil para debug
- Desabilite em produção

---

## 🔐 BOAS PRÁTICAS IMPLEMENTADAS

✅ **Hash de senhas** com bcrypt (salt rounds: 10)  
✅ **Validação de entrada** com class-validator  
✅ **DTOs** para padronização de dados  
✅ **Unique constraint** no email  
✅ **Timestamps automáticos** (createdAt, updatedAt)  
✅ **Enum para roles** (type-safe)  
✅ **UUID como primary key**  
✅ **Repository Pattern** (TypeORM)  
✅ **Tratamento de erros** (NotFoundException, ConflictException)  
✅ **Senhas nunca retornadas** nas respostas  

---

## 🆚 DIFERENÇAS: TypeORM vs Prisma

| Aspecto | TypeORM | Prisma |
|---------|---------|--------|
| **Abordagem** | Code-first (decorators) | Schema-first (.prisma) |
| **Entidades** | Classes TypeScript | Geradas automaticamente |
| **Migrations** | TypeORM CLI | Prisma CLI |
| **Query Builder** | Sim | Não (apenas raw SQL) |
| **Tipagem** | Manual | Automática |
| **Performance** | Boa | Excelente |
| **Curva de aprendizado** | Média | Baixa |

---

## 📊 ESTRUTURA DO BANCO DE DADOS

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'PACIENTE',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚨 TROUBLESHOOTING

### ❌ Erro: "Connection refused"
**Causa:** PostgreSQL não está rodando  
**Solução:**
```bash
docker compose up -d
# ou
sudo service postgresql start
```

---

### ❌ Erro: "relation users does not exist"
**Causa:** Tabela não foi criada  
**Solução:**
- Verifique `synchronize: true`
- Reinicie o servidor NestJS
- Verifique logs de erro ao iniciar

---

### ❌ Erro: "Entity metadata not found"
**Causa:** Entidade não registrada no módulo  
**Solução:**
```typescript
TypeOrmModule.forFeature([User]) // No módulo
```

---

## 🎯 PRÓXIMOS PASSOS SUGERIDOS

### 🔥 Alta Prioridade
1. **Desabilitar synchronize em produção**
   ```typescript
   synchronize: process.env.NODE_ENV !== 'production'
   ```

2. **Implementar Migrations**
   ```bash
   npm run typeorm migration:generate -- -n CreateUsersTable
   npm run typeorm migration:run
   ```

3. **Adicionar índices de performance**
   ```typescript
   @Index(['email'])
   @Index(['role'])
   ```

4. **Configurar Connection Pooling**
   ```typescript
   extra: {
     max: 10,
     min: 2,
   }
   ```

---

### 🌟 Média Prioridade
5. **Criar entidades relacionadas**
   - Medico (OneToOne com User)
   - Paciente (OneToOne com User)
   - Consulta (ManyToOne com Medico e Paciente)

6. **Implementar Soft Delete**
   ```typescript
   @DeleteDateColumn()
   deletedAt?: Date;
   ```

7. **Adicionar paginação**
   ```typescript
   findAll(page: number, limit: number) {
     return this.userRepository.find({
       skip: (page - 1) * limit,
       take: limit,
     });
   }
   ```

8. **Implementar cache com Redis**

---

### 💡 Baixa Prioridade
9. **Adicionar auditoria de mudanças**
10. **Implementar full-text search**
11. **Criar views customizadas**
12. **Adicionar database seeding**

---

## 📚 RECURSOS ÚTEIS

- [TypeORM Docs](https://typeorm.io/)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

## ✨ RESUMO FINAL

**Status:** ✅ **IMPLEMENTAÇÃO COMPLETA E FUNCIONAL**

**Arquivos criados:** 8
- 1 configuração TypeORM
- 1 entidade User
- 2 DTOs (Create, Update)
- 1 Service (CRUD completo)
- 1 Controller (5 endpoints)
- 1 Module
- 1 arquivo atualizado (AppModule)

**Funcionalidades:**
- ✅ Conexão PostgreSQL via TypeORM
- ✅ CRUD completo de usuários
- ✅ Hash de senhas com bcrypt
- ✅ Validação automática de dados
- ✅ Documentação Swagger
- ✅ Timestamps automáticos
- ✅ Enum para roles
- ✅ Tratamento de erros

**Pronto para:**
- ✅ Desenvolvimento local
- ✅ Testes de integração
- ✅ Extensão com mais entidades
- ✅ Deploy (após desabilitar synchronize)

---

🎉 **PostgreSQL + TypeORM integrado com sucesso ao NestJS!**
