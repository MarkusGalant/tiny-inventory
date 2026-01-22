import { EventEmitter } from 'events';

import { Injectable } from '@nestjs/common';

import { DomainEvent } from './event-bus.events';

@Injectable()
export class EventBusService extends EventEmitter {
  async emitEvent(event: DomainEvent): Promise<void> {
    this.emit(event.eventName, event);

    return Promise.resolve();
  }
}
