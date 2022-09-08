import {Module} from '@nestjs/common';
import {RABBITMQ_ADDRESS} from '../app/app.config';
import {RabbitMQModule} from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange1',
          type: 'topic',
        },
      ],
      uri: RABBITMQ_ADDRESS,
      channels: {
        'channel-psl': {
          prefetchCount: 15,
          default: true,
        },
      },
    }),
    PslQueueModule,
  ],
})
export class PslQueueModule {}
