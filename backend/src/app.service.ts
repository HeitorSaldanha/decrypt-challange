import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { unpack } from 'msgpackr';

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
      )
        .then((response) => response.data)
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request:', error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
          }
          throw error;
        });
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
        const asciiDifference =
          parseInt(encryption_method.replace(/[a-zA-Z\s]/g, '')) * -1;
        const asciiDecrypt = encryptedPath
          .split('')
          .map((char) =>
            String.fromCharCode(char.charCodeAt(0) + asciiDifference),
          )
          .join('');
        decryptedPath = `${prefix}${asciiDecrypt}`;
        break;
      case 4:
        const key = encryption_method.split('key: ')[1];

        const keyBuf = Buffer.from(key, 'utf8');
        const strBuf = Buffer.from(encryptedPath, 'hex');
        const outBuf = Buffer.alloc(strBuf.length);

        for (let n = 0; n < strBuf.length; n++)
          outBuf[n] = strBuf[n] ^ keyBuf[n % keyBuf.length];

        decryptedPath = `${prefix}${outBuf.toString('hex')}`;
        break;
      case 5:
        const encodedOriginalPos = encryption_method.split(':')[1];
        const decodedOriginalPos = unpack(
          Buffer.from(encodedOriginalPos, 'base64'),
        );
        const chars = encryptedPath.split('');
        const sortedChars = new Array(chars.length);
        chars.forEach((char, i) => (sortedChars[decodedOriginalPos[i]] = char));
        const sortedString = sortedChars.join('');
        decryptedPath = `${prefix}${sortedString}`;
        break;
      default:
        decryptedPath = encrypted_path;
    }

    results.push({
      level,
      expiration: expires_in,
      encryptedPath: encrypted_path,
      encryptMethod: encryption_method,
      decryptedPath: decryptedPath,
    });

    if (level < 6) {
      await this.solveChallenge(email, results, decryptedPath);
    }
  }
}
