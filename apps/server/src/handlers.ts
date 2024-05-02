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
messageRouter.addHandler('join', (payload, socket, req) => {
  const joinSchema = object({
    username: string(),
  });

  const validated = safeParse(joinSchema, payload);

  if (validated.success === false) {
    req.log.error(
      'Erro ao validar mensagem de entrada: ' + JSON.stringify(validated.issues)
    );

    return socket.send(errorMessage(validated.issues));
  }

  req.log.info('Entrando na sala: ' + validated.output.username);
  chatRoom.join({ ...validated.output, joinAttempts: 0 }, socket);
  chatRoom.broadcast({ type: 'join', payload });
});

// Leave
messageRouter.addHandler('leave', (payload, socket, req) => {
  const leaveSchema = object({
    username: string(),
  });

  const validated = safeParse(leaveSchema, payload);

  if (validated.success === false) {
    req.log.error(
      'Erro ao validar mensagem de saída: ' + JSON.stringify(validated.issues)
    );

    return socket.send(errorMessage(validated.issues));
  }

  req.log.info('Saindo da sala: ' + validated.output.username);
  chatRoom.leave(validated.output.username);
  chatRoom.broadcast({ type: 'leave', payload });
});

// Message
messageRouter.addHandler('message', (payload, socket, req) => {
  const messageSchema = object({
    username: string(),
    text: string(),
  });

  const validated = safeParse(messageSchema, payload);

  req.log.info(JSON.stringify(validated.output));

  if (validated.success === false) {
    req.log.error(
      'Erro ao validar mensagem de texto: ' + JSON.stringify(validated.issues)
    );

    return socket.send(errorMessage(validated.issues));
  }

  if (!chatRoom.isAlreadyRegistered(validated.output.username)) {
    req.log.error('Usuário não registrado: ' + validated.output.username);

    chatRoom.join(
      { username: validated.output.username, joinAttempts: 0 },
      socket
    );

    req.log.info('Entrando na sala: ' + validated.output.username);
  }

  req.log.info('Enviando mensagem de: ' + validated.output.username);
  chatRoom.handleUserHeartbeat(validated.output.username);
  chatRoom.broadcast({ type: 'message', payload });
});

// Ping
messageRouter.addHandler('ping', (payload, socket, req) => {
  const pingSchema = object({ username: string() });

  const validated = safeParse(pingSchema, payload);

  if (validated.success) {
    if (!chatRoom.isAlreadyRegistered(validated.output.username)) {
      req.log.error('Usuário não registrado: ' + validated.output.username);

      return socket.send(
        errorMessage('Usuário não registrado. Por favor, entre na sala.')
      );
    }

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
  req: FastifyRequest
) {
  socket.on('open', () => {
    req.log.info('Conexão estabelecida');
  });

  socket.on('close', () => {
    req.log.info('Conexão fechada');
  });

  socket.on('error', (error) => {
    req.log.error('Erro:', error);
  });

  socket.on('message', async (data) => {
    const messageResult = toWebsocketMessage(data.toString());

    if (isFail(messageResult)) {
      req.log.error('Erro ao processar mensagem: ' + messageResult.error);
      return socket.send(errorMessage(messageResult.error));
    }

    await messageRouter.route(messageResult.data, socket, req);
  });

  socket.on('ping', () => {
    req.log.info('Ping recebido');
    socket.pong();
  });

  socket.on('pong', () => {
    req.log.info('Pong recebido');
  });

  socket.send('Conexão estabelecida');
}
