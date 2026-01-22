import { ApiProperty } from '@nestjs/swagger';

import { ProductResource } from '../products.events';

export class ProductDto implements ProductResource {
  @ApiProperty({
    description: 'Unique identifier for the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Laptop Computer',
    type: String,
    minLength: 1,
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    description: 'Category the product belongs to',
    example: 'Electronics',
    type: String,
    minLength: 1,
    maxLength: 100,
  })
  category: string;

  @ApiProperty({
    description: 'Price of the product in decimal format (max 2 decimal places)',
    example: 999.99,
    type: Number,
    minimum: 0,
    maximum: 99999999.99,
    format: 'decimal',
  })
  price: number;

  @ApiProperty({
    description: 'Stock quantity of the product',
    example: 100,
    type: Number,
    minimum: 0,
    maximum: 1000,
  })
  stockQuantity: number;

  @ApiProperty({
    description: 'Timestamp when the product was created',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the product was last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
