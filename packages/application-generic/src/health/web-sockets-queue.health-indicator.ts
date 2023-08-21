import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { WebSocketsQueueService } from '../services';

const LOG_CONTEXT = 'WebSocketsQueueServiceHealthIndicator';

@Injectable()
export class WebSocketsQueueServiceHealthIndicator extends HealthIndicator {
  private INDICATOR_KEY = 'webSocketsQueue';

  constructor(
    @Inject(WebSocketsQueueService)
    private webSocketsQueueService: WebSocketsQueueService
  ) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const runningStatus =
      await this.webSocketsQueueService.bullMqService.getRunningStatus();

    if (!runningStatus.queueIsPaused) {
      Logger.log('WebSocketsQueueService is not paused', LOG_CONTEXT);

      return this.getStatus(this.INDICATOR_KEY, true);
    }

    Logger.log('WebSocketsQueueService is paused', LOG_CONTEXT);

    throw new HealthCheckError(
      'Ws Queue Health',
      this.getStatus(this.INDICATOR_KEY, false)
    );
  }
}
