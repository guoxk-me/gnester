import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Demo } from './entities/demo.entity';

// use subscriber to listen to Demo entity events 使用订阅器监听Demo实体事件
@EventSubscriber()
export class DemoSubscriber implements EntitySubscriberInterface<Demo> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Demo;
  }

  beforeInsert(event: InsertEvent<Demo>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
