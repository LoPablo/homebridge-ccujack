import {Service, PlatformAccessory, CharacteristicValue, Logger} from 'homebridge';

import {CCUJackPlatform} from './platform';
// import serviceAdapterCreator from './serviceAdapter/serviceAdapterCreator';
import Device from './model/device';
import {fetch} from 'undici';
import Channel from './model/channel';
import ShutterContactAdapter from './serviceAdapter/shutterContactAdapter';
import RotaryHandleTransceiverAdapter from './serviceAdapter/rotaryHandleTransceiverAdapter';
import AcousticDisplayRecieverAdapter from './serviceAdapter/acousticDisplayRecieverAdapter';
import KeytransceiverAdapter from './serviceAdapter/keytransceiverAdapter';
import DoorOpenerAdapter from './serviceAdapter/doorOpenerAdapter';
import SwitchReceiverAdapter from './serviceAdapter/switchReceiverAdapter';


export class CCUJackPlatformAccessory {
  //private service: Service;
  public readonly platform: CCUJackPlatform;
  public readonly accessory: PlatformAccessory;
  public readonly deviceObject: Device;
  public readonly log: Logger;

  constructor(platform: CCUJackPlatform, accessory: PlatformAccessory, deviceObject: Device) {
    this.platform = platform;
    this.accessory = accessory;
    this.deviceObject = deviceObject;
    this.log = this.platform.log;

        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
          .setCharacteristic(this.platform.Characteristic.Manufacturer, this.deviceObject.interfaceType || 'unknown')
          .setCharacteristic(this.platform.Characteristic.Model, this.deviceObject.type)
          .setCharacteristic(this.platform.Characteristic.SerialNumber, this.deviceObject.address)
          .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.deviceObject.firmware);
        this.addServiceAdapters();
  }


  //  private adapterCreation() {
  //
  //  }

  private addServiceAdapters() {
    for (const channel of this.deviceObject.channels) {
      switch (channel.type) {
        case 'MAINTENANCE': {
          this.log.info('Found MAINTENANCE Channel');
          break;
        }

        case 'SIMPLE_SWITCH_RECEIVER': {
          this.log.info('Found SIMPLE_SWITCH_RECEIVER Channel');
          SwitchReceiverAdapter.newInstance(this, channel);
          break;
        }

        case 'KEY_TRANSCEIVER': {
          this.log.info('Found KEY_TRANSCEIVER Channel');
          KeytransceiverAdapter.newInstance(this, channel);
          break;
        }

        case 'ACOUSTIC_DISPLAY_RECEIVER': {
          this.log.info('Found ACOUSTIC_DISPLAY_RECEIVER Channel');
          AcousticDisplayRecieverAdapter.newInstance(this, channel);
          break;
        }

        case 'DOOR_RECEIVER' : {
          this.log.info('Found DOOR_RECEIVER Channel');
          DoorOpenerAdapter.newInstance(this, channel);
          break;
        }

        case 'SHUTTER_CONTACT': {
          this.log.info('Found SHUTTER_CONTACT Channel');
          ShutterContactAdapter.newInstance(this, channel);
          break;
        }

        case 'ROTARY_HANDLE_TRANSCEIVER': {
          this.log.info('Found ROTARY_HANDLE_TRANSCEIVER Channel');
          RotaryHandleTransceiverAdapter.newInstance(this, channel);
          break;
        }

      }
    }

  }

}
