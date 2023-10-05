import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Database connected successfully!');
    } catch (ex) {
      console.error(ex);
    }
  }

  enableShutdownHooks(app: INestApplication) {
    process?.on('beforeExit', async () => {
      await app.close();
    });
  }
}
