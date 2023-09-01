import { IJobData, JobTopicNameEnum } from '@novu/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { BullMqService, JobsOptions, Queue, QueueOptions } from '../bull-mq';

const LOG_CONTEXT = 'QueueService';

export class QueueBaseService {
  private instance: BullMqService;

  public readonly DEFAULT_ATTEMPTS = 3;
  public queue: Queue;

  constructor(public readonly topic: JobTopicNameEnum) {
    this.instance = new BullMqService();
  }

  public get bullMqService(): BullMqService {
    return this.instance;
  }

  public createQueue(): void {
    this.queue = this.instance.createQueue(this.topic, this.getQueueOptions());
  }

  private getQueueOptions(): QueueOptions {
    return {
      defaultJobOptions: {
        removeOnComplete: true,
      },
    };
  }

  public isReady(): boolean {
    return this.instance.isClientReady();
  }

  public async isPaused(): Promise<boolean> {
    return await this.instance.isQueuePaused();
  }

  public async gracefulShutdown(): Promise<void> {
    Logger.log(`Shutting the ${this.topic} queue service down`, LOG_CONTEXT);

    this.queue = undefined;
    await this.instance.gracefulShutdown();

    Logger.log(
      `Shutting down the ${this.topic} queue service has finished`,
      LOG_CONTEXT
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.gracefulShutdown();
  }

  public async addMinimalJob(
    id: string,
    data?: any,
    groupId?: string,
    options: JobsOptions = {}
  ) {
    const jobData = data
      ? {
          _environmentId: data._environmentId,
          _id: id,
          _organizationId: data._organizationId,
          _userId: data._userId,
        }
      : undefined;

    Logger.verbose(
      { ...jobData, topic: this.topic },
      `Adding minimal job to ${this.topic} queue`,
      LOG_CONTEXT
    );

    await this.add(id, jobData, groupId, {
      removeOnComplete: true,
      removeOnFail: true,
      ...options,
    });
  }

  public async add(
    id: string,
    data?: any,
    groupId?: string,
    options: JobsOptions = {}
  ) {
    const jobOptions = {
      removeOnComplete: true,
      removeOnFail: true,
      ...options,
    };

    Logger.verbose(
      { ...data, topic: this.topic },
      `Adding complete job to ${this.topic} queue`,
      LOG_CONTEXT
    );

    await this.instance.add(id, data, jobOptions, groupId);
  }
}
