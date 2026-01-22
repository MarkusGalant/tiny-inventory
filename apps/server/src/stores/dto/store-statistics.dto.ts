import { ApiProperty } from '@nestjs/swagger';

export class StoreStatisticsDto {
  @ApiProperty({
    description: 'Total inventory value (sum of price * stockQuantity for all products)',
    example: 45000.75,
    type: Number,
  })
  totalInventoryValue: number;

  @ApiProperty({
    description: 'Total number of unique products in the store',
    example: 25,
    type: Number,
  })
  totalProductCount: number;

  @ApiProperty({
    description: 'Total stock quantity across all products',
    example: 500,
    type: Number,
  })
  totalStockQuantity: number;

  @ApiProperty({
    description: 'Average price of products in the store',
    example: 90.01,
    type: Number,
  })
  averageProductPrice: number;
}
