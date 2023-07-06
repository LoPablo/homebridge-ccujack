import Channel from './channel';
import Link from './link';
import Api from '../api';
import Device from './device';
import Parameter from './parameter';
import Value from './value';

export default class Tools{
  static getLinks(object:any, withType : string) : Link[]{
    const links : Link[] = [];
    for (const linkEntry of object['~links']){
      const tmp = Link.fromObject(linkEntry);
      if(tmp.rel === withType){
        links.push(Link.fromObject(linkEntry));
      }
    }
    return links;
  }



  static async getFirstValueOfParameter(parentDeviceAdress : string, parentChannelNumber :string, parameterId : string) : Promise<Value>{
    const responseForValue = await Api.getInstance().makeRequest('device/' + parentDeviceAdress + '/' + parentChannelNumber +'/' + parameterId + '/~pv');
    return Value.fromObject(responseForValue);
  }

  static async getParamters(parentDeviceAdress : string, parentChannelNumber :string, links:Link[]) : Promise<Parameter[]> {
    const parameters: Parameter[] = [];

    for (const parameter of links) {
      const responseForParameter = await Api.getInstance().makeRequest('device/' + parentDeviceAdress + '/' + parentChannelNumber +'/' + parameter.href);
      const parameterObject: Parameter = await Parameter.fromObject(responseForParameter);
      parameters.push(parameterObject);
    }
    return parameters;
  }

  static async getChannels(parentDeviceAddress : string, links:Link[]) : Promise<Channel[]> {
    const  channels: Channel[] = [];

    for (const channel of links) {

      const responseForChannel = await Api.getInstance().makeRequest('device/' + parentDeviceAddress + '/' + channel.href);
      const channelObject: Channel = await Channel.fromObject(responseForChannel);
      channels.push(channelObject);
    }
    return channels;
  }


  static async getDevices(links: Link[]): Promise<Device[]> {
    const devices: Device[] = [];

    for (const device of links) {

      const responseForDevice = await Api.getInstance().makeRequest('device/' + device.href);
      const deviceObject: Device = await Device.fromObject(responseForDevice);
      devices.push(deviceObject);
    }
    return devices;
  }

}