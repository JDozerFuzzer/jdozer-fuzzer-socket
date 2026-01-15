import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Redis } from "ioredis";
import { EventEmitter2 } from "@nestjs/event-emitter";
@Injectable()
export class EventBroker implements OnModuleInit, OnModuleDestroy {

    private readonly log: Logger = new Logger(EventBroker.name);

    private pubClient: Redis;
    private subClient: Redis;
    private subEngine: Redis;

    constructor(@InjectRedis() private readonly redis: Redis, private eventEmitter: EventEmitter2) {
        this.log.log('EventBroker initialized');
    }
    onModuleDestroy() {
        this.log.debug('EventBroker destroyed');
        this.pubClient.disconnect();
        this.subClient.disconnect();
        this.subEngine.disconnect();
    }
    onModuleInit() {
        this.pubClient = this.redis.duplicate();
        this.subClient = this.redis.duplicate();
        this.subEngine = this.redis.duplicate();
        this.setupSubscriptions();
        this.setupEngineSubscriptions();
    }

    private async setupSubscriptions() {
        const channel: string = process.env.FUZZER_BROKER_NAME || 'jdozer:fuzzer:broker';
        this.subClient.subscribe(channel);
        this.log.log(`Subscribed to ${channel}`);

        this.subClient.on('message', (channel: string, message: string) => {
            this.log.debug(`Received message on channel ${channel}: ${message}`);
            try {
                const data = JSON.parse(message);
                this.eventEmitter.emit(`redis.${channel}`, {
                    channel: channel,
                    message: data,
                    timestamp: new Date().toISOString()
                });
            } catch (e) {
                this.log.error(`Error parsing message: ${message}`);
            }
        });
    }

    private async setupEngineSubscriptions() {
        const channel: string = process.env.FUZZER_ENGINE_CHANNEL || 'jdozer:fuzzer:engine';
        this.subEngine.subscribe(channel);
        this.log.log(`Subscribed to ${channel}`);

        this.subEngine.on('message', (channel: string, message: string) => {
            this.log.debug(`Received message on channel ${channel}: ${message}`);
            try {
                const data = JSON.parse(message);
                this.eventEmitter.emit(`redis.${channel}`, {
                    channel: channel,
                    message: data,
                    timestamp: new Date().toISOString()
                });
            } catch (e) {
                this.log.error(`Error parsing message: ${message}`);
            }
        });
    }

    public async publish(channel: string, message: any): Promise<number> {
        return this.pubClient.publish(channel, JSON.stringify(message));
    }

    public getPubClient(): Redis {
        return this.pubClient;
    }

}