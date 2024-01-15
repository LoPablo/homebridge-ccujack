import Device from './device';
export default class DeviceList {
    devices: Device[];
    constructor(devices: Device[]);
    static fromObject(object: any): Promise<DeviceList>;
}
//# sourceMappingURL=deviceList.d.ts.map