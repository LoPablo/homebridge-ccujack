import { CharacteristicValue, Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import Value from '../model/value';
import serviceAdapter from './serviceAdapter';
export default class SwitchReceiverAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private service;
    private stateParameter;
    private lastStateValue;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    newValue(newValue: Value): void;
    handleOnGet(): string | number | boolean;
    /**
       * Handle requests to set the "On" characteristic
       */
    handleOnSet(value: CharacteristicValue): void;
}
//# sourceMappingURL=switchReceiverAdapter.d.ts.map