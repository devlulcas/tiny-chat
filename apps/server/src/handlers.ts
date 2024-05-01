import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';
import { isFail } from 'result';
import { object, safeParse, string } from 'valibot';
import { toWebsocketMessage } from 'websocket-message';
import { ChatRoom } from './chat-room.js';
import { errorMessage } from './message-builders.js';
import { MessageRouter } from './message-router.js';

const chatRoom = new ChatRoom();

const messageRouter = new MessageRouter();

// Join
messageRouter.addHandler('join', (payload, socket) => {
  const joinSchema = object({
    username: string(),
  });

  const validated = safeParse(joinSchema, payload);

  if (validated.success === false) {
    return socket.send(errorMessage(validated.issues));
  }

  chatRoom.join(
    {
      username: validated.output.username,
      joinAttempts: 0,
    },
    socket
  );

  chatRoom.broadcast({ type: 'join', payload });
});

// Leave
messageRouter.addHandler('leave', (payload, socket) => {
  const leaveSchema = object({
    username: string(),
  });

  const validated = safeParse(leaveSchema, payload);

  if (validated.success === false) {
    return socket.send(errorMessage(validated.issues));
  }

  chatRoom.leave(validated.output.username);

  chatRoom.broadcast({ type: 'leave', payload });
});

// Message
messageRouter.addHandler('message', (payload, socket) => {
  const messageSchema = object({
    username: string(),
    text: string(),
  });

  const validated = safeParse(messageSchema, payload);

  if (validated.success === false) {
    return socket.send(errorMessage(validated.issues));
  }

  chatRoom.broadcast({ type: 'message', payload });
});

// Ping
messageRouter.addHandler('ping', (payload, socket) => {
  const pingSchema = object({ username: string() });

  const validated = safeParse(pingSchema, payload);

  if (validated.success) {
    chatRoom.handleUserHeartbeat(validated.output.username);
  }

  socket.pong();
});

// Close
messageRouter.addHandler('close', (_, socket) => {
  socket.close();
});

export function handleWebsocketConnection(
  socket: WebSocket,
  _req: FastifyRequest
) {
  socket.on('open', () => {
    console.log('Conexão estabelecida');
  });

  socket.on('close', () => {
    console.log('Conexão fechada');
  });

  socket.on('error', (error) => {
    console.error('Erro:', error);
  });

  socket.on('message', async (data) => {
    const messageResult = toWebsocketMessage(data.toString());

    if (isFail(messageResult)) {
      return socket.send(errorMessage(messageResult.error));
    }

    await messageRouter.route(messageResult.data, socket);
  });

  socket.on('pong', () => {
    console.log('Pong recebido');
  });

  socket.send('Conexão estabelecida');
}
