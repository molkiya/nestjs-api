import * as amqplib from 'amqplib';
import {RABBITMQ_ADDRESS} from '../../config/app/app.config';

let channel;

const connectToChannel = async () => {
  try {
    let connection = await amqplib.connect(RABBITMQ_ADDRESS);
    return connection.createChannel();
  } catch (e) {
    console.error('failed to create amqp channel: ', e);
  }
};

export async function publishToQueue(queue, data) {
  if (channel == null) {
    channel = await connectToChannel();
  }
  return channel.sendToQueue(queue, Buffer.from(data));
}
