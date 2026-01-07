import { Module } from "@nestjs/common";
import { JdozerFuzzerGateway } from "./JDozerFuzzerGateway";


@Module({
    imports: [],
    providers: [JdozerFuzzerGateway]
})
export class JDozerFuzzerModule { }