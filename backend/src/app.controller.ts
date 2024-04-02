import { Controller, Post, Body, Header } from '@nestjs/common';
import { ChallengesService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @Header('Access-Control-Allow-Origin', '*')
  async solveChallenge(@Body('email') email: string): Promise<any> {
    return this.challengesService.fetchAndSolveChallenge(email);
  }
}
