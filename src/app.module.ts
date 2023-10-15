import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { AuthMiddleware } from './middlewares/auth.middleware';

import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [AuthModule, DatabaseModule, MailModule],
  controllers: [],
  providers: [JwtService],
})
export class AppModule implements NestModule {
  
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('api/auth/changePassword');
  }
}
