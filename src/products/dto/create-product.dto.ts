import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}
