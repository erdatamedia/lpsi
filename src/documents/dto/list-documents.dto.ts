export class ListDocumentsQueryDto {
  page?: string;
  pageSize?: string;
  status?: string;
}

export interface ListDocumentsParams {
  page: number;
  pageSize: number;
  status?: string;
}
