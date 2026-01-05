import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  CreateHistorisDto,
  UpdateDocumentDto,
} from './dto/create-document.dto';
import { ListDocumentsQueryDto } from './dto/list-documents.dto';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

type AuthRequest = Request & { user: { sub: number; email: string; role?: string } };

const MAX_PDF_BYTES = 1024 * 1024;
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'historis');

function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(
    @Req() req: AuthRequest,
    @Query() query: ListDocumentsQueryDto,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));
    const status = query.status?.trim() || undefined;

    const data = await this.documentsService.list(
      { id: req.user.sub, email: req.user.email },
      { page, pageSize, status },
    );

    return { status: true, data };
  }

  @Get(':id')
  async detail(@Req() req: AuthRequest, @Param('id') id: string) {
    const docId = Number(id);
    const data = await this.documentsService.getDetail(
      { id: req.user.sub, email: req.user.email },
      docId,
    );

    return { status: true, data };
  }

  @Post()
  async create(@Req() req: AuthRequest, @Body() body: CreateDocumentDto) {
    const data = await this.documentsService.create(
      { id: req.user.sub, email: req.user.email },
      body,
    );

    return { status: true, data };
  }

  @Patch(':id')
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: UpdateDocumentDto,
  ) {
    const docId = Number(id);
    const data = await this.documentsService.update(
      { id: req.user.sub, email: req.user.email },
      docId,
      body,
    );

    return { status: true, data };
  }

  @Delete(':id')
  async remove(@Req() req: AuthRequest, @Param('id') id: string) {
    const docId = Number(id);
    await this.documentsService.remove(
      { id: req.user.sub, email: req.user.email },
      docId,
    );

    return { status: true, message: 'Dokumen dihapus' };
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase() || '.pdf';
          const name = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: MAX_PDF_BYTES },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const isPdf =
          file.mimetype === 'application/pdf' || ext === '.pdf';
        if (!isPdf) {
          cb(new BadRequestException('File harus PDF'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Post(':id/historis')
  async addHistoris(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: CreateHistorisDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const status = body.status?.trim();
    if (!status) {
      throw new BadRequestException('Status wajib diisi');
    }
    if (status === 'selesai' && !file) {
      throw new BadRequestException('Upload PDF wajib untuk status selesai');
    }
    const docId = Number(id);
    const attachmentUrl = file ? `/uploads/historis/${file.filename}` : undefined;
    const data = await this.documentsService.addHistoris(
      { id: req.user.sub, email: req.user.email },
      docId,
      {
        ...body,
        status,
        attachmentUrl,
      },
    );

    return { status: true, data };
  }
}
