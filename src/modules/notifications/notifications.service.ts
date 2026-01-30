import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not, IsNull, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

export interface ListNotificationsQuery {
  read?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(
    userId: string,
    type: string,
    payload?: Record<string, unknown> | null,
    huntId?: string | null,
  ): Promise<Notification> {
    const entity = this.notificationRepo.create({
      userId,
      type,
      payload: payload ?? null,
      huntId: huntId ?? null,
      readAt: null,
    });
    const saved = await this.notificationRepo.save(entity);

    this.gateway.emitNew(userId, {
      id: saved.id,
      type: saved.type,
      payload: saved.payload,
      huntId: saved.huntId ?? null,
      readAt: saved.readAt ?? null,
      createdAt: saved.createdAt,
    });
    return saved;
  }

  async list(
    userId: string,
    query: ListNotificationsQuery,
  ): Promise<PaginatedNotifications> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Notification> = { userId };
    if (query.read === true) {
      where.readAt = Not(IsNull());
    } else if (query.read === false) {
      where.readAt = IsNull();
    }

    const [data, total] = await this.notificationRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async markRead(userId: string, id: string): Promise<Notification> {
    const entity = await this.notificationRepo.findOne({
      where: { id, userId },
    });
    if (!entity) throw new NotFoundException('Notification not found');
    if (!entity.readAt) {
      entity.readAt = new Date();
      await this.notificationRepo.save(entity);
      this.gateway.emitRead(userId, entity.id, entity.readAt);
    }
    return entity;
  }

  async markReadBatch(userId: string, ids: string[]): Promise<number> {
    if (!ids?.length) return 0;
    const entities = await this.notificationRepo.find({
      where: { userId, id: In(ids) },
    });
    if (!entities.length) return 0;
    const toUpdate = entities.filter((n) => !n.readAt);
    if (!toUpdate.length) return 0;
    const now = new Date();
    toUpdate.forEach((n) => (n.readAt = now));
    await this.notificationRepo.save(toUpdate);
    this.gateway.emitReadBatch(
      userId,
      toUpdate.map((n) => n.id),
      now,
    );
    return toUpdate.length;
  }
}
