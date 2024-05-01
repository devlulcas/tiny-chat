import { WebSocket } from '@fastify/websocket';
import { WebsocketMessage } from 'websocket-message';
import { errorMessage } from './message-builders.js';

export type MessageHandler = (
  message: Record<string, unknown>,
  socket: WebSocket
) => void | Promise<void>;

export class MessageRouter {
  private handlers: Map<string, MessageHandler> = new Map();

  async route(message: WebsocketMessage, socket: WebSocket) {
    const handler = this.handlers.get(message.type);

    if (handler) {
      console.log('Roteando mensagem:', message);
      await handler(message.payload, socket);
    } else {
      console.error('Tipo de mensagem desconhecido:', message.type);
      socket.send(errorMessage(`Unknown message type: ${message.type}`));
    }
  }

  addHandler(type: string, handler: MessageHandler) {
    this.handlers.set(type, handler);
  }

  removeHandler(type: string) {
    this.handlers.delete(type);
  }

  clearHandlers() {
    this.handlers.clear();
  }
}
