import {Characteristic, CharacteristicValue, Logger, PlatformAccessory, Service} from 'homebridge';
import {CCUJackPlatformAccessory} from '../platformAccessory';
import {CCUJackPlatform} from '../platform';
import Channel from '../model/channel';
import Tools from '../model/tools';
import Value from '../model/value';
import Api from '../api';
import Parameter from '../model/parameter';
import serviceAdapter from './serviceAdapter';


export default class DoorOpenerAdapter extends serviceAdapter {

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

  private stateTimeout?: ReturnType<typeof setTimeout>;


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
      new DoorOpenerAdapter(ccuJackAccessory, channelObject, stateParameterSearch!, firstValue, commandParameterSearch!);
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

    Api.getInstance().registerNewValueCallback(this.stateParameter!.mqttStatusTopic!, this.newValue.bind(this));


    this.garageDoorService = this.accessory.getService(this.platform.Service.GarageDoorOpener) || this.accessory.addService(this.platform.Service.GarageDoorOpener);

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

    if (this.stateTimeout) {
      clearTimeout(this.stateTimeout!);
    }

    if (this.lastStateValue!.value === 0) {
      this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
    } else if (this.lastStateValue!.value === 1 || this.lastStateValue.value === 2) {
      this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPEN;
      if (this.stateTimeout) {
        clearTimeout(this.stateTimeout!);
      }
    } else {
      if (previousValue.value === 0) {
        this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPENING;
      } else if (previousValue.value === 1) {
        this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSING;
      } else {
        this.assuemedState = this.platform.Characteristic.CurrentDoorState.STOPPED;
      }
      this.stateTimeout = setTimeout(() => {
        this.assuemedState = this.platform.Characteristic.CurrentDoorState.STOPPED;
        this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assuemedState);
      }, 10000);
    }

    this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assuemedState);
  }

  newAssumedState(assumedState: number) {
    this.assuemedState = assumedState;
    this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assuemedState);


  }

  handleCurrentDoorStateGet() {
    this.log.debug('Triggered GET CurrentDoorState');
    return this.assuemedState;
  }

  handleTargetDoorStateGet() {
    this.log.debug('Triggered GET TargetDoorState');
    return this.assumedTargetState;
  }

  handleTargetDoorStateSet(value: CharacteristicValue) {
    this.log.debug('Triggered SET TargetDoorState: ' + value);
    if (value === this.platform.Characteristic.TargetDoorState.CLOSED) {
      this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
      Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 3);
    } else if (value === this.platform.Characteristic.TargetDoorState.OPEN) {
      this.assumedTargetState = this.platform.Characteristic.TargetDoorState.OPEN;
      Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 1);
    }
  }

}