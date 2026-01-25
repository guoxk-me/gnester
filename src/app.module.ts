import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'config/database.config';
import { validate } from 'config/validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoModule } from './demo/demo.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisConfig from 'config/redis.config';
import configuration from 'config/configuration';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    CacheModule.registerAsync(redisConfig.asProvider()),
    DemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
