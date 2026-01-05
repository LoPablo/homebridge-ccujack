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
  private assumedState: number;
  private assumedTargetState: number;

  private stateTimeout?: ReturnType<typeof setTimeout>;
  private debounceTimeout?: ReturnType<typeof setTimeout>;

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
      this.assumedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
      this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
    } else {
      this.assumedState = this.platform.Characteristic.CurrentDoorState.OPEN;
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

  parseAndSetValue(value: Value) {

  }

  newValue(newValue: Value) {
    this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
    const previousValue = this.lastStateValue;
    this.lastStateValue = newValue;

    if (this.stateTimeout) {
      clearTimeout(this.stateTimeout!);
      this.log.info('Cleared State Timeout');
    }

    if (this.lastStateValue!.value === 0) {
      this.assumedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
      this.log.info('New Value is closed, therefore assumed state is closed.');
    } else if (this.lastStateValue!.value === 1 || this.lastStateValue!.value === 2) {
      this.assumedState = this.platform.Characteristic.CurrentDoorState.OPEN;
      this.log.info('New Value is open or venting (' + this.lastStateValue! + ') , therefore assumed state is open.');
    } else if (this.lastStateValue!.value === 3) {
      this.log.info('New Value is unknown position, see next message for more info...');
      if (previousValue.value === 0) {
        this.assumedState = this.platform.Characteristic.CurrentDoorState.OPENING;
        this.log.info('...old Value was closed, lets assume we are opening');
      } else if (previousValue.value === 1 || previousValue.value === 2) {
        this.assumedState = this.platform.Characteristic.CurrentDoorState.CLOSING;
        this.log.info('...old Value was opened or tilted (' + this.lastStateValue! + ') lets assume we are closing');
      } else {
        //this.assumedState = this.platform.Characteristic.CurrentDoorState.STOPPED;
        this.assumedState = this.platform.Characteristic.CurrentDoorState.OPEN;
        this.log.info('... dont know Unknown position assuming open');
      }
      this.stateTimeout = setTimeout(async () => {
        this.log.info('Timeout for State has been triggered. Trying http next');
        const newStateValue = await Tools.getFirstValueOfParameter(this.channelObject.parent, this.channelObject.identifier, this.stateParameter.id);
        this.newValue(newStateValue);
        }, 40000);
    }
    //this.log.info('Last State was ' + previousValue.value + ' new state is ' + this.lastStateValue!.value + ' therefore assumed state is ' + this.assumedState);
    this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assumedState);
  }

  newAssumedState(assumedState: number) {
    this.assumedState = assumedState;
    this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assumedState);


  }

  handleCurrentDoorStateGet() {
    this.log.debug('Triggered GET CurrentDoorState');
    return this.assumedState;
  }

  handleTargetDoorStateGet() {
    this.log.debug('Triggered GET TargetDoorState');
    return this.assumedTargetState;
  }

  handleTargetDoorStateSet(value: CharacteristicValue) {
    if (this.debounceTimeout) {
      this.log.info('Set State Debounce Timeout');
    } else {
      this.log.debug('Triggered SET TargetDoorState: ' + value);
      this.debounceTimeout = setTimeout(async () => {
        this.log.info('Debounce Timeout timed out');
      }, 1000);
      if (value === this.platform.Characteristic.TargetDoorState.CLOSED) {
        this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
        this.assumedState = this.platform.Characteristic.CurrentDoorState.CLOSING;

        Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 3);
        this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assumedState);
      } else if (value === this.platform.Characteristic.TargetDoorState.OPEN) {
        this.assumedTargetState = this.platform.Characteristic.TargetDoorState.OPEN;
        this.assumedState = this.platform.Characteristic.CurrentDoorState.OPENING;

        Api.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 1);
        this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assumedState);
      }
    }
  }

}