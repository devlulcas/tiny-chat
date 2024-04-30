import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify/types/request';
import * as v from 'valibot';

type Ok<T> = { type: 'ok'; data: T };
type Fail = { type: 'fail'; error: string };
type Result<T> = Ok<T> | Fail;

function ok<T>(data: T): Result<T> {
  return { type: 'ok', data };
}

function fail(error: string): Result<never> {
  return { type: 'fail', error };
}

function isFail<T>(result: Result<T>): result is Fail {
  return result.type === 'fail';
}

const websocketMessageSchema = v.object({
  type: v.string(),
  payload: v.record(v.string(), v.unknown()),
});

type WebsocketMessage = v.Output<typeof websocketMessageSchema>;

function getFirstIssueMessage(issues: v.SchemaIssues): string {
  const firstIssue = issues[0];
  const path = firstIssue.path ? firstIssue.path[0].key : 'root';
  const message = firstIssue.message + ' at ' + path;
  return message;
}

function rawDataToMessage(rawData: string): Result<WebsocketMessage> {
  try {
    const json = JSON.parse(rawData);

    const result = v.safeParse(websocketMessageSchema, json, {
      abortEarly: true,
    });

    if (result.success === false) {
      return fail(getFirstIssueMessage(result.issues));
    }

    return ok(result.output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return fail(message);
  }
}

class ChatRoom {
  private users: Map<string, WebSocket> = new Map();

  join(user: string, socket: WebSocket) {
    this.users.set(user, socket);
  }

  leave(user: string) {
    this.users.delete(user);
  }

  broadcast(message: WebsocketMessage) {
    for (const socket of this.users.values()) {
      socket.send(JSON.stringify(message));
    }
  }
}

const chatRoom = new ChatRoom();

function createMessage(type: string, data: Record<string, unknown>): string {
  return JSON.stringify({ type, data });
}

function errorMessage(validation: string): string {
  return createMessage('error', { validation });
}

type MessageHandler = (
  message: Record<string, unknown>,
  socket: WebSocket
) => void | Promise<void>;

class MessageRouter {
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

const router = new MessageRouter();

// Join
router.addHandler('join', (payload, socket) => {
  const joinSchema = v.object({
    username: v.string(),
  });

  const validated = v.safeParse(joinSchema, payload);

  if (validated.success === false) {
    return socket.send(errorMessage(getFirstIssueMessage(validated.issues)));
  }

  chatRoom.join(validated.output.username, socket);

  chatRoom.broadcast({ type: 'join', payload });
});

// Leave
router.addHandler('leave', (payload, socket) => {
  const leaveSchema = v.object({
    username: v.string(),
  });

  const validated = v.safeParse(leaveSchema, payload);

  if (validated.success === false) {
    return socket.send(errorMessage(getFirstIssueMessage(validated.issues)));
  }

  chatRoom.leave(validated.output.username);

  chatRoom.broadcast({ type: 'leave', payload });
});

// Message
router.addHandler('message', (payload, socket) => {
  const messageSchema = v.object({
    username: v.string(),
    text: v.string(),
  });

  const validated = v.safeParse(messageSchema, payload);

  if (validated.success === false) {
    return socket.send(errorMessage(getFirstIssueMessage(validated.issues)));
  }

  chatRoom.broadcast({ type: 'message', payload });
});

// Ping
router.addHandler('ping', (_, socket) => {
  socket.pong();
});

// Pong
router.addHandler('pong', (_, socket) => {
  console.log('Pong recebido');
});

// Close
router.addHandler('close', (_, socket) => {
  socket.close();
});

export function handleWebsocket(socket: WebSocket, req: FastifyRequest) {
  socket.on('open', () => {
    console.log('Conexão estabelecida');
  });

  socket.on('close', () => {
    console.log('Conexão fechada');
  });

  socket.on('error', (error) => {
    console.error('Erro:', error);
  });

  socket.on('message', async (data, isBinary) => {
    const messageResult = rawDataToMessage(data.toString());

    if (isFail(messageResult)) {
      return socket.send(errorMessage(messageResult.error));
    }

    await router.route(messageResult.data, socket);
  });

  socket.on('pong', () => {
    console.log('Pong recebido');
  });

  socket.send('Conexão estabelecida');
}
