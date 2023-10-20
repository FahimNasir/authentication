import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { AuthMiddleware } from './middlewares/auth.middleware';

import { MulterModule } from '@nestjs/platform-express';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [AuthModule, DatabaseModule, MailModule, FileUploadModule],
  controllers: [],
  providers: [JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('api/auth/changePassword');
  }
}
