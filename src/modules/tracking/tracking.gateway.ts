import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TreasureHuntService } from '../treasure-hunt/treasure-hunt.service';
import { UserProgressService } from '../user-progress/user-progress.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { PositionUpdateDto } from './dto/position-update.dto';

type SocketUser = { id: string; username: string; email: string };

@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*',
  },
})
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private lastUpdateByUser = new Map<string, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly treasureHuntService: TreasureHuntService,
    private readonly userProgressService: UserProgressService,
  ) {}

  afterInit() {
    // noop; could attach middleware here if needed
  }

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

  handleDisconnect(client: Socket) {
    const user = (client.data as { user?: SocketUser }).user;
    if (user?.id) {
      this.lastUpdateByUser.delete(user.id);
    }
  }

  @SubscribeMessage('tracking:join')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    const user = (client.data as { user?: SocketUser }).user;
    if (!user) return;
    try {
      await this.treasureHuntService.ensureMember(dto.huntId, user.id);
    } catch {
      throw new WsException('Not authorized for this hunt');
    }

    const room = `hunt:${dto.huntId}`;
    await client.join(room);
    this.server.to(room).emit('tracking:participant_joined', {
      userId: user.id,
    });
  }

  @SubscribeMessage('tracking:leave')
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    const user = (client.data as { user?: SocketUser }).user;
    if (!user) return;

    const room = `hunt:${dto.huntId}`;
    await client.leave(room);
    this.server.to(room).emit('tracking:participant_left', {
      userId: user.id,
    });
  }

  @SubscribeMessage('tracking:update_position')
  async onUpdatePosition(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: PositionUpdateDto,
  ) {
    const user = (client.data as { user?: SocketUser }).user;
    if (!user) return;

    try {
      await this.treasureHuntService.ensureMember(dto.huntId, user.id);
    } catch {
      throw new WsException('Not authorized for this hunt');
    }

    // Simple rate limit: 1 update per second per user
    const now = Date.now();
    const last = this.lastUpdateByUser.get(user.id) || 0;
    if (now - last < 1000) {
      return;
    }
    this.lastUpdateByUser.set(user.id, now);

    const saved = await this.userProgressService.updatePosition(
      user.id,
      dto.huntId,
      dto.lat,
      dto.lng,
    );

    const room = `hunt:${dto.huntId}`;
    this.server.to(room).emit('tracking:position_updated', {
      userId: user.id,
      lat: dto.lat,
      lng: dto.lng,
      ts: dto.ts ?? new Date().toISOString(),
      currentLocationId: saved.currentLocation
        ? saved.currentLocation.id
        : null,
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
