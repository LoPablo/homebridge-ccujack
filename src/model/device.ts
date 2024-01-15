import Link from './link';
import Tools from './tools';
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

  constructor(
    title: string,
    address: string,
    availableFirmware: string,
    firmware: string,
    interfaceType: string,
    rxMode: number,
    type: string,
    version: number,
    channels: Channel[],
  ) {
    this.title = title;
    this.address = address;
    this.availableFirmware = availableFirmware;
    this.firmware = firmware;
    this.interfaceType = interfaceType;
    this.rxMode = rxMode;
    this.type = type;
    this.version = version;
    this.channels = channels;
  }

  static async fromObject(object:any){
    return new Device(
      object.title,
      object.address,
      object.availableFirmware,
      object.firmware,
      object.interfaceType,
      object.rxMode,
      object.type,
      object.version,
      await Tools.getChannels(object.address, Tools.getLinks(object, 'channel')),
    );
  }

}