import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';
import { WebsocketMessage } from 'websocket-message';
import { errorMessage } from './message-builders.js';

export type MessageHandler = (
  message: Record<string, unknown>,
  socket: WebSocket,
  req: FastifyRequest
) => void | Promise<void>;

export class MessageRouter {
  private handlers: Map<string, MessageHandler> = new Map();

  async route(
    message: WebsocketMessage,
    socket: WebSocket,
    req: FastifyRequest
  ) {
    const handler = this.handlers.get(message.type);

    if (handler) {
      req.log.info(`Handler encontrado para: ${message.type}`);
      await handler(message.payload, socket, req);
    } else {
      req.log.error(`Tipo de mensagem desconhecido: ${message.type}`);
      socket.send(errorMessage(`Unknown message type: ${message.type}`));
    }
  }

  addHandler(type: string, handler: MessageHandler) {
    console.log('Handler adicionado:', type);
    this.handlers.set(type, handler);
  }

  removeHandler(type: string) {
    this.handlers.delete(type);
  }

  clearHandlers() {
    this.handlers.clear();
  }
}
