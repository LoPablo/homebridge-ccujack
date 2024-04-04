import { CharacteristicValue, Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import Value from '../model/value';
import serviceAdapter from './serviceAdapter';
export default class HoermannGarageDoorAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private garageDoorService;
    private commandParameter;
    private stateParameter;
    private lastStateValue;
    private assuemedState;
    private assumedTargetState;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    newValue(newValue: Value): void;
    handleCurrentDoorStateGet(): number;
    /**
       * Handle requests to get the current value of the "Target Door State" characteristic
       */
    handleTargetDoorStateGet(): number;
    /**
       * Handle requests to set the "Target Door State" characteristic
       */
    handleTargetDoorStateSet(value: CharacteristicValue): void;
}
//# sourceMappingURL=hoermannGarageDoorAdapter.d.ts.map