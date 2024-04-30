import { WebSocket } from '@fastify/websocket';
import { Output, object, record, safeParse, string, unknown } from 'valibot';
import { errorMessage } from './message-builders';
import { Result, fail, ok } from './result';
import { getFirstErrorMessage } from './validation-helpers';

const websocketMessageSchema = object({
  type: string(),
  payload: record(string(), unknown()),
});

export function toWebsocketMessage(rawData: string): Result<WebsocketMessage> {
  try {
    const json = JSON.parse(rawData);

    const result = safeParse(websocketMessageSchema, json, {
      abortEarly: true,
    });

    if (result.success === false) {
      return fail(getFirstErrorMessage(result.issues));
    }

    return ok(result.output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return fail(message);
  }
}

export type WebsocketMessage = Output<typeof websocketMessageSchema>;

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
