import { PlatformAccessory, Logger } from 'homebridge';
import { CCUJackPlatform } from './platform';
import Device from './model/device';
export declare class CCUJackPlatformAccessory {
    readonly platform: CCUJackPlatform;
    readonly accessory: PlatformAccessory;
    readonly deviceObject: Device;
    readonly log: Logger;
    constructor(platform: CCUJackPlatform, accessory: PlatformAccessory, deviceObject: Device);
    private adapterCreation;
    private addServiceAdapters;
}
//# sourceMappingURL=platformAccessory.d.ts.map