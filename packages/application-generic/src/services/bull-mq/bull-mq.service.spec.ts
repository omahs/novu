import { JobTopicNameEnum } from '@novu/shared';

import {
  BullMqService,
  QueueBaseOptions,
  WorkerOptions,
} from './bull-mq.service';

let bullMqService: BullMqService;

describe('BullMQ Service', () => {
  describe('Non cluster mode', () => {
    beforeEach(async () => {
      process.env.IN_MEMORY_CLUSTER_MODE_ENABLED = 'false';
      process.env.IS_IN_MEMORY_CLUSTER_MODE_ENABLED = 'false';

      bullMqService = new BullMqService();
    });

    afterEach(async () => {
      await bullMqService.gracefulShutdown();
    });

    describe('Set up', () => {
      it('should be able to instantiate it correctly', async () => {
        expect(bullMqService.queue).toBeUndefined();
        expect(bullMqService.worker).toBeUndefined();
        expect(BullMqService.haveProInstalled()).toBeFalsy();
        expect(await bullMqService.getStatus()).toEqual({
          queueIsPaused: undefined,
          queueName: undefined,
          workerIsPaused: undefined,
          workerIsRunning: undefined,
          workerName: undefined,
        });
      });

      it('should create a queue properly with the default configuration', async () => {
        const queueName = JobTopicNameEnum.METRICS;
        const queueOptions: QueueBaseOptions = {};
        await bullMqService.createQueue(queueName, queueOptions);

        expect(bullMqService.queue.name).toEqual(queueName);
        expect(bullMqService.queue.opts.connection).toEqual({
          connectTimeout: 50000,
          db: 1,
          family: 4,
          host: 'localhost',
          keepAlive: 7200,
          keyPrefix: '',
          password: undefined,
          port: 6379,
          tls: undefined,
        });

        expect(await bullMqService.getStatus()).toEqual({
          queueIsPaused: false,
          queueName,
          workerIsPaused: undefined,
          workerIsRunning: undefined,
          workerName: undefined,
        });
      });

      it('should create a queue properly with a chosen configuration', async () => {
        const queueName = JobTopicNameEnum.METRICS;
        const queueOptions: QueueBaseOptions = {
          connection: {
            connectTimeout: 10000,
            db: 10,
            family: 6,
            keepAlive: 1000,
            keyPrefix: 'test',
          },
        };
        await bullMqService.createQueue(queueName, queueOptions);

        expect(bullMqService.queue.name).toEqual(queueName);
        expect(bullMqService.queue.opts.connection).toEqual({
          connectTimeout: 10000,
          db: 10,
          family: 6,
          host: 'localhost',
          keepAlive: 1000,
          keyPrefix: 'test',
          password: undefined,
          port: 6379,
          tls: undefined,
        });

        expect(await bullMqService.getStatus()).toEqual({
          queueIsPaused: false,
          queueName,
          workerIsPaused: undefined,
          workerIsRunning: undefined,
          workerName: undefined,
        });
      });

      it('should create a worker properly with the default configuration', async () => {
        const workerName = JobTopicNameEnum.METRICS;
        await bullMqService.createWorker(workerName, undefined, {});

        expect(bullMqService.worker.name).toEqual(workerName);
        expect(bullMqService.worker.opts.connection).toEqual({
          connectTimeout: 50000,
          db: 1,
          family: 4,
          host: 'localhost',
          keepAlive: 7200,
          keyPrefix: '',
          password: undefined,
          port: 6379,
          tls: undefined,
        });

        expect(await bullMqService.getStatus()).toEqual({
          queueIsPaused: undefined,
          queueName: undefined,
          workerIsPaused: false,
          workerIsRunning: false,
          workerName,
        });
      });

      it('should create a worker properly with a chosen configuration', async () => {
        const workerName = JobTopicNameEnum.METRICS;
        const workerOptions: WorkerOptions = {
          connection: {
            connectTimeout: 10000,
            db: 10,
            family: 6,
            keepAlive: 1000,
            keyPrefix: 'test',
          },
          lockDuration: 90000,
          concurrency: 200,
        };
        await bullMqService.createWorker(workerName, undefined, workerOptions);

        expect(bullMqService.worker.name).toEqual(workerName);
        expect(bullMqService.worker.opts.connection).toEqual({
          connectTimeout: 10000,
          db: 10,
          family: 6,
          host: 'localhost',
          keepAlive: 1000,
          keyPrefix: 'test',
          password: undefined,
          port: 6379,
          tls: undefined,
        });
        expect(bullMqService.worker.opts.concurrency).toEqual(200);
        expect(bullMqService.worker.opts.lockDuration).toEqual(90000);

        expect(await bullMqService.getStatus()).toEqual({
          queueIsPaused: undefined,
          queueName: undefined,
          workerIsPaused: false,
          workerIsRunning: false,
          workerName,
        });
      });
    });
  });
});
