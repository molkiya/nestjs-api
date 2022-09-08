import {Module} from '@nestjs/common';
import {ClientProxyFactory, Transport} from '@nestjs/microservices';
import {RABBITMQ_ADDRESS} from '../app/app.config';

@Module({
  providers: [
    {
      provide: 'PSL_QUEUE',
      useValue: ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [RABBITMQ_ADDRESS],
          queue: 'psl',
          noAck: false,
          queueOptions: {
            durable: true,
          },
        },
      }),
    },
  ],
  exports: ['PSL_QUEUE'],
})
export class PslQueueConfig {}
