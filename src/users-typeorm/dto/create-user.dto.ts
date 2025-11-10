import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEDICO = 'MEDICO',
  PACIENTE = 'PACIENTE',
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'senha123', description: 'Senha (mínimo 6 caracteres)' })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.PACIENTE, description: 'Papel do usuário' })
  @IsEnum(UserRole, { message: 'Role deve ser ADMIN, MEDICO ou PACIENTE' })
  @IsOptional()
  role?: UserRole;
}
