import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  Min,
  IsArray,
  ArrayUnique,
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
  Max,
} from 'class-validator';

export class ProductListQueryDto {
  @ApiPropertyOptional({ description: 'Search by product name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Array of store IDs to filter by',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    isArray: true,
    minItems: 1,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each store ID must be a valid UUID' })
  @ArrayMinSize(1, { message: 'At least one store must be specified' })
  @ArrayMaxSize(1_000, { message: 'Maximum 10 store IDs can be specified' })
  @ArrayUnique({ message: 'Duplicate store IDs are not allowed' })
  storeIds?: string[];

  @ApiPropertyOptional({ description: 'Minimum price', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'name',
    enum: ['name', 'category', 'price', 'createdAt', 'updatedAt'],
    default: 'updatedAt',
  })
  @IsOptional()
  @IsString()
  sortBy: string = 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Skip of items',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({
    description: 'Take of items',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  take?: number;
}
