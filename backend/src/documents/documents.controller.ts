import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
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

type AuthRequest = Request & { user: { sub: number; email: string } };

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

  @Post(':id/historis')
  async addHistoris(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: CreateHistorisDto,
  ) {
    const docId = Number(id);
    const data = await this.documentsService.addHistoris(
      { id: req.user.sub, email: req.user.email },
      docId,
      body,
    );

    return { status: true, data };
  }
}
