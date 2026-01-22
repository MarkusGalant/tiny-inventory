import { ApiProperty } from '@nestjs/swagger';

import { StoreDto } from './store.dto';

export class StoreListDto {
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
  items: StoreDto[];

  @ApiProperty({
    description: 'The total number of stores',
    example: 100,
  })
  total: number;
}
