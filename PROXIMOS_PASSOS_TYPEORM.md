# 🚀 Próximos Passos - TypeORM + PostgreSQL

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ PostgreSQL configurado via Docker
- ✅ TypeORM integrado com NestJS
- ✅ Entidade User completa
- ✅ CRUD completo de usuários
- ✅ Validação de dados com class-validator
- ✅ Hash de senhas com bcrypt
- ✅ Documentação Swagger
- ✅ Tratamento de erros
- ✅ Timestamps automáticos

---

## 🎯 ROADMAP DE EVOLUÇÃO

### 🔥 PRIORIDADE ALTA (Fazer Primeiro)

#### 1. **Desabilitar `synchronize` em Produção**
**Por que:** Evitar perda de dados em produção

```typescript
// src/config/typeorm.config.ts
export const typeOrmConfig: TypeOrmModuleOptions = {
  // ...outras configs
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};
```

**Adicionar ao .env:**
```env
NODE_ENV=development
```

---

#### 2. **Implementar Migrations**
**Por que:** Controle de versão do schema do banco

**Instalar:**
```bash
npm install -g typeorm
```

**Criar migration inicial:**
```bash
npm run typeorm migration:generate -- -n CreateUsersTable
```

**Executar migrations:**
```bash
npm run typeorm migration:run
```

**Adicionar scripts ao package.json:**
```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d src/config/typeorm.config.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

---

#### 3. **Adicionar Índices de Performance**
**Por que:** Melhorar velocidade de queries

```typescript
// src/entities/user.entity.ts
import { Entity, Column, Index } from 'typeorm';

@Entity('users')
@Index(['email']) // Índice único já existe, mas explícito
@Index(['role'])  // Buscar por role
@Index(['active']) // Filtrar ativos
export class User {
  // ... resto do código
}
```

---

#### 4. **Configurar Connection Pool**
**Por que:** Melhor performance e gerenciamento de conexões

```typescript
// src/config/typeorm.config.ts
export const typeOrmConfig: TypeOrmModuleOptions = {
  // ... outras configs
  extra: {
    max: 10,        // Máximo de conexões
    min: 2,         // Mínimo de conexões
    idle: 10000,    // Tempo de idle (ms)
    acquire: 30000, // Tempo máximo de aquisição (ms)
  },
};
```

---

### 🌟 PRIORIDADE MÉDIA (Melhorias Importantes)

#### 5. **Criar Relacionamentos (One-to-One)**
**Objetivo:** Implementar entidades Medico e Paciente relacionadas a User

```typescript
// src/entities/medico.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  crm: string;

  @Column()
  especialidade: string;

  @Column()
  telefone: string;

  @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// src/entities/user.entity.ts (atualizar)
@Entity('users')
export class User {
  // ... campos existentes

  @OneToOne(() => Medico, medico => medico.user)
  medico?: Medico;

  @OneToOne(() => Paciente, paciente => paciente.user)
  paciente?: Paciente;
}
```

---

#### 6. **Implementar Soft Delete**
**Por que:** Manter histórico de dados removidos

```typescript
// src/entities/user.entity.ts
import { DeleteDateColumn } from 'typeorm';

@Entity('users')
export class User {
  // ... campos existentes

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
```

**Usar no service:**
```typescript
async remove(id: string): Promise<void> {
  await this.userRepository.softDelete(id);
}

async restore(id: string): Promise<void> {
  await this.userRepository.restore(id);
}
```

---

#### 7. **Adicionar Paginação**
**Por que:** Melhor performance com grandes volumes

```typescript
// src/users-typeorm/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

```typescript
// src/users-typeorm/users-typeorm.service.ts
async findAll(paginationDto: PaginationDto) {
  const { page = 1, limit = 10 } = paginationDto;
  
  const [data, total] = await this.userRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

#### 8. **Implementar Filtros e Busca**
**Por que:** Facilitar localização de dados

```typescript
// src/users-typeorm/dto/filter-user.dto.ts
export class FilterUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  active?: boolean;
}
```

```typescript
// Service
async findAll(filterDto: FilterUserDto) {
  const query = this.userRepository.createQueryBuilder('user');

  if (filterDto.name) {
    query.where('user.name ILIKE :name', { 
      name: `%${filterDto.name}%` 
    });
  }

  if (filterDto.role) {
    query.andWhere('user.role = :role', { role: filterDto.role });
  }

  if (filterDto.active !== undefined) {
    query.andWhere('user.active = :active', { active: filterDto.active });
  }

  return query.getMany();
}
```

---

### 💡 PRIORIDADE BAIXA (Funcionalidades Avançadas)

#### 9. **Implementar Auditoria de Mudanças**
**Por que:** Rastrear quem fez o quê

```typescript
// src/entities/audit-log.entity.ts
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entity: string; // 'User', 'Medico', etc.

  @Column()
  entityId: string;

  @Column()
  action: 'CREATE' | 'UPDATE' | 'DELETE';

  @Column({ type: 'jsonb', nullable: true })
  oldValue: any;

  @Column({ type: 'jsonb', nullable: true })
  newValue: any;

  @Column()
  userId: string; // Quem fez a ação

  @CreateDateColumn()
  createdAt: Date;
}
```

---

#### 10. **Adicionar Cache com Redis**
**Por que:** Reduzir carga no banco de dados

**Instalar:**
```bash
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-store redis
```

**Configurar:**
```typescript
// src/app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 60, // 60 segundos
    }),
    // ... outros módulos
  ],
})
```

**Usar no service:**
```typescript
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject } from '@nestjs/common';

@Injectable()
export class UsersTypeormService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Tentar buscar no cache
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) return cached;

    // Buscar no banco
    const user = await this.userRepository.findOne({ where: { id } });
    
    // Salvar no cache
    await this.cacheManager.set(cacheKey, user, 300); // 5 minutos
    
    return user;
  }
}
```

---

#### 11. **Implementar Full-Text Search**
**Por que:** Busca avançada em textos

```typescript
// Migration para adicionar índice full-text
export class AddFullTextSearch implements Migration {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX users_name_fulltext_idx 
      ON users USING GIN(to_tsvector('portuguese', name));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX users_name_fulltext_idx;`);
  }
}
```

```typescript
// Service
async searchByName(searchTerm: string) {
  return this.userRepository.query(`
    SELECT * FROM users 
    WHERE to_tsvector('portuguese', name) @@ to_tsquery('portuguese', $1)
  `, [searchTerm]);
}
```

---

#### 12. **Adicionar Seeding de Dados**
**Por que:** Popular banco com dados iniciais

```typescript
// src/database/seeds/user.seed.ts
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

export const userSeeds: Partial<User>[] = [
  {
    email: 'admin@clinica.com',
    name: 'Administrador',
    password: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    active: true,
  },
  {
    email: 'medico@clinica.com',
    name: 'Dr. João Silva',
    password: bcrypt.hashSync('medico123', 10),
    role: 'MEDICO',
    active: true,
  },
];
```

**Script de seed:**
```typescript
// src/database/seeds/run-seeds.ts
import { AppDataSource } from '../../config/typeorm.config';
import { User } from '../../entities/user.entity';
import { userSeeds } from './user.seed';

async function runSeeds() {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);

  for (const seed of userSeeds) {
    const exists = await userRepository.findOne({ 
      where: { email: seed.email } 
    });
    
    if (!exists) {
      await userRepository.save(seed);
      console.log(`✅ Usuário ${seed.email} criado`);
    }
  }

  await AppDataSource.destroy();
}

runSeeds();
```

---

#### 13. **Implementar Transações**
**Por que:** Garantir integridade de operações múltiplas

```typescript
async createUserWithProfile(userData: CreateUserDto, profileData: any) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Criar user
    const user = await queryRunner.manager.save(User, userData);
    
    // Criar profile relacionado
    await queryRunner.manager.save(Medico, {
      ...profileData,
      userId: user.id,
    });

    await queryRunner.commitTransaction();
    return user;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

---

#### 14. **Implementar Rate Limiting**
**Por que:** Proteger API de abuso

```bash
npm install @nestjs/throttler
```

```typescript
// src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,    // 60 segundos
      limit: 10,  // 10 requisições
    }),
    // ... outros módulos
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
```

---

## 📊 CRONOGRAMA SUGERIDO

### Semana 1
- [ ] Desabilitar synchronize em produção
- [ ] Implementar migrations básicas
- [ ] Adicionar índices de performance
- [ ] Configurar connection pool

### Semana 2
- [ ] Criar entidades Medico e Paciente
- [ ] Implementar relacionamentos One-to-One
- [ ] Adicionar soft delete
- [ ] Implementar paginação

### Semana 3
- [ ] Adicionar filtros de busca
- [ ] Implementar auditoria
- [ ] Adicionar cache com Redis
- [ ] Implementar seeding

### Semana 4
- [ ] Full-text search
- [ ] Transações complexas
- [ ] Rate limiting
- [ ] Otimizações finais

---

## 📚 RECURSOS DE APRENDIZADO

### Documentação Oficial
- [TypeORM Docs](https://typeorm.io/)
- [NestJS TypeORM](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Tutoriais Recomendados
- [TypeORM Migrations](https://typeorm.io/migrations)
- [NestJS Advanced Patterns](https://docs.nestjs.com/fundamentals/custom-providers)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Ferramentas Úteis
- [DBeaver](https://dbeaver.io/) - Cliente SQL
- [Postman](https://www.postman.com/) - Testar API
- [TypeORM CLI](https://typeorm.io/using-cli) - Gerenciar migrations

---

## ✅ CHECKLIST FINAL

### Antes de Produção
- [ ] Desabilitar synchronize
- [ ] Configurar migrations
- [ ] Adicionar índices
- [ ] Configurar backup automático
- [ ] Implementar monitoring
- [ ] Configurar SSL no PostgreSQL
- [ ] Revisar logs de segurança
- [ ] Testar recovery de desastres
- [ ] Documentar procedimentos de deploy

### Performance
- [ ] Configurar connection pool
- [ ] Adicionar cache Redis
- [ ] Otimizar queries N+1
- [ ] Implementar paginação
- [ ] Adicionar índices compostos

### Segurança
- [ ] Rate limiting
- [ ] Validação rigorosa de entrada
- [ ] Sanitização de dados
- [ ] Auditoria de ações
- [ ] Criptografia de dados sensíveis

---

## 🎉 CONCLUSÃO

Você tem uma base sólida com TypeORM + PostgreSQL! Os próximos passos vão transformar seu projeto em uma aplicação pronta para produção.

**Priorize:**
1. Segurança (migrations, validações)
2. Performance (índices, cache)
3. Funcionalidades (relacionamentos, filtros)

**Lembre-se:**
- Sempre testar mudanças em desenvolvimento
- Fazer backup antes de migrations
- Monitorar performance do banco
- Documentar decisões técnicas

---

✨ **Bom desenvolvimento!**
