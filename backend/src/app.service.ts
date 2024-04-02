import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

interface ChallengeResponse {
  level: number;
  expires_in: string;
  encrypted_path: string;
  encryption_method: string;
}

interface DecryptedChallenge {
  level: number;
  expiration: string;
  encryptedPath: string;
  encryptMethod: string;
  decryptedPath: string;
}

@Injectable()
export class ChallengesService {
  constructor(private httpService: HttpService) {}

  async fetchAndSolveChallenge(email: string): Promise<DecryptedChallenge[]> {
    const results: DecryptedChallenge[] = [];
    await this.solveChallenge(email, results);
    return results;
  }

  private async solveChallenge(
    email: string,
    results: DecryptedChallenge[],
    path = email,
  ): Promise<void> {
    const { level, encrypted_path, encryption_method, expires_in } =
      await lastValueFrom(
        this.httpService.get<ChallengeResponse>(
          `https://ciphersprint.pulley.com/${path}`,
        ),
      ).then((response) => response.data);
    let decryptedPath = '';
    const prefix = 'task_';
    const encryptedPath = encrypted_path.split(prefix)[1];
    switch (level) {
      case 1:
        decryptedPath = `${prefix}${Buffer.from(
          encryptedPath,
          'base64',
        ).toString()}`;
        break;
      case 2:
        decryptedPath = `${prefix}${encryptedPath.replace(/[^0-9a-fA-F]/g, '')}`;
        break;
      case 3:
        const asciiDecrypt = encryptedPath
          .split('')
          .map((char) => String.fromCharCode(char.charCodeAt(0) + 2))
          .join('');
        decryptedPath = `${prefix}${asciiDecrypt}`;
        break;
      default:
        decryptedPath = encrypted_path; // Assuming no encryption for level 0
    }

    results.push({
      level,
      expiration: expires_in,
      encryptedPath: encrypted_path,
      encryptMethod: encryption_method,
      decryptedPath: decryptedPath,
    });

    if (level < 3) {
      // Assuming the final level is 3
      await this.solveChallenge(email, results, decryptedPath);
    }
  }
}
