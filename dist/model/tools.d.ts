import Channel from './channel';
import Link from './link';
import Device from './device';
import Parameter from './parameter';
import Value from './value';
export default class Tools {
    static getLinks(object: any, withType: string): Link[];
    static getFirstValueOfParameter(parentDeviceAdress: string, parentChannelNumber: string, parameterId: string): Promise<Value>;
    static getParamters(parentDeviceAdress: string, parentChannelNumber: string, links: Link[]): Promise<Parameter[]>;
    static getChannels(parentDeviceAddress: string, links: Link[]): Promise<Channel[]>;
    static getDevices(links: Link[]): Promise<Device[]>;
}
//# sourceMappingURL=tools.d.ts.map