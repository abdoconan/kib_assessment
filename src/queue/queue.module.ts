import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SyncProcessor } from './sync.processor';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { IntegrationModule } from 'src/integration/integration.module';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    BullModule.registerQueue({
      name: 'sync',
    }),
    IntegrationModule,
    MoviesModule,
  ],
  providers: [SyncProcessor, QueueService],
  exports: [],
  controllers: [QueueController],
})
export class QueueModule {}