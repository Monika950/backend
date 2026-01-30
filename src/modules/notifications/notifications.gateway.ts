import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

type SocketUser = { id: string; username: string; email: string };

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    const user = await this.verifyToken(token);
    if (!user) {
      client.disconnect(true);
      return;
    }
    (client.data as { user?: SocketUser }).user = user;
    await client.join(`user:${user.id}`);
  }

  emitNew(
    userId: string,
    payload: {
      id: string;
      type: string;
      payload: Record<string, unknown> | null;
      huntId: string | null;
      readAt: Date | null;
      createdAt: Date;
    },
  ) {
    this.server.to(`user:${userId}`).emit('notifications:new', payload);
  }

  emitRead(userId: string, notificationId: string, readAt: Date) {
    this.server.to(`user:${userId}`).emit('notifications:read', {
      id: notificationId,
      readAt,
    });
  }

  emitReadBatch(userId: string, ids: string[], readAt: Date) {
    this.server.to(`user:${userId}`).emit('notifications:read_batch', {
      ids,
      readAt,
    });
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as { token?: string } | undefined;
    const authToken = auth?.token ?? null;
    const header = client.handshake.headers['authorization'];
    const headerToken =
      typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : null;
    return authToken || headerToken;
  }

  private async verifyToken(
    token: string | null,
  ): Promise<{ id: string; username: string; email: string } | null> {
    if (!token) return null;
    try {
      const payload = await this.jwtService.verifyAsync<{
        id: string;
        username: string;
        email: string;
      }>(token, { secret: process.env.JWT_SECRET });
      return payload;
    } catch {
      return null;
    }
  }
}
