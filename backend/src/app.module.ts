import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChallengesService } from './app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [ChallengesService],
})
export class AppModule {}
