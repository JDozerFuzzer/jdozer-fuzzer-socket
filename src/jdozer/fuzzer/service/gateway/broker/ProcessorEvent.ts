import { Logger } from "@nestjs/common";
import { Channels } from "./Channels";


export class ProcessorEvent {

    private static readonly log: Logger = new Logger(ProcessorEvent.name);

    private static readonly OUTBOUND: any = {
        RUNNING_CHANNEL: Channels.EVENT_RUNNING,
        RUNNING_TAGGING_NAME: 'fuzzer.running.tagging'
    };

    private static readonly INBOUND: any = {
        tagging: 'tagging',
        statusCodeRuntime: 'status-code-runtime'
    };

    private static instance: ProcessorEvent;

    private constructor() {
        ProcessorEvent.log.log('ProcessorEvent initialized');
    }

    public static getInstance(): ProcessorEvent {
        if (!ProcessorEvent.instance) {
            ProcessorEvent.instance = new ProcessorEvent();
        }
        return ProcessorEvent.instance;
    }

    public route(event: any) {
        ProcessorEvent.log.verbose(`Routing event: ${event}`);
        try {

            switch (event.eventType) {
                case ProcessorEvent.INBOUND.statusCodeRuntime:
                    return this.statusCodeRuntime(event);
                default:
                    ProcessorEvent.log.warn(`Unknown event type: ${event.eventType}`);
                    throw new Error(`Unknown event type: ${event.eventType}`);
            }

            if (event.eventType === ProcessorEvent.INBOUND.tagging) {
                return this.tagging(event);
            } else {
                ProcessorEvent.log.warn(`Unknown event type: ${event.eventType}`);
                throw new Error(`Unknown event type: ${event.eventType}`);
            }
        } catch (e) {
            ProcessorEvent.log.error(`Error routing event: ${event}`);
            throw e;
        }
    }

    private statusCodeRuntime(event: any) {
        try {

        } catch (e) {

        }
    }

    private tagging(event: any) {
        ProcessorEvent.log.verbose(`Tagging event: ${event}`);
        try {
            return {
                channel: ProcessorEvent.OUTBOUND.RUNNING_CHANNEL,
                name: ProcessorEvent.OUTBOUND.RUNNING_TAGGING_NAME,
                data: {
                    entityType: 'tagging',
                    eventType: 'running',
                    data: event.data,
                    timestamp: new Date().getTime()
                }
            };
        } catch (e) {
            ProcessorEvent.log.error(`Error tagging event: ${event}`);
            throw e;
        }

    }

}