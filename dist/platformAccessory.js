"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCUJackPlatformAccessory = void 0;
const shutterContactAdapter_1 = __importDefault(require("./serviceAdapter/shutterContactAdapter"));
const rotaryHandleTransceiverAdapter_1 = __importDefault(require("./serviceAdapter/rotaryHandleTransceiverAdapter"));
//import AcousticDisplayRecieverAdapter from './serviceAdapter/acousticDisplayRecieverAdapter';
const keytransceiverAdapter_1 = __importDefault(require("./serviceAdapter/keytransceiverAdapter"));
const doorOpenerAdapter_1 = __importDefault(require("./serviceAdapter/doorOpenerAdapter"));
const switchReceiverAdapter_1 = __importDefault(require("./serviceAdapter/switchReceiverAdapter"));
const batteryAdapter_1 = __importDefault(require("./serviceAdapter/batteryAdapter"));
class CCUJackPlatformAccessory {
    constructor(platform, accessory, deviceObject) {
        this.platform = platform;
        this.accessory = accessory;
        this.deviceObject = deviceObject;
        this.log = this.platform.log;
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, this.deviceObject.interfaceType || 'unknown')
            .setCharacteristic(this.platform.Characteristic.Model, this.deviceObject.type)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.deviceObject.address)
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.deviceObject.firmware);
        this.addServiceAdapters();
    }
    //  private adapterCreation() {
    //
    //  }
    addServiceAdapters() {
        for (const channel of this.deviceObject.channels) {
            switch (channel.type) {
                case 'MAINTENANCE': {
                    this.log.info('Found MAINTENANCE Channel');
                    batteryAdapter_1.default.newInstance(this, channel);
                    break;
                }
                case 'SIMPLE_SWITCH_RECEIVER': {
                    this.log.info('Found SIMPLE_SWITCH_RECEIVER Channel');
                    switchReceiverAdapter_1.default.newInstance(this, channel);
                    break;
                }
                case 'KEY_TRANSCEIVER': {
                    this.log.info('Found KEY_TRANSCEIVER Channel');
                    keytransceiverAdapter_1.default.newInstance(this, channel);
                    break;
                }
                //case 'ACOUSTIC_DISPLAY_RECEIVER': {
                //  this.log.info('Found ACOUSTIC_DISPLAY_RECEIVER Channel');
                //  AcousticDisplayRecieverAdapter.newInstance(this, channel);
                //  break;
                //}
                case 'DOOR_RECEIVER': {
                    this.log.info('Found DOOR_RECEIVER Channel');
                    doorOpenerAdapter_1.default.newInstance(this, channel);
                    break;
                }
                case 'SHUTTER_CONTACT': {
                    this.log.info('Found SHUTTER_CONTACT Channel');
                    shutterContactAdapter_1.default.newInstance(this, channel);
                    break;
                }
                case 'ROTARY_HANDLE_TRANSCEIVER': {
                    this.log.info('Found ROTARY_HANDLE_TRANSCEIVER Channel');
                    rotaryHandleTransceiverAdapter_1.default.newInstance(this, channel);
                    break;
                }
            }
        }
    }
}
exports.CCUJackPlatformAccessory = CCUJackPlatformAccessory;
//# sourceMappingURL=platformAccessory.js.map