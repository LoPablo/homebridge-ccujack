import {CharacteristicValue, Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import {DisplayLine, TextService} from './customServices';
import serviceAdapter from './serviceAdapter';


export default class AcousticDisplayRecieverAdapter extends serviceAdapter{

  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly channelObject : Channel;
  public readonly log: Logger;
  private serviceLine1 : Service;
  private valueParameter : Parameter;
  private lastValue : Value;


  static async newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject : Channel) {
    let stateValueParameterSearch : Parameter;
    for (const parameter of channelObject.parameters){
      if (parameter.id === 'COMBINED_PARAMETER'){
        stateValueParameterSearch =parameter;
      }
    }
    if (stateValueParameterSearch! === null){
      ccuJackAccessory.log.info(channelObject.address + ': STATE Parameter is missing for shutterContact. Cannot continue');
    } else {
      ccuJackAccessory.log.info(channelObject.address + ': Getting first value via http.');
      const firstValue = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateValueParameterSearch!.id);
      ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValue));
      new AcousticDisplayRecieverAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch!, firstValue);
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
    this.serviceLine1= this.accessory.getService(TextService) || this.accessory.addService(TextService);

    //this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');

    //Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));
    this.serviceLine1.getCharacteristic(DisplayLine)
      .onGet(this.handleLineTextStateGet.bind(this))
      .onSet(this.handleLineTextStateSet.bind(this));

  }


  handleLineTextStateGet() {
    return 'Penis';
  }

  handleLineTextStateSet(value : CharacteristicValue) {
    this.log.info(JSON.stringify(value));


  }




}