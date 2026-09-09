import {EventEmitter} from 'node:events';

const bus = new EventEmitter();
bus.setMaxListeners(100);

export function publishDomainEvent(type, payload = {}) {
  const event = {type, payload, occurredAt: new Date().toISOString()};
  bus.emit(type, event);
  bus.emit('*', event);
  return event;
}

export function subscribeDomainEvent(type, handler) {
  bus.on(type, handler);
  return () => bus.off(type, handler);
}

export function subscribeAllDomainEvents(handler) {
  bus.on('*', handler);
  return () => bus.off('*', handler);
}
