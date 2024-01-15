import {Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';

export default class ShutterContactAdapter extends serviceAdapter{

  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly channelObject : Channel;
  public readonly log: Logger;
  private service: Service;
  private valueParameter : Parameter;
  private lastValue : Value;


  static async newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject : Channel) {
    let stateValueParameterSearch : Parameter;
    for (const parameter of channelObject.parameters){
      if (parameter.id === 'STATE'){
        stateValueParameterSearch =parameter;
      }
    }
    if (stateValueParameterSearch! === null){
      ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: STATE Parameter is missing for shutterContact. Cannot continue');
    } else {
      ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: Getting first Value via http.');
      const firstValue = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateValueParameterSearch!.id);
      ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: STATE firstValue is: ' + JSON.stringify(firstValue));
      new ShutterContactAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch!, firstValue);
    }
  }

  private constructor(ccuJackAccessory: CCUJackPlatformAccessory, channelObject : Channel, valueParameter : Parameter, firstValue : Value) {
    super();
    this.platform = ccuJackAccessory.platform;
    this.accessory = ccuJackAccessory.accessory;
    this.channelObject = channelObject;
    this.log = ccuJackAccessory.log;
    this.valueParameter = valueParameter;
    this.lastValue = firstValue;
    this.service = this.accessory.getService(this.platform.Service.ContactSensor) || this.accessory.addService(this.platform.Service.ContactSensor);
    this.service.setCharacteristic(this.platform.Characteristic.Name, channelObject.title);
    this.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: Registering Value Callback for Mqtt.');

    Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.ContactSensorState)
      .onGet(this.handleContactSensorStateGet.bind(this));
  }



  newValue(newValue : Value) {
    this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
    this.lastValue = newValue;

    if (this.lastValue!.value === 0){
      this.service.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
    }else{
      this.service.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
  }

  handleContactSensorStateGet() {
    this.log.debug('Triggered GET ContactSensorState');

    if (this.lastValue!.value === 0){
      return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
    }else{
      return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    }

  }
}