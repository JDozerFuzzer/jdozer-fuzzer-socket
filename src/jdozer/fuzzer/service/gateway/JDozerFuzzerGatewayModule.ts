import { Module } from "@nestjs/common";
import { JdozerFuzzerGateway } from "./JDozerFuzzerGateway";
import { EventBrokerModule } from "./broker/EventBrokerModule";
import { EventEmitterModule } from "@nestjs/event-emitter";


@Module({
    imports: [EventBrokerModule, EventEmitterModule.forRoot({
        wildcard: true,
        delimiter: '.',
        maxListeners: 10,
        verboseMemoryLeak: true,
        ignoreErrors: false
    })],
    providers: [JdozerFuzzerGateway]
})
export class JDozerFuzzerGatewayModule { }