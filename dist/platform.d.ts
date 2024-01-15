import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
export declare class CCUJackPlatform implements DynamicPlatformPlugin {
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly log: Logger;
    readonly config: PlatformConfig;
    readonly api: API;
    readonly accessories: PlatformAccessory[];
    constructor(log: Logger, config: PlatformConfig, api: API);
    checkConfigOK(): boolean;
    firstContact(): Promise<boolean>;
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void;
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices(): Promise<void>;
}
//# sourceMappingURL=platform.d.ts.map