import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersTypeormModule } from './users-typeorm/users-typeorm.module';

// Módulos Prisma (mantidos para compatibilidade temporária)
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // TypeORM Configuration
    TypeOrmModule.forRoot(typeOrmConfig),
    
    // TypeORM Modules
    UsersTypeormModule,
    
    // Prisma Modules (legacy)
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
