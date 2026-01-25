import { registerAs } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
export default registerAs('cache', () => {
  return {
    stores: [new KeyvRedis('redis://localhost:6379')],
  };
});
