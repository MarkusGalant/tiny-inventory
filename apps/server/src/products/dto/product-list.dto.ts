import { ApiProperty } from '@nestjs/swagger';

import { ProductDto } from './product.dto';

export class ProductListDto {
  @ApiProperty({
    description: 'The list of products',
    example: [
      {
        id: '1',
        name: 'Product 1',
        category: 'Category 1',
      },
    ],
  })
  items: ProductDto[];

  @ApiProperty({
    description: 'The total number of products',
    example: 100,
  })
  total: number;
}
