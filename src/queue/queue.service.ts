import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('sync') private syncQueue: Queue) {}

  async triggerMovieGenreSync() {
    await this.syncQueue.add('movie-sync', {});
  }
}