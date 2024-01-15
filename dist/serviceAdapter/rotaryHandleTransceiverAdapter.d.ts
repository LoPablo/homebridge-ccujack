import { Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import Value from '../model/value';
import serviceAdapter from './serviceAdapter';
export default class RotaryHandleTransceiverAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private serviceTitled;
    private serviceOpened;
    private valueParameter;
    private lastValue;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    newValue(newValue: Value): void;
    handleContactSensorTiltedStateGet(): 1 | 0;
    handleContactSensorOpenedStateGet(): 1 | 0;
}
//# sourceMappingURL=rotaryHandleTransceiverAdapter.d.ts.map