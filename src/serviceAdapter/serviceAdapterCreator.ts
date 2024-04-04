// import { PlatformAccessory, PlatformConfig } from 'homebridge';
// import serviceAdapter from './serviceAdapter';
// import Device from '../model/device';
// import { fetch } from 'undici';
// import RotaryHandleTransceiverAdapter from './rotaryHandleTransceiverAdapter';
// import {CCUJackPlatformAccessory} from '../platformAccessory';
// import KeytransceiverAdapter from './keytransceiverAdapter';
// import AcousticDisplayRecieverAdapter from './acousticDisplayRecieverAdapter';
// import ShutterContactAdapter from './shutterContactAdapter';
// import Parameter from '../model/parameter';
// import {isNumberObject} from 'util/types';
//
//
// export default class serviceAdapterCreator {
//
//   static availableAdapters : serviceAdapter[] = [
//     RotaryHandleTransceiverAdapter,
//     KeytransceiverAdapter,
//     AcousticDisplayRecieverAdapter,
//     ShutterContactAdapter,
//   ]
//
//   static newInstance(platformAccessory: CCUJackPlatformAccessory) {
//     for (const adapter of this.availableAdapters) {
//       const neededNumberOfChannels = adapter.constructor.prototype.neededChannelAndParameter.length;
//       let foundNumberOfChannels = 0;
//       for (const channel of platformAccessory.deviceObject.channels) {
//
//       }
//
//       if (neededNumberOfChannels > foundNumberOfChannels) {
//         console.log("shit");
//       }
//
//     }
//
//
//
//
//       switch (channel.type) {
//         case 'MAINTENANCE': {
//           this.log.info('Found MAINTENANCE Channel');
//           break;
//         }
//
//         case 'KEY_TRANSCEIVER': {
//           this.log.info('Found KEY_TRANSCEIVER Channel');
//           KeytransceiverAdapter.newInstance(this, channel);
//           break;
//         }
//
//         case 'ACOUSTIC_DISPLAY_RECEIVER': {
//           this.log.info('Found ACOUSTIC_DISPLAY_RECEIVER Channel');
//           AcousticDisplayRecieverAdapter.newInstance(this, channel);
//           break;
//         }
//
//         case 'SHUTTER_CONTACT': {
//           this.log.info('Found SHUTTER_CONTACT Channel');
//           ShutterContactAdapter.newInstance(this, channel);
//           break;
//         }
//
//         case 'ROTARY_HANDLE_TRANSCEIVER': {
//           this.log.info('Found ROTARY_HANDLE_TRANSCEIVER Channel');
//           RotaryHandleTransceiverAdapter.newInstance(this, channel);
//           break;
//         }
//
//       }
//     }
//
//     let stateValueParameterSearch: Parameter;
//   }
//
//   public constructor() {
//
//     return
//   }
//
//
// }