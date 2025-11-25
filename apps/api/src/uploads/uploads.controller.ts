import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('images')
  @ApiOperation({ summary: 'Upload temporary image' })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename,
      url: `/uploads/${file.filename}`,
      path: `${this.uploadsService.uploadPath}/${file.filename}`,
    };
  }
}
