import Channel from './channel';
export default class Device {
    title: string;
    address: string;
    availableFirmware: string;
    firmware: string;
    interfaceType: string;
    rxMode: number;
    type: string;
    version: number;
    channels: Channel[];
    constructor(title: string, address: string, availableFirmware: string, firmware: string, interfaceType: string, rxMode: number, type: string, version: number, channels: Channel[]);
    static fromObject(object: any): Promise<Device>;
}
//# sourceMappingURL=device.d.ts.map