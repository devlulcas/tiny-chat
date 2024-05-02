import { WebSocket } from '@fastify/websocket';
import { WebsocketMessage } from 'websocket-message';
import { createMessage } from './message-builders.js';

type User = {
  username: string;
  joinAttempts: number;
};

type RecordedUser = { socket: WebSocket; lastHeartbeat: number };

export class ChatRoom {
  private maxIdleTime = 60_000;
  private connectionsLimit = 100;
  private maxJoinAttempts = 3;

  private users: Map<string, RecordedUser> = new Map();

  isAlreadyRegistered(username: string) {
    return this.users.has(username);
  }

  join(user: User, socket: WebSocket) {
    if (this.isAlreadyRegistered(user.username)) {
      return;
    }

    if (user.joinAttempts >= this.maxJoinAttempts) {
      return socket.send(
        createMessage('error', {
          message: 'Número máximo de tentativas de entrada excedido',
        })
      );
    }

    if (this.users.size >= this.connectionsLimit) {
      const removedUsers = this.cleanupIdleConnections();

      if (removedUsers === 0) {
        const newAttempt = { ...user, joinAttempts: user.joinAttempts + 1 };

        const timeout = setTimeout(() => {
          this.join(newAttempt, socket);
        }, 500);

        socket.once('close', () => {
          clearTimeout(timeout);
        });

        return socket.send(
          createMessage('error', {
            message: 'Limite de conexões atingido. Tentando novamente...',
          })
        );
      }
    }

    this.users.set(user.username, { socket, lastHeartbeat: Date.now() });
  }

  cleanupIdleConnections(): number {
    const now = Date.now();
    let removedUsers = 0;

    for (const [username, { lastHeartbeat }] of this.users.entries()) {
      if (now - lastHeartbeat > this.maxIdleTime) {
        this.users.delete(username);
        removedUsers++;
      }
    }

    return removedUsers;
  }

  leave(user: string) {
    this.users.delete(user);
  }

  async broadcast(message: WebsocketMessage) {
    console.log('Enviando mensagem para todos os usuários');
    console.log('Usuários conectados:', this.users.size);

    // Send message to all connected users and show their usernames
    for (const [username, user] of this.users.entries()) {
      console.log('Enviando mensagem para:', username);
      user.socket.send(JSON.stringify(message));
    }
  }

  handleUserHeartbeat(username: string, socket: WebSocket) {
    const user = this.users.get(username);

    if (user) {
      user.lastHeartbeat = Date.now();
      user.socket = socket;
      this.users.set(username, user);
    }
  }
}
