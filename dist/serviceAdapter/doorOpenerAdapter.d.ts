import { CharacteristicValue, Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import Value from '../model/value';
import serviceAdapter from './serviceAdapter';
export default class DoorOpenerAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private garageDoorService;
    private ventingSwitchService;
    private commandParameter;
    private stateParameter;
    private sectionParameter;
    private stateValue;
    private sectionValue;
    private assumedState;
    private assumedTargetState;
    private stateTimeout?;
    private debounceTimeout?;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    convertValuesToAssumedStates(): void;
    newSectionValue(newSectionValue: Value): void;
    newStateValue(newValue: Value): void;
    handleCurrentDoorStateGet(): number;
    handleTargetDoorStateGet(): number;
    handleOnGet(): 1 | 0;
    /**
     * Handle requests to set the "On" characteristic
     */
    handleOnSet(value: CharacteristicValue): void;
    handleTargetDoorStateSet(value: CharacteristicValue): void;
}
//# sourceMappingURL=doorOpenerAdapter.d.ts.map