import { v4 as uuid } from 'uuid';

export abstract class DomainEvent {
  id: string;
  timestamp: Date;
  abstract eventName: string;
  abstract eventTitle: string;
  abstract eventDescription: string;
  abstract payload: Record<string, any>;

  constructor() {
    this.id = uuid();
    this.timestamp = new Date();
  }
}
