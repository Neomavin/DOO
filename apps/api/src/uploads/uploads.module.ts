import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const configuredPath = config.get('UPLOADS_PATH') || './uploads';
        const destination = configuredPath.startsWith('/')
          ? configuredPath
          : join(process.cwd(), configuredPath);
        return {
          storage: diskStorage({
            destination,
            filename: (_, file, cb) => {
              const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
            },
          }),
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
              return cb(new Error('Solo se permiten imágenes'), false);
            }
            cb(null, true);
          },
        };
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
