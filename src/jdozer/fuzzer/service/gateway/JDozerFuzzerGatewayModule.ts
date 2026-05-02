import { Module } from "@nestjs/common";
import { JdozerFuzzerGateway } from "./JDozerFuzzerGateway";
import { EventBrokerModule } from "./broker/EventBrokerModule";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BffModule } from "../../bff/BffModule";


@Module({
    imports: [EventBrokerModule, EventEmitterModule.forRoot({
        wildcard: true,
        delimiter: '.',
        maxListeners: 10,
        verboseMemoryLeak: true,
        ignoreErrors: false
    }), BffModule],
    providers: [JdozerFuzzerGateway]
})
export class JDozerFuzzerGatewayModule { }