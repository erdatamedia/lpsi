export class UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  institutionId?: number | null;
}
