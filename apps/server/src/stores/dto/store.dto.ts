import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { StoreResource } from '../stores.events';

export class StoreDto implements StoreResource {
  @ApiProperty({
    description: 'Unique identifier for the store',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the store',
    example: 'Main Street Store',
    type: String,
    minLength: 1,
    maxLength: 255,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Address of the store',
    example: '123 Main St, City, State 12345',
    type: String,
    maxLength: 500,
  })
  address?: string;

  @ApiProperty({
    description: 'Timestamp when the store was created',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the store was last updated',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
