import { NestFactory } from '@nestjs/core';
import { JDozerFuzzerGatewayModule } from './jdozer/fuzzer/service/gateway/JDozerFuzzerGatewayModule';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(JDozerFuzzerGatewayModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3000, () => {
    console.log('✅ Servidor HTTP/WebSocket ejecutándose en puerto 3000');
    console.log('📡 WebSocket disponible en: ws://localhost:3000');
  });
}
bootstrap();
