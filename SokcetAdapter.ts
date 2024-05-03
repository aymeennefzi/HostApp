import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as http from 'http';

export class SocketAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    // Ajoutez ici vos configurations spécifiques du serveur Socket.IO si nécessaire
    return server;
  }
}