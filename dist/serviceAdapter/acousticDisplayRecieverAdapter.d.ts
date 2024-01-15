import { CharacteristicValue, Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import serviceAdapter from './serviceAdapter';
export default class AcousticDisplayRecieverAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private serviceLine1;
    private valueParameter;
    private lastValue;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    handleLineTextStateGet(): string;
    handleLineTextStateSet(value: CharacteristicValue): void;
}
//# sourceMappingURL=acousticDisplayRecieverAdapter.d.ts.map