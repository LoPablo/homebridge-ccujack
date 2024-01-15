import {Logger, PlatformConfig, Service} from 'homebridge';
import RotaryHandleTransceiverAdapter from './rotaryHandleTransceiverAdapter';
import KeytransceiverAdapter from './keytransceiverAdapter';
import AcousticDisplayRecieverAdapter from './acousticDisplayRecieverAdapter';
import ShutterContactAdapter from './shutterContactAdapter';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import Parameter from '../model/parameter';

export default abstract class serviceAdapter{

  static neededChannelAndParameter : string[][];

}
