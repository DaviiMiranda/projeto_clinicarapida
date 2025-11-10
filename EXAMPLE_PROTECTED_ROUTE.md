# 🔒 Exemplo: Como Criar Rotas Protegidas

## Exemplo 1: Rota que requer apenas autenticação

```typescript
// consultas.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Consultas')
@Controller('consultas')
@UseGuards(JwtAuthGuard) // Todas as rotas deste controller exigem autenticação
@ApiBearerAuth()
export class ConsultasController {
  
  @Get('minhas')
  minhasConsultas(@CurrentUser() user: any) {
    // user contém: { id, email, name, role }
    return {
      message: `Consultas do usuário ${user.name}`,
      userId: user.id,
      role: user.role
    };
  }

  @Post()
  agendarConsulta(
    @CurrentUser() user: any,
    @Body() consultaDto: any
  ) {
    return {
      message: 'Consulta agendada',
      pacienteId: user.id,
      ...consultaDto
    };
  }
}
```

---

## Exemplo 2: Rota que requer role específica

```typescript
// medicos.controller.ts
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Médicos')
@Controller('medicos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MedicosController {
  
  // Apenas MEDICO pode acessar
  @Roles(UserRole.MEDICO)
  @Get('meus-horarios')
  meusHorarios() {
    return 'Horários do médico';
  }

  // Apenas ADMIN pode acessar
  @Roles(UserRole.ADMIN)
  @Post('aprovar')
  aprovarMedico() {
    return 'Médico aprovado pelo admin';
  }

  // ADMIN ou MEDICO podem acessar
  @Roles(UserRole.ADMIN, UserRole.MEDICO)
  @Get('relatorios')
  relatorios() {
    return 'Relatórios';
  }
}
```

---

## Exemplo 3: Rota pública + rota protegida no mesmo controller

```typescript
// pacientes.controller.ts
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pacientes')
export class PacientesController {
  
  // Rota PÚBLICA - sem guard
  @Get('lista')
  listarPacientes() {
    return 'Lista pública de pacientes';
  }

  // Rota PROTEGIDA - com guard
  @UseGuards(JwtAuthGuard)
  @Get('meu-perfil')
  meuPerfil(@CurrentUser() user: any) {
    return {
      message: 'Dados do paciente',
      user
    };
  }
}
```

---

## Exemplo 4: Service com lógica de autorização

```typescript
// consultas.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ConsultasService {
  constructor(private prisma: PrismaService) {}

  async buscarConsulta(consultaId: string, userId: string, userRole: UserRole) {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id: consultaId },
      include: {
        medico: true,
        paciente: true
      }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Verificar autorização
    const isAdmin = userRole === UserRole.ADMIN;
    const isMedicoResponsavel = consulta.medico.userId === userId;
    const isPaciente = consulta.paciente.userId === userId;

    if (!isAdmin && !isMedicoResponsavel && !isPaciente) {
      throw new ForbiddenException('Você não tem permissão para acessar esta consulta');
    }

    return consulta;
  }
}
```

---

## Testando as Rotas Protegidas

### 1. Obter Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "medico@test.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lZGljb0B0ZXN0LmNvbSIsInN1YiI6ImNiZTQ2OTFlLTAwNmYtNGY2MC05MjU3LWI1YTM5NTU0YmI3MiIsInJvbGUiOiJNRURJQ08iLCJpYXQiOjE3MzExNzk4NTEsImV4cCI6MTczMTc4NDY1MX0.abcdef...",
  "user": { ... }
}
```

### 2. Usar Token na Requisição
```bash
TOKEN="seu_token_aqui"

# Acessar rota protegida
curl -X GET http://localhost:3000/consultas/minhas \
  -H "Authorization: Bearer $TOKEN"

# Acessar rota com role específica
curl -X GET http://localhost:3000/medicos/meus-horarios \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💡 Dicas de Segurança

1. **Sempre valide as permissões no backend**, mesmo que o frontend esconda opções
2. **Não confie apenas no role do usuário** - valide a propriedade dos recursos
3. **Use HTTPS em produção** para proteger os tokens
4. **Implemente rate limiting** para prevenir ataques
5. **Armazene tokens de forma segura** no frontend (não use localStorage para dados sensíveis)

---

## 🚫 Erros Comuns

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Causa:** Token inválido, expirado ou não enviado.

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
**Causa:** Usuário autenticado mas sem permissão (role incorreto).

---

## 📝 Checklist para Criar Rota Protegida

- [ ] Adicionar `@UseGuards(JwtAuthGuard)` no controller ou método
- [ ] Usar `@CurrentUser()` decorator para obter dados do usuário
- [ ] Se precisar de role específico, adicionar `RolesGuard` e `@Roles()`
- [ ] Adicionar `@ApiBearerAuth()` no Swagger
- [ ] Validar propriedade dos recursos no service
- [ ] Testar com diferentes roles

✅ Agora você está pronto para criar rotas protegidas!
