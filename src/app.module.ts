import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
