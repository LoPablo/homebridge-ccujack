import {Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';

export default class KeytransceiverAdapter extends serviceAdapter{

  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly channelObject : Channel;
  public readonly log: Logger;
  private serviceStatelessSwitch : Service;
  public stateSinglePress : Parameter;
  private stateLongPress : Parameter;
  private stateLongPressStart : Parameter;
  private stateLongPressRelease : Parameter;
  private lastValueOrigin : Parameter;


  static async newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject : Channel) {
    let stateSinglePress : Parameter;
    let stateLongPress : Parameter;
    let stateLongPressStart : Parameter;
    let stateLongPressRelease : Parameter;

    for (const parameter of channelObject.parameters){
      switch (parameter.id){
        case 'PRESS_SHORT':{
          stateSinglePress = parameter;
          break;
        }
        case 'PRESS_LONG':{
          stateLongPress = parameter;
          break;
        }
        case 'PRESS_LONG_START':{
          stateLongPressStart = parameter;
          break;
        }
        case 'PRESS_LONG_RELEASE':{
          stateLongPressRelease = parameter;
          break;
        }

      }
    }
    if (stateSinglePress! && stateLongPress! && stateLongPressStart! && stateLongPressRelease!){
      ccuJackAccessory.log.info("{" + ccuJackAccessory.deviceObject.title + "," + channelObject.title + '}: Getting first mock value via http.');
      new KeytransceiverAdapter(ccuJackAccessory, channelObject, stateSinglePress!, stateLongPress!, stateLongPressStart!, stateLongPressRelease!);
    } else {
      ccuJackAccessory.log.info("{" + ccuJackAccessory.deviceObject.title + "," + channelObject.title + '}: One Button Parameter is missing for keytransceiver. Cannot continue');

     }
  }

  private constructor(ccuJackAccessory: CCUJackPlatformAccessory, channelObject : Channel, stateSinglePress : Parameter, stateLongPress : Parameter, stateLongPressStart : Parameter, stateLongPressRelease : Parameter) {
    super();
    this.platform = ccuJackAccessory.platform;
    this.accessory = ccuJackAccessory.accessory;
    this.channelObject = channelObject;
    this.log = ccuJackAccessory.log;
    this.lastValueOrigin = stateSinglePress;


    this.stateSinglePress = stateSinglePress;
    this.stateLongPress = stateLongPress;
    this.stateLongPressStart = stateLongPressStart;
    this.stateLongPressRelease = stateLongPressRelease;

    this.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: Registering Value Callbacks for Mqtt.');

    Api.getInstance().registerNewValueCallback(this.stateSinglePress.mqttStatusTopic, this.newValueSinglePress.bind(this));
    Api.getInstance().registerNewValueCallback(this.stateLongPress.mqttStatusTopic, this.newValueLongPress.bind(this));
    Api.getInstance().registerNewValueCallback(this.stateLongPressStart.mqttStatusTopic, this.newValueLongPressStart.bind(this));

    this.serviceStatelessSwitch = this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, this.channelObject.title) || this.accessory.addService(new this.platform.Service.StatelessProgrammableSwitch(ccuJackAccessory.deviceObject.title + channelObject.title, this.channelObject.title));

    this.serviceStatelessSwitch.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
      .onGet(this.handleProgrammableSwitchEventGet.bind(this))
      .setProps({
        validValues: [0, 2],
      });

    this.serviceStatelessSwitch.getCharacteristic(this.platform.Characteristic.ServiceLabelIndex)
      .onGet(this.handleServiceLabelIndexGet.bind(this));
  }

  handleServiceLabelIndexGet(){
    return Number(this.channelObject.identifier);
  }

  handleProgrammableSwitchEventGet(){
    switch (this.lastValueOrigin){
      case this.stateSinglePress: {
        return this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
      }
      case this.stateLongPress:
      case this.stateLongPressStart:{
        return this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
      }

      default:{
        return this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
      }
    }
  }

  newValueSinglePress(newValue : Value){
    this.lastValueOrigin = this.stateSinglePress;
    this.serviceStatelessSwitch.updateCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent, this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
  }

  newValueLongPress(newValue : Value){
    this.lastValueOrigin = this.stateLongPress;
    this.serviceStatelessSwitch.updateCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent, this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
  }

  newValueLongPressStart(newValue : Value){
    this.lastValueOrigin = this.stateLongPressStart;
    this.serviceStatelessSwitch.updateCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent, this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
  }

}