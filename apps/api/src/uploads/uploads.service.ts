import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  readonly uploadPath: string;

  constructor(private config: ConfigService) {
    const configuredPath = this.config.get<string>('UPLOADS_PATH') || './uploads';
    this.uploadPath = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.join(process.cwd(), configuredPath);

    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }
}
