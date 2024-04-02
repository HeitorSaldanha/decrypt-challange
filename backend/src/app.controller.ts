import { Controller, Post, Body } from '@nestjs/common';
import { ChallengesService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  async solveChallenge(@Body('email') email: string): Promise<any> {
    return this.challengesService.fetchAndSolveChallenge(email);
  }
}
