import Link from './link';
import Device from './device';
import Tools from './tools';

export default class DeviceList {
  devices: Device[];

  constructor(devices:Device[]){
   this.devices = devices;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async fromObject(object:any) : Promise<DeviceList>{

    return new DeviceList(
      await Tools.getDevices(Tools.getLinks(object, 'device')),
    );
  }
}