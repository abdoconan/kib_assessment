import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { RedisModule } from 'src/redis/redis.module';
import { MoviesController } from './movies.controller';


@Module({
  imports: [RedisModule],
  providers: [MoviesService],
  exports: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
