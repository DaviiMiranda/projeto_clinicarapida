import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersTypeormService } from './users-typeorm.service';
import { UsersTypeormController } from './users-typeorm.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersTypeormController],
  providers: [UsersTypeormService],
  exports: [UsersTypeormService],
})
export class UsersTypeormModule {}
