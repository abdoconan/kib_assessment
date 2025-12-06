import { Controller, Post, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('queue')
@Controller('queue')
export class QueueController {

    constructor(private readonly queueService: QueueService) {}

    @Post('movies')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    async triggerMovieSync(): Promise<{ message: string }> {
        await this.queueService.triggerMovieGenreSync();
        return { message: 'Sync started' };
    }
}