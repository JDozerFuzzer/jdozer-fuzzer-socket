import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  transports: ['websocket', 'polling']
})
export class JdozerFuzzerGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly log = new Logger(JdozerFuzzerGateway.name);

  @WebSocketServer()
  server: Server;

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

}
