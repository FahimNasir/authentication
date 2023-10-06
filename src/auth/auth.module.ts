import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, JwtService, MailService],
})
export class AuthModule {}
