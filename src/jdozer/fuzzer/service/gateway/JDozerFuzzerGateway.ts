import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EventBroker } from './broker/EventBroker';
import { Channels } from './broker/Channels';


@WebSocketGateway({
  cors: {
    origin: '*'
  },
  transports: ['websocket', 'polling']
})
export class JdozerFuzzerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private readonly log = new Logger(JdozerFuzzerGateway.name);

  @WebSocketServer()
  server: Server;

  private clientRooms = new Map<string, Set<string>>();
  private clientSubscriptions = new Map<string, Set<string>>();

  constructor() { }

  handleDisconnect(client: Socket) {
    this.log.log(`Cliente desconectado: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.log.log(`Client connected: ${client.id}`);
    this.log.log(`args: ${args}`);
    client.emit('connection', { status: 'connected', id: client.id });
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.log.log(`Mensaje recibido: ${payload}`);
    client.emit('message', `Echo: ${payload}`);
  }

  broadcastMessage(event: string, message: any) {
    this.server.emit(event, message);
  }

  afterInit(server: any) {
    this.log.log('JdozerFuzzerGateway initialized');
  }

  @OnEvent('redis.jdozer:fuzzer:broker', { async: true })
  public async handlerBrokerEvent(data: any) {
    this.log.debug(`Received message on channel jdozer:fuzzer:broker: ${data}`);
    this.broadcastMessage('message', data);
  }

  @OnEvent('redis.jdozer:fuzzer:engine', { async: true })
  public async handlerEngineEvent(data: any) {
    this.log.debug(`Received message on channel jdozer:fuzzer:engine: ${data}`);
    this.broadcastMessage('message', data);
  }

  @OnEvent(Channels.EVENT_RUNNING, { async: true })
  public async handlerProcessorEvent(event: any) {
    this.log.debug(`Received message on channel ${Channels.EVENT_RUNNING}: ${event}`);
    this.broadcastMessage(Channels.EVENT_RUNNING, event);
  }

}
