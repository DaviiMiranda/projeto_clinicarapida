import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'clinica_user',
  password: process.env.DB_PASSWORD || 'clinica_pass',
  database: process.env.DB_NAME || 'clinica_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // ⚠️ APENAS PARA DESENVOLVIMENTO! Desabilitar em produção
  logging: true, // Habilita logs SQL para debug
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: false,
};

// DataSource para migrations (TypeORM CLI)
export const AppDataSource = new DataSource(typeOrmConfig as DataSourceOptions);
