import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { ChatBotModule } from './chatBot/chatbot.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@eccomerce-cluster.oambf.mongodb.net/ecommercedb?retryWrites=true&w=majority&appName=Eccomerce-cluster`,
    ),
    ProductModule,
    ChatBotModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
