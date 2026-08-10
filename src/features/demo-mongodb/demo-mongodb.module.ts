import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemoMongodbController } from './demo-mongodb.controller';
import { DemoMongodbService } from './demo-mongodb.service';
import { DemoMongo, DemoMongoSchema } from './schemas/demo-mongo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DemoMongo.name, schema: DemoMongoSchema },
    ]),
  ],
  controllers: [DemoMongodbController],
  providers: [DemoMongodbService],
})
export class DemoMongodbModule {}
