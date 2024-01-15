"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../model/tools"));
const api_1 = __importDefault(require("../api"));
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class ShutterContactAdapter extends serviceAdapter_1.default {
    constructor(ccuJackAccessory, channelObject, valueParameter, firstValue) {
        super();
        this.platform = ccuJackAccessory.platform;
        this.accessory = ccuJackAccessory.accessory;
        this.channelObject = channelObject;
        this.log = ccuJackAccessory.log;
        this.valueParameter = valueParameter;
        this.lastValue = firstValue;
        this.service = this.accessory.getService(this.platform.Service.ContactSensor) || this.accessory.addService(this.platform.Service.ContactSensor);
        this.service.setCharacteristic(this.platform.Characteristic.Name, channelObject.title);
        this.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: Registering Value Callback for Mqtt.');
        api_1.default.getInstance().registerNewValueCallback(this.valueParameter.mqttStatusTopic, this.newValue.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.ContactSensorState)
            .onGet(this.handleContactSensorStateGet.bind(this));
    }
    static async newInstance(ccuJackAccessory, channelObject) {
        let stateValueParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'STATE') {
                stateValueParameterSearch = parameter;
            }
        }
        if (stateValueParameterSearch === null) {
            ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: STATE Parameter is missing for shutterContact. Cannot continue');
        }
        else {
            ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: Getting first Value via http.');
            const firstValue = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateValueParameterSearch.id);
            ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: STATE firstValue is: ' + JSON.stringify(firstValue));
            new ShutterContactAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch, firstValue);
        }
    }
    newValue(newValue) {
        this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
        this.lastValue = newValue;
        if (this.lastValue.value === 0) {
            this.service.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
        }
        else {
            this.service.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
        }
    }
    handleContactSensorStateGet() {
        this.log.debug('Triggered GET ContactSensorState');
        if (this.lastValue.value === 0) {
            return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
        }
        else {
            return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
        }
    }
}
exports.default = ShutterContactAdapter;
//# sourceMappingURL=shutterContactAdapter.js.map