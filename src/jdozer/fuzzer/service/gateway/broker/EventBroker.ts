import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Redis } from "ioredis";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ProcessorEvent } from "./ProcessorEvent";
import { Channels } from "./Channels";
@Injectable()
export class EventBroker implements OnModuleInit, OnModuleDestroy {

    private readonly log: Logger = new Logger(EventBroker.name);

    private pubClient: Redis;
    private subClient: Redis;
    private subEngine: Redis;
    private subProcessor: Redis;
    private subSeeder: Redis;
    private subVectors: Redis;

    constructor(@InjectRedis() private readonly redis: Redis, private eventEmitter: EventEmitter2) {
        this.log.log('EventBroker initialized');
    }
    onModuleDestroy() {
        this.log.debug('EventBroker destroyed');
        this.pubClient.disconnect();
        this.subClient.disconnect();
        this.subEngine.disconnect();
        this.subProcessor.disconnect();
        this.subSeeder.disconnect();
    }
    onModuleInit() {
        this.pubClient = this.redis.duplicate();
        this.subClient = this.redis.duplicate();
        this.subEngine = this.redis.duplicate();
        this.subProcessor = this.redis.duplicate();
        this.subSeeder = this.redis.duplicate();
        this.subVectors = this.redis.duplicate();

        //this.setupSubscriptions();
        this.setupEngineSubscriptions();
        this.setupProcessorSubscriptions();
        this.setupSeederSubscriptions();
        this.setupVectorsSubscriptions();
    }

    private async setupVectorsSubscriptions() {
        const channel: string = process.env.FUZZER_VECTORS_CHANNEL || 'fuzzer:vectors';
        this.subVectors.subscribe(channel);
        this.log.log(`Subscribed to ${channel}`);

        this.subVectors.on('message', (channel: string, message: string) => {
            this.log.verbose(`[setupVectorsSubscriptions] Received message on channel ${channel}: ${message}`);
            try {
                this.eventEmitter.emit(Channels.EVENT_RUNNING, message);
            } catch (e) {
                this.log.error(`[setupVectorsSubscriptions] Error parsing message: ${message}`);
            }
        });
    }

    private async setupSeederSubscriptions() {
        const channel: string = process.env.FUZZER_SEEDER_CHANNEL || 'fuzzer:seeder';
        this.subSeeder.subscribe(channel);
        this.log.log(`Subscribed to ${channel}`);

        this.subSeeder.on('message', (channel: string, message: string) => {
            this.log.verbose(`[setupSeederSubscriptions] Received message on channel ${channel}: ${message}`);
            try {
                this.eventEmitter.emit(Channels.EVENT_RUNNING, message);
            } catch (e) {
                this.log.error(`[setupSeederSubscriptions] Error parsing message: ${message}`);
            }
        });
    }

    private async setupSubscriptions() {
        const channel: string = process.env.FUZZER_BROKER_NAME || 'jdozer:fuzzer:broker';
        this.subClient.subscribe(channel);
        this.log.log(`Subscribed to ${channel}`);

        this.subClient.on('message', (channel: string, message: string) => {
            this.log.debug(`[setupSubscriptions] Received message on channel ${channel}: ${message}`);
            try {
                const data = JSON.parse(message);
                this.eventEmitter.emit(`redis.${channel}`, {
                    channel: channel,
                    message: data,
                    timestamp: new Date().getTime()
                });
            } catch (e) {
                this.log.error(`[setupSubscriptions] Error parsing message: ${message}`);
            }
        });
    }

    private async setupProcessorSubscriptions() {
        const channel: string = process.env.FUZZER_PROCESSOR_CHANNEL || 'fuzzer:processor';
        this.subProcessor.subscribe(channel);
        this.log.log(`[setupProcessorSubscriptions] Subscribed to ${channel}`);

        this.subProcessor.on('message', (channel: string, message: string) => {
            this.log.verbose(`[setupProcessorSubscriptions] Received message on channel ${channel}: ${message}`);
            try {
                this.eventEmitter.emit(Channels.EVENT_RUNNING, message);
            } catch (e) {
                this.log.error(`[setupProcessorSubscriptions] Error parsing message: ${message}`);
            }
        });
    }

    private async setupEngineSubscriptions() {
        const channel: string = process.env.FUZZER_ENGINE_CHANNEL || 'fuzzer:engine';
        this.subEngine.subscribe(channel);
        this.log.log(`Subscribed to ${channel}`);

        this.subEngine.on('message', (channel: string, message: string) => {
            this.log.debug(`[setupEngineSubscriptions] Received message on channel ${channel}: ${message}`);
            try {
                this.eventEmitter.emit(Channels.EVENT_RUNNING, message);
            } catch (e) {
                this.log.error(`[setupEngineSubscriptions] Error parsing message: ${message}`);
            }
        });
    }

    public async publish(channel: string, message: any): Promise<number> {
        this.log.debug(`[publish] Publishing message on channel ${channel}: ${message}`);
        return this.pubClient.publish(channel, JSON.stringify(message));
    }

    public getPubClient(): Redis {
        return this.pubClient;
    }

}