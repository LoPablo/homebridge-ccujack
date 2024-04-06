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
    private commandParameter;
    private stateParameter;
    private lastStateValue;
    private assuemedState;
    private assumedTargetState;
    private stateTimeout?;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    newValue(newValue: Value): void;
    newAssumedState(assumedState: number): void;
    handleCurrentDoorStateGet(): number;
    handleTargetDoorStateGet(): number;
    handleTargetDoorStateSet(value: CharacteristicValue): void;
}
//# sourceMappingURL=doorOpenerAdapter.d.ts.map