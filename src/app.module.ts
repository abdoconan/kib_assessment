import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { IntegrationModule } from './integration/integration.module';
import { QueueModule } from './queue/queue.module';
import { MoviesModule } from './movies/movies.module';


@Module({
  imports: [DatabaseModule, AuthModule, RedisModule, IntegrationModule, QueueModule, MoviesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
