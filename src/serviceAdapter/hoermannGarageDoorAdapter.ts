import {Characteristic, CharacteristicValue, Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';


export default class HoermannGarageDoorAdapter extends serviceAdapter {

  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly channelObject: Channel;
  public readonly log: Logger;
  private garageDoorService: Service;

  private commandParameter: Parameter;
  private stateParameter: Parameter;
  private lastStateValue: Value;
  private assuemedState: number;
  private assumedTargetState: number;


  static async newInstance(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel) {
    let commandParameterSearch: Parameter;
    let stateParameterSearch: Parameter;
    for (const parameter of channelObject.parameters) {
      if (parameter.id === 'DOOR_COMMAND') {
        commandParameterSearch = parameter;
      }
      if (parameter.id === 'DOOR_STATE') {
        stateParameterSearch = parameter;
      }
    }
    if (stateParameterSearch! === null && commandParameterSearch! === null) {
      ccuJackAccessory.log.info(channelObject.address + ': STATE Parameter or COMMAND Parameter is missing for hörmann garage door opener. Cannot continue');
    } else {
      ccuJackAccessory.log.info(channelObject.address + ': Getting first stateValue via http.');
      const firstValue = await Tools.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateParameterSearch!.id);
      ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValue));
      new HoermannGarageDoorAdapter(ccuJackAccessory, channelObject, stateParameterSearch!, firstValue, commandParameterSearch!);
    }
  }

  private constructor(ccuJackAccessory: CCUJackPlatformAccessory, channelObject: Channel, stateParameter: Parameter, firstStateValue: Value, commandParameter: Parameter) {
    super();
    this.platform = ccuJackAccessory.platform;
    this.accessory = ccuJackAccessory.accessory;
    this.channelObject = channelObject;
    this.log = ccuJackAccessory.log;
    this.stateParameter = stateParameter;
    this.lastStateValue = firstStateValue;
    this.commandParameter = commandParameter;

    if (this.lastStateValue!.value === 0) {
      this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
      this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
    } else {
      this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPEN;
      this.assumedTargetState = this.platform.Characteristic.TargetDoorState.OPEN;
    }

    this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');

    //Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));
    Api.getInstance().registerNewValueCallback(this.stateParameter!.mqttStatusTopic!, this.newValue.bind(this));


    this.garageDoorService = this.accessory.getService(this.platform.Service.GarageDoorOpener) || this.accessory.addService(this.platform.Service.GarageDoorOpener);

    // create handlers for required characteristics
    this.garageDoorService.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
      .onGet(this.handleCurrentDoorStateGet.bind(this));

    this.garageDoorService.getCharacteristic(this.platform.Characteristic.TargetDoorState)
      .onGet(this.handleTargetDoorStateGet.bind(this))
      .onSet(this.handleTargetDoorStateSet.bind(this));

  }

  newValue(newValue: Value) {
    this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
    const previousValue = this.lastStateValue;
    this.lastStateValue = newValue;

    if (this.lastStateValue!.value === 0) {
      this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSED;

    } else if (this.lastStateValue!.value === 1 || this.lastStateValue.value === 2) {
      this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPEN;
      this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.platform.Characteristic.CurrentDoorState.OPEN);
    } else {
      if (previousValue.value === 0) {
        this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPENING;
      } else if (previousValue.value === 1) {
        this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSING;
      } else {
        this.assuemedState = this.platform.Characteristic.CurrentDoorState.STOPPED;
      }
      return;
    }
    this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assuemedState);

  }

  handleCurrentDoorStateGet() {
    this.log.debug('Triggered GET CurrentDoorState');
    return this.assuemedState;
  }

  /**
     * Handle requests to get the current value of the "Target Door State" characteristic
     */
  handleTargetDoorStateGet() {
    this.log.debug('Triggered GET TargetDoorState');
    return this.assumedTargetState;
  }

  /**
     * Handle requests to set the "Target Door State" characteristic
     */
  handleTargetDoorStateSet(value: CharacteristicValue) {
    this.log.debug('Triggered SET TargetDoorState: ' + value);
    if (value === this.platform.Characteristic.TargetDoorState.CLOSED) {
      Api.getInstance().putCommand('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', '3');

    } else if (value === this.platform.Characteristic.TargetDoorState.OPEN) {
      Api.getInstance().putCommand('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', '1');

    }
  }


}