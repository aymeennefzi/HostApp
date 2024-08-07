import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser'
import * as express from 'express';


const fs = require('fs');
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, { cors: true });

  await app.listen(3000);
  app.enableCors({
    origin: 'https://brilliant-sunburst-e8e337.netlify.app',
    credentials:  true,
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    
  });

  app.use(cookieParser());
  const expressApp = express();
}

bootstrap();
