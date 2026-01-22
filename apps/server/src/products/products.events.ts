import { DomainEvent } from '@/events/event-bus.events';

export type ProductResource = {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
};

export class ProductCreatedEvent extends DomainEvent {
  public readonly eventName = 'product.created';
  public readonly eventTitle = 'Product Created';
  public readonly eventDescription = 'Information about a product that was created';
  public readonly payload: {
    product: ProductResource;
  };

  constructor(product: ProductResource) {
    super();

    this.payload = {
      product,
    };
  }
}

export class ProductUpdatedEvent extends DomainEvent {
  public readonly eventName = 'product.updated';
  public readonly eventTitle = 'Product Updated';
  public readonly eventDescription = 'Information about a product that was updated';
  public readonly payload: {
    product: ProductResource;
  };

  constructor(product: ProductResource) {
    super();

    this.payload = {
      product,
    };
  }
}

export class ProductDeletedEvent extends DomainEvent {
  public readonly eventName = 'product.deleted';
  public readonly eventTitle = 'Product Deleted';
  public readonly eventDescription = 'Information about a product that was deleted';
  public readonly payload: {
    product: ProductResource;
  };

  constructor(product: ProductResource) {
    super();

    this.payload = {
      product,
    };
  }
}
