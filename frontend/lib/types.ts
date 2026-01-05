export type ApiResponse<T> =
  | { status: true; data: T }
  | { status: false; message: string; data?: never };

export type Institution = {
  id: number;
  name: string;
  slug: string;
  trackingTitle: string;
  logoUrl?: string | null;
  created_at?: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export type DocumentHistoris = {
  id: number;
  waktu: string;
  status: string;
  note?: string | null;
  attachmentUrl?: string | null;
};

export type DocumentItem = {
  id: number;
  kode: string;
  durasi: number;
  status: string;
  created_at: string | null;
  user: User;
};

export type DocumentDetail = DocumentItem & {
  historis: DocumentHistoris[];
  institution?: Institution;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  institution?: Institution | null;
};

export type PaginatedDocuments = {
  items: DocumentItem[];
  total: number;
  page: number;
  pageSize: number;
};
