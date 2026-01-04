export class CreateDocumentDto {
  kode!: string;
  durasi!: number;
  status!: string;
  createdAt?: Date;
  userId?: number;
}

export class UpdateDocumentDto {
  kode?: string;
  durasi?: number;
  status?: string;
}

export class CreateHistorisDto {
  status!: string;
  note?: string;
  waktu?: Date;
}
