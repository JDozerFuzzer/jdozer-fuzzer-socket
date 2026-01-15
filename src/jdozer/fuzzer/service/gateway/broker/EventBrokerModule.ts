import { RedisModule } from "@nestjs-modules/ioredis";
import { Module } from "@nestjs/common";
import { EventBroker } from "./EventBroker";

@Module({
    imports: [
        RedisModule.forRoot({
            type: 'single',
            url: process.env.FUZZER_REDIS_HOST || 'redis://localhost:6379',
            options: {
                retryStrategy: (times: number) => {
                    return Math.min(times * 50, 2000);
                }
            }
        })
    ],
    providers: [EventBroker],
    exports: [EventBroker]
})
export class EventBrokerModule {
}