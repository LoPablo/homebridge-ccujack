import serviceAdapter from './serviceAdapter';
import {CCUJackPlatform} from '../platform';
import {Logger, PlatformAccessory, Service} from 'homebridge';
import Channel from '../model/channel';
import Parameter from '../model/parameter';
import Value from '../model/value';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import Api from '../api';
import Tools from '../model/tools';


export default class BatteryAdapter extends serviceAdapter {
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
      if (parameter.id === 'LOW_BAT'){
        stateValueParameterSearch =parameter;
      }
    }
    if (stateValueParameterSearch! === null || stateValueParameterSearch! === undefined ) {
      ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: LOW_BAT Parameter is missing for Battery Service. Cannot continue');
    } else {
      ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: Getting first Value via http.');
      const firstValue = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateValueParameterSearch!.id);
      ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: STATE firstValue is: ' + JSON.stringify(firstValue));
      new BatteryAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch!, firstValue);
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
    this.service = this.accessory.getService(this.platform.Service.Battery) || this.accessory.addService(this.platform.Service.Battery);
    Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));
    this.service.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
      .onGet(this.handleStatusLowBatteryGet.bind(this));
    this.log.info("BATTERY IS: ", this.lastValue.value);
  }

  newValue(newValue : Value) {
    this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
    this.lastValue = newValue;

    if (this.lastValue!.value === false){
      this.service.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
    }else{
      this.service.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
    }
  }

  handleStatusLowBatteryGet() {
    this.log.debug('Triggered GET StatusLowBattery Get');

    if (this.lastValue!.value === false){
      return this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
    }else{
      return this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
    }
  }




}


