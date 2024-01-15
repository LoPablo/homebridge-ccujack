import { Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import Value from '../model/value';
import serviceAdapter from './serviceAdapter';
export default class ShutterContactAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private service;
    private valueParameter;
    private lastValue;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    newValue(newValue: Value): void;
    handleContactSensorStateGet(): 1 | 0;
}
//# sourceMappingURL=shutterContactAdapter.d.ts.map