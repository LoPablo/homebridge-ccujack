import { Logger, PlatformConfig } from 'homebridge';
import Value from './model/value';
export default class Api {
    private readonly config;
    private static instance;
    readonly log: Logger;
    private mqttClient;
    private newValueListeners;
    private constructor();
    static createInstance(log: Logger, config: PlatformConfig): void;
    static getInstance(): Api;
    makeRequest(subPath: string): Promise<any>;
    putCommand(subPath: string, value: string): Promise<any>;
    registerNewValueCallback(mqttTopic: string, callback: (newValue: Value) => void): void;
    informCallback(mqttTopic: string, newValue: Value): void;
}
//# sourceMappingURL=api.d.ts.map