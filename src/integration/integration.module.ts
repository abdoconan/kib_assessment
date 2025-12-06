import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule], 
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
