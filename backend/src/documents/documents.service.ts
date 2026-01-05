import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateDocumentDto,
  CreateHistorisDto,
  UpdateDocumentDto,
} from './dto/create-document.dto';
import { ListDocumentsParams } from './dto/list-documents.dto';

type AuthUser = {
  id: number;
  email: string;
};

type DocumentItem = {
  id: number;
  kode: string;
  durasi: number;
  status: string;
  created_at: Date | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

type DocumentDetail = DocumentItem & {
  historis: {
    id: number;
    waktu: Date;
    status: string;
    note?: string | null;
    attachmentUrl?: string | null;
  }[];
};

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserInstitutionId(userId: number): Promise<number> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { institutionId: true },
    });

    if (!user?.institutionId) {
      throw new ForbiddenException('User tidak memiliki instansi');
    }

    return user.institutionId;
  }

  private async ensureDocumentScope(
    docId: number,
    institutionId: number,
  ): Promise<void> {
    const exists = await this.prisma.document.findFirst({
      where: { id: docId, institutionId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }
  }

  async list(
    authUser: AuthUser,
    params: ListDocumentsParams,
  ): Promise<{
    items: DocumentItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const institutionId = await this.getUserInstitutionId(authUser.id);
    const where = {
      institutionId,
      ...(params.status ? { status: params.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          kode: true,
          durasi: true,
          status: true,
          created_at: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items,
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async getDetail(authUser: AuthUser, docId: number): Promise<DocumentDetail> {
    const institutionId = await this.getUserInstitutionId(authUser.id);

    const doc = await this.prisma.document.findFirst({
      where: { id: docId, institutionId },
      select: {
        id: true,
        kode: true,
        durasi: true,
        status: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        historis: {
          orderBy: { waktu: 'asc' },
          select: {
            id: true,
            waktu: true,
            status: true,
            note: true,
            attachmentUrl: true,
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    return doc;
  }

  async create(
    authUser: AuthUser,
    dto: CreateDocumentDto,
  ): Promise<DocumentItem> {
    const institutionId = await this.getUserInstitutionId(authUser.id);

    const document = await this.prisma.document.create({
      data: {
        kode: dto.kode,
        durasi: dto.durasi,
        status: dto.status,
        created_at: dto.createdAt ?? new Date(),
        id_user: dto.userId ?? authUser.id,
        institutionId,
      },
      select: {
        id: true,
        kode: true,
        durasi: true,
        status: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return document;
  }

  async update(
    authUser: AuthUser,
    docId: number,
    dto: UpdateDocumentDto,
  ): Promise<DocumentItem> {
    const institutionId = await this.getUserInstitutionId(authUser.id);
    await this.ensureDocumentScope(docId, institutionId);

    const document = await this.prisma.document.update({
      where: { id: docId },
      data: {
        ...(dto.kode ? { kode: dto.kode } : {}),
        ...(dto.durasi !== undefined ? { durasi: dto.durasi } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
      select: {
        id: true,
        kode: true,
        durasi: true,
        status: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return document;
  }

  async remove(authUser: AuthUser, docId: number): Promise<void> {
    const institutionId = await this.getUserInstitutionId(authUser.id);
    await this.ensureDocumentScope(docId, institutionId);

    await this.prisma.$transaction([
      this.prisma.historis.deleteMany({ where: { id_document: docId } }),
      this.prisma.document.delete({ where: { id: docId } }),
    ]);
  }

  async addHistoris(
    authUser: AuthUser,
    docId: number,
    dto: CreateHistorisDto,
  ): Promise<{
    id: number;
    waktu: Date;
    status: string;
    note?: string | null;
    attachmentUrl?: string | null;
  }> {
    const institutionId = await this.getUserInstitutionId(authUser.id);
    await this.ensureDocumentScope(docId, institutionId);

    const [historis] = await this.prisma.$transaction([
      this.prisma.historis.create({
        data: {
          id_document: docId,
          status: dto.status,
          note: dto.note,
          attachmentUrl: dto.attachmentUrl,
          waktu: dto.waktu ?? new Date(),
        },
        select: {
          id: true,
          waktu: true,
          status: true,
          note: true,
          attachmentUrl: true,
        },
      }),
      this.prisma.document.update({
        where: { id: docId },
        data: { status: dto.status },
      }),
    ]);

    return historis;
  }
}
