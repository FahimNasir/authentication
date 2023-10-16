import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ApiResponseDto } from './common/dto/api-response.dto';

const allowedOrigins = [
  'http://localhost:3000',
  // Add other allowed origins if needed
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      console.log('Origin', origin);
      // Check if the origin is in the list of allowed origins
      if (allowedOrigins.includes(origin) || !origin) {
        console.log('Success');
        callback(null, true);
      } else {
        console.log(origin);
        console.log('Error');
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

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
  await app.listen(4000);
}
bootstrap();
