import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';

@Module({
  imports: [AuthModule, DatabaseModule, MailModule],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
