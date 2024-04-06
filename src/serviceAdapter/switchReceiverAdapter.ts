import {Characteristic, CharacteristicValue, Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';


export default class SwitchReceiverAdapter extends serviceAdapter {

  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly channelObject: Channel;
  public readonly log: Logger;
  private service: Service;

  private stateParameter: Parameter;
  private lastStateValue: Value;


  static async newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel) {
    let stateParameterSearch: Parameter;
    for (const parameter of channelObject.parameters) {
      if (parameter.id === 'STATE') {
        stateParameterSearch = parameter;
      }
    }
    if (stateParameterSearch! === null) {
      ccuJackAccessory.log.info(channelObject.address + ': STATE Parameter is missing for hörmann garage door opener. Cannot continue');
    } else {
      ccuJackAccessory.log.info(channelObject.address + ': Getting first stateValue via http.');
      const firstValue = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateParameterSearch!.id);
      ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValue));
      new SwitchReceiverAdapter(ccuJackAccessory, channelObject, stateParameterSearch!, firstValue);
    }
  }

  private constructor(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel, stateParameter: Parameter, firstStateValue: Value) {
    super();
    this.platform = ccuJackAccessory.platform;
    this.accessory = ccuJackAccessory.accessory;
    this.channelObject = channelObject;
    this.log = ccuJackAccessory.log;
    this.stateParameter = stateParameter;
    this.lastStateValue = firstStateValue;

    this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');

    //Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));
    Api.getInstance().registerNewValueCallback(this.stateParameter!.mqttStatusTopic!, this.newValue.bind(this));


    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleOnGet.bind(this))
      .onSet(this.handleOnSet.bind(this));
  }

  newValue(newValue: Value) {
    this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
    this.lastStateValue = newValue;
    this.service.updateCharacteristic(this.platform.Characteristic.On, newValue.value);
  }

  handleOnGet() {
    this.log.debug('Triggered GET On');
    return this.lastStateValue.value;
  }

  /**
     * Handle requests to set the "On" characteristic
     */
  handleOnSet(value: CharacteristicValue) {
    this.log.debug('Triggered SET On:' + value);
    if (value === 1) {
      Api.getInstance().putCommandBoolean('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.stateParameter.id + '/~pv', true);
    } else {
      Api.getInstance().putCommandBoolean('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.stateParameter.id + '/~pv', false);
    }
  }

}