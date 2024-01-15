import { Logger, PlatformAccessory } from 'homebridge';
import { CCUJackPlatformAccessory } from '../platformAccessory';
import { CCUJackPlatform } from '../platform';
import Channel from '../model/channel';
import Value from '../model/value';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';
export default class KeytransceiverAdapter extends serviceAdapter {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly channelObject: Channel;
    readonly log: Logger;
    private serviceStatelessSwitch;
    stateSinglePress: Parameter;
    private stateLongPress;
    private stateLongPressStart;
    private stateLongPressRelease;
    private lastValueOrigin;
    static newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel): Promise<void>;
    private constructor();
    handleServiceLabelIndexGet(): number;
    handleProgrammableSwitchEventGet(): 0 | 2;
    newValueSinglePress(newValue: Value): void;
    newValueLongPress(newValue: Value): void;
    newValueLongPressStart(newValue: Value): void;
}
//# sourceMappingURL=keytransceiverAdapter.d.ts.map