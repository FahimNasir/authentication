import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/file-upload')
export class FileUploadController {
  @Post()
  @UseInterceptors(FilesInterceptor('profile'))
  uploadFile(@UploadedFiles() file: Express.Multer.File) {
    console.log(file);
  }
}
