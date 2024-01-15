import {Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';

export default class RotaryHandleTransceiverAdapter extends serviceAdapter{

  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly channelObject : Channel;
  public readonly log: Logger;
  private serviceTitled: Service;
  private serviceOpened: Service;
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
      ccuJackAccessory.log.info(channelObject.address + ': STATE Parameter is missing for shutterContact. Cannot continue');
    } else {
      ccuJackAccessory.log.info(channelObject.address + ': Getting first value via http.');
      const firstValue = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateValueParameterSearch!.id);
      ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValue));
      new RotaryHandleTransceiverAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch!, firstValue);
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
    this.serviceTitled = this.accessory.getServiceById(this.platform.Service.ContactSensor, 'Kipp') || this.accessory.addService(new this.platform.Service.ContactSensor(ccuJackAccessory.deviceObject.title + ' Kipp Status', 'Kipp'));
    this.serviceOpened = this.accessory.getServiceById(this.platform.Service.ContactSensor, 'Offen') || this.accessory.addService(new this.platform.Service.ContactSensor(ccuJackAccessory.deviceObject.title + ' Offen Status', 'Offen'));
    this.serviceTitled.setCharacteristic(this.platform.Characteristic.Name, ccuJackAccessory.deviceObject.title + ' Kipp Status');
    this.serviceOpened.setCharacteristic(this.platform.Characteristic.Name, ccuJackAccessory.deviceObject.title + ' Offen Status');
    this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');

    Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));

    this.serviceTitled.getCharacteristic(this.platform.Characteristic.ContactSensorState)
      .onGet(this.handleContactSensorTiltedStateGet.bind(this));
    this.serviceOpened.getCharacteristic(this.platform.Characteristic.ContactSensorState)
      .onGet(this.handleContactSensorOpenedStateGet.bind(this));
  }



  newValue(newValue : Value) {
    this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
    this.lastValue = newValue;

    if (this.lastValue.value === 0){
      this.serviceOpened.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
      this.serviceTitled.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
    }else if (this.lastValue.value === 1){
      this.serviceOpened.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
      this.serviceTitled.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    } else {
      this.serviceOpened.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
      this.serviceTitled.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);

    }
  }

  handleContactSensorTiltedStateGet() {
    this.log.debug('Triggered GET ContactSensorState');

    if (this.lastValue.value === 1){
      return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    }else {
      return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
    }
  }

  handleContactSensorOpenedStateGet() {
    this.log.debug('Triggered GET ContactSensorState');

    if (this.lastValue.value === 2){
      return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    }else {
      return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
    }

  }
}