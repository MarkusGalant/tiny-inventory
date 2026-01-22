import { DomainEvent } from '../events/event-bus.events';

export type StoreResource = {
  id: string;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class StoreCreatedEvent extends DomainEvent {
  public readonly eventName = 'store.created';
  public readonly eventTitle = 'Store Created';
  public readonly eventDescription = 'Information about the store that was created';
  public payload: {
    store: StoreResource;
  };

  constructor(private readonly store: StoreResource) {
    super();

    this.payload = {
      store,
    };
  }
}

export class StoreUpdatedEvent extends DomainEvent {
  public readonly eventName = 'store.updated';
  public readonly eventTitle = 'Store Updated';
  public readonly eventDescription = 'Information about the store that was updated';
  public readonly payload: {
    store: StoreResource;
  };

  constructor(store: StoreResource) {
    super();

    this.payload = {
      store,
    };
  }
}

export class StoreDeletedEvent extends DomainEvent {
  public readonly eventName = 'store.deleted';
  public readonly eventTitle = 'Store Deleted';
  public readonly eventDescription = 'Information about the store that was deleted';
  public readonly payload: {
    store: StoreResource;
  };

  constructor(store: StoreResource) {
    super();

    this.payload = {
      store,
    };
  }
}

export class StoreProductAddedEvent extends DomainEvent {
  public readonly eventName = 'store.product-added';
  public readonly eventTitle = 'Product Added to Store';
  public readonly eventDescription = 'Information about the product that was added to the store';
  public readonly payload: {
    store: StoreResource;
    productId: string;
  };

  constructor(store: StoreResource, productId: string) {
    super();

    this.payload = {
      store,
      productId: productId,
    };
  }
}

export class StoreProductRemovedEvent extends DomainEvent {
  public readonly eventName = 'store.product-removed';
  public readonly eventTitle = 'Product Removed from Store';
  public readonly eventDescription =
    'Information about the product that was removed from the store';

  public readonly payload: {
    store: string;
    productId: string;
  };

  constructor(store: string, productId: string) {
    super();

    this.payload = {
      store,
      productId,
    };
  }
}
