import { CharacteristicValue, Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import Value from '../model/value';
import serviceAdapter from './serviceAdapter';
export default class OpticalSignalReceiverAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private colorLightService;
    private colorParameter;
    private colorBehaviorParameter;
    private levelParameter;
    private colorValue;
    private colorBehaviorValue;
    private levelValue;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    newColorValue(newColorValue: Value): void;
    newColorBehaviorValue(newColorBehaviorValue: Value): void;
    newLevelValue(newLevelValue: Value): void;
    handleOnGet(): boolean;
    handleOnSet(value: CharacteristicValue): void;
}
//# sourceMappingURL=opticalSignalReceiverAdapter.d.ts.map