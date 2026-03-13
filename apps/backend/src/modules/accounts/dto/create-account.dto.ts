import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ enum: ['bank', 'cash'] })
  @IsIn(['bank', 'cash'])
  type!: 'bank' | 'cash';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accountNumber?: string;
}
