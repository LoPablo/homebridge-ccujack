import serviceAdapter from './serviceAdapter';
import { CCUJackPlatform } from '../platform';
import { Logger, PlatformAccessory } from 'homebridge';
import Channel from '../model/channel';
import Value from '../model/value';
import { CCUJackPlatformAccessory } from '../platformAccessory';
export default class BatteryAdapter extends serviceAdapter {
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
    handleStatusLowBatteryGet(): 1 | 0;
}
//# sourceMappingURL=batteryAdapter.d.ts.map