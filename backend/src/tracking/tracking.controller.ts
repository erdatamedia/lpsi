import { Controller, Get, Query } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get()
  async getTracking(@Query('kode') kode: string) {
    if (!kode) {
      return {
        status: false,
        message: 'Parameter kode wajib diisi',
      };
    }

    const data = await this.trackingService.findByKode(kode);

    if (!data) {
      return {
        status: false,
        message: 'Data tidak ditemukan',
      };
    }

    return {
      status: true,
      data,
    };
  }

  // endpoint debug yang tadi
  @Get('all')
  async getAll() {
    return this.trackingService.findAllDocuments();
  }
}
