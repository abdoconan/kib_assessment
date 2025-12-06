import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { IntegrationService } from 'src/integration/integration.service';
import { MoviesService } from 'src/movies/movies.service';

@Processor('sync')
export class SyncProcessor extends WorkerHost {
    constructor(private readonly integration: IntegrationService
        , private readonly moviesService: MoviesService
    ) {
        super();
    }

    async process(job) {
        if (job.name === 'movie-sync') {
        await this.moviesService.SaveGenresFromIntegration(await this.integration.getMoviesGenres());
        await this.moviesService.SaveMoviesFromIntegration(await this.integration.getMovies());
        }
    }

    @OnWorkerEvent('failed')
    onFail(job, error) {
        console.error('Sync failed:', error);
    }
}
