/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async findByKode(kode: string) {
    // Ambil document dulu
    const doc = await this.prisma.document.findFirst({
      where: { kode },
      select: {
        id: true,
        kode: true,
        id_user: true,
        durasi: true,
        status: true,
        created_at: true,
      },
    });

    if (!doc) {
      return null;
    }

    // Ambil user & historis dengan query terpisah
    const [user, historis] = await Promise.all([
      this.prisma.users.findUnique({
        where: { id: doc.id_user },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
      this.prisma.historis.findMany({
        where: { id_document: doc.id },
        orderBy: { waktu: 'asc' },
        select: {
          id: true,
          waktu: true,
          status: true,
          note: true,
          attachmentUrl: true,
        },
      }),
    ]);

    const institution = await this.prisma.institution.findFirst({
      where: { documents: { some: { id: doc.id } } },
      select: {
        id: true,
        name: true,
        slug: true,
        trackingTitle: true,
      },
    });

    // Bentuk response rapi untuk frontend
    return {
      id: doc.id,
      kode: doc.kode,
      status: doc.status,
      durasi: doc.durasi,
      created_at: doc.created_at,
      user,
      historis,
      institution,
    };
  }

  async findAllDocuments() {
    return this.prisma.document.findMany();
  }
}
