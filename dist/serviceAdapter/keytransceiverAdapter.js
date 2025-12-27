"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../api"));
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class KeytransceiverAdapter extends serviceAdapter_1.default {
    static async newInstance(ccuJackAccessory, channelObject) {
        let stateSinglePress;
        let stateLongPress;
        let stateLongPressStart;
        let stateLongPressRelease;
        for (const parameter of channelObject.parameters) {
            switch (parameter.id) {
                case 'PRESS_SHORT': {
                    stateSinglePress = parameter;
                    break;
                }
                case 'PRESS_LONG': {
                    stateLongPress = parameter;
                    break;
                }
                case 'PRESS_LONG_START': {
                    stateLongPressStart = parameter;
                    break;
                }
                case 'PRESS_LONG_RELEASE': {
                    stateLongPressRelease = parameter;
                    break;
                }
            }
        }
        if (stateSinglePress && stateLongPress && stateLongPressStart && stateLongPressRelease) {
            ccuJackAccessory.log.info("{" + ccuJackAccessory.deviceObject.title + "," + channelObject.title + '}: Getting first mock value via http.');
            new KeytransceiverAdapter(ccuJackAccessory, channelObject, stateSinglePress, stateLongPress, stateLongPressStart, stateLongPressRelease);
        }
        else {
            ccuJackAccessory.log.info("{" + ccuJackAccessory.deviceObject.title + "," + channelObject.title + '}: One Button Parameter is missing for keytransceiver. Cannot continue');
        }
    }
    constructor(ccuJackAccessory, channelObject, stateSinglePress, stateLongPress, stateLongPressStart, stateLongPressRelease) {
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
        api_1.default.getInstance().registerNewValueCallback(this.stateSinglePress.mqttStatusTopic, this.newValueSinglePress.bind(this));
        api_1.default.getInstance().registerNewValueCallback(this.stateLongPress.mqttStatusTopic, this.newValueLongPress.bind(this));
        api_1.default.getInstance().registerNewValueCallback(this.stateLongPressStart.mqttStatusTopic, this.newValueLongPressStart.bind(this));
        this.serviceStatelessSwitch = this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, this.channelObject.title) || this.accessory.addService(new this.platform.Service.StatelessProgrammableSwitch(ccuJackAccessory.deviceObject.title + channelObject.title, this.channelObject.title));
        this.serviceStatelessSwitch.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
            .onGet(this.handleProgrammableSwitchEventGet.bind(this))
            .setProps({
            validValues: [0, 2],
        });
        this.serviceStatelessSwitch.getCharacteristic(this.platform.Characteristic.ServiceLabelIndex)
            .onGet(this.handleServiceLabelIndexGet.bind(this));
    }
    handleServiceLabelIndexGet() {
        return Number(this.channelObject.identifier);
    }
    handleProgrammableSwitchEventGet() {
        switch (this.lastValueOrigin) {
            case this.stateSinglePress: {
                return this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
            }
            case this.stateLongPress:
            case this.stateLongPressStart: {
                return this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
            }
            default: {
                return this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
            }
        }
    }
    newValueSinglePress(newValue) {
        this.lastValueOrigin = this.stateSinglePress;
        this.serviceStatelessSwitch.updateCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent, this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
    }
    newValueLongPress(newValue) {
        this.lastValueOrigin = this.stateLongPress;
        this.serviceStatelessSwitch.updateCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent, this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
    }
    newValueLongPressStart(newValue) {
        this.lastValueOrigin = this.stateLongPressStart;
        this.serviceStatelessSwitch.updateCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent, this.platform.Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
    }
}
exports.default = KeytransceiverAdapter;
//# sourceMappingURL=keytransceiverAdapter.js.map