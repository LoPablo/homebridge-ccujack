import {Characteristic, CharacteristicValue, Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';


export default class OpticalSignalReceiverAdapter extends serviceAdapter {

  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly channelObject: Channel;
  public readonly log: Logger;

  private colorLightService: Service;

  private colorParameter: Parameter;
  private colorBehaviorParameter: Parameter;
  private levelParameter: Parameter;

  private colorValue : Value;
  private colorBehaviorValue : Value;
  private levelValue : Value;


  static async newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel) {
    let colorParameterSearch: Parameter;
    let colorBehaviorParameterSearch: Parameter;
    let levelParameterSearch: Parameter;

    for (const parameter of channelObject.parameters) {
      if (parameter.id === 'COLOR') {
        colorParameterSearch = parameter;
      }
      if (parameter.id === 'COLOR_BEHAVIOUR') {
        colorBehaviorParameterSearch = parameter;
      }
      if (parameter.id === 'LEVEL') {
        levelParameterSearch = parameter;
      }
    }
    if (colorParameterSearch! === undefined && colorBehaviorParameterSearch! === undefined && levelParameterSearch! === undefined) {
      ccuJackAccessory.log.info(channelObject.address + ': COLOR, COLOR_BEHAVIOR or LEVEL Parameter is missing for switch light. Cannot continue');
    } else {
      ccuJackAccessory.log.info(channelObject.address + ': Getting first stateValue via http.');
      const firstValueColor = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, colorParameterSearch!.id);
      ccuJackAccessory.log.info(channelObject.address + ': COLOR firstValue ist: ' + JSON.stringify(firstValueColor));
      const firstValueColorBehavior = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, colorBehaviorParameterSearch!.id);
      ccuJackAccessory.log.info(channelObject.address + ': COLOR_BEHAVIOR firstValue ist: ' + JSON.stringify(firstValueColorBehavior));
      const firstValueLevel = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, levelParameterSearch!.id);
      ccuJackAccessory.log.info(channelObject.address + ': LEVEL firstValue ist: ' + JSON.stringify(firstValueLevel));

      new OpticalSignalReceiverAdapter(ccuJackAccessory, channelObject, colorParameterSearch!, colorBehaviorParameterSearch!, levelParameterSearch!, firstValueColor, firstValueColorBehavior, firstValueLevel);
    }
  }

  private constructor(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel, colorParameter: Parameter, colorBehaviorParameter : Parameter, levelParameter : Parameter, firstColorValue: Value, firstColorBehaviorValue : Value, firstLevelValue : Value) {
    super();
    this.platform = ccuJackAccessory.platform;
    this.accessory = ccuJackAccessory.accessory;
    this.channelObject = channelObject;
    this.log = ccuJackAccessory.log;
    this.colorParameter = colorParameter;
    this.colorBehaviorParameter = colorBehaviorParameter;
    this.levelParameter = levelParameter;

    this.colorValue = firstColorValue;
    this.colorBehaviorValue = firstColorBehaviorValue;
    this.levelValue = firstLevelValue;


    this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');

    if (this.colorValue.value === 0) {
      Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorParameter.id + '/~pv', 1);
    }
    if (this.levelValue.value === 0) {
      Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorParameter.id + '/~pv', 1);
    }

    Api.getInstance().registerNewValueCallback(this.colorParameter!.mqttStatusTopic!, this.newColorValue.bind(this));
    Api.getInstance().registerNewValueCallback(this.colorBehaviorParameter!.mqttStatusTopic!, this.newColorBehaviorValue.bind(this));
    Api.getInstance().registerNewValueCallback(this.levelParameter!.mqttStatusTopic!, this.newLevelValue.bind(this));



    this.colorLightService = this.accessory.getServiceById(this.platform.Service.Lightbulb, this.channelObject.title) || this.accessory.addService(new this.platform.Service.Lightbulb(ccuJackAccessory.deviceObject.title + channelObject.title, this.channelObject.title));


    this.colorLightService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleOnGet.bind(this))
      .onSet(this.handleOnSet.bind(this));

    this.colorLightService.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.handleBrightnessSet.bind(this))
      .onGet(this.handleBrightnessGet.bind(this));

   // this.service.getCharacteristic(this.platform.Characteristic.Hue)
   //   .onSet(this.handleHueSet.bind(this))
    //  .onGet(this.handleHueGet.bind(this));

    //this.service.getCharacteristic(this.platform.Characteristic.Saturation)
     // .onSet(this.handleSaturationSet.bind(this))
     // .onGet(this.handleSaturationGet.bind(this));


  }

  newColorValue(newColorValue: Value): void {
    this.colorValue = newColorValue;
    this.log.info('New Color Value: ' + JSON.stringify(newColorValue));
  }

  newColorBehaviorValue(newColorBehaviorValue: Value): void {
    this.colorValue = newColorBehaviorValue;
    this.log.info('New ColorBehavior Value: ' + JSON.stringify(newColorBehaviorValue));
    if (this.colorBehaviorValue.value >= 1) {
      this.colorLightService.updateCharacteristic(this.platform.Characteristic.On, true);
    } else {
      this.colorLightService.updateCharacteristic(this.platform.Characteristic.On, false);
    }
  }

  newLevelValue(newLevelValue: Value): void {
    this.colorValue = newLevelValue;
    this.log.info('New Level Value: ' + JSON.stringify(newLevelValue));
    this.colorLightService.updateCharacteristic(this.platform.Characteristic.Brightness, Number(newLevelValue.value) * 100);
  }

  handleOnGet() {
    this.log.debug('Triggered GET On');
    return this.colorValue!.value >= 1;
  }

  handleBrightnessGet() {
    this.log.debug('Triggered GET Brightness Number(this.levelValue!.value)*100;');
    return Number(this.levelValue!.value)*100;
  }

  handleBrightnessSet(value : CharacteristicValue) {
    this.log.info('Triggered SET Brightness: '+ value);
    Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.levelParameter.id + '/~pv', Number(value)/100);
}

  handleOnSet(value : CharacteristicValue) {
    this.log.info('Triggered SET On: '+ value);
    if (value === true) {
      Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorBehaviorParameter.id + '/~pv', 1);
    } else {
      Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorBehaviorParameter.id + '/~pv', 0);

    }
  }

}