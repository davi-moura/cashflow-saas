import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty({ required: false })
  name?: string;
}

export class TenantResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  slug!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;
  @ApiProperty()
  refreshToken!: string;
  @ApiProperty()
  expiresIn!: number;
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
  @ApiProperty({ type: TenantResponseDto, required: false })
  tenant?: TenantResponseDto;
}
