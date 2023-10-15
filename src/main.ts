import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ApiResponseDto } from './common/dto/api-response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        const response = new ApiResponseDto(
          [],
          true,
          result[0].message,
          null,
          400,
        );
        return new BadRequestException(response);
      },
      stopAtFirstError: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
