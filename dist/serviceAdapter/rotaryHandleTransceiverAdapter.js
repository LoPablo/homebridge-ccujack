"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../model/tools"));
const api_1 = __importDefault(require("../api"));
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class RotaryHandleTransceiverAdapter extends serviceAdapter_1.default {
    static async newInstance(ccuJackAccessory, channelObject) {
        let stateValueParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'STATE') {
                stateValueParameterSearch = parameter;
            }
        }
        if (stateValueParameterSearch === null) {
            ccuJackAccessory.log.info(channelObject.address + ': STATE Parameter is missing for shutterContact. Cannot continue');
        }
        else {
            ccuJackAccessory.log.info(channelObject.address + ': Getting first value via http.');
            const firstValue = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateValueParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValue));
            new RotaryHandleTransceiverAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch, firstValue);
        }
    }
    constructor(ccuJackAccessory, channelObject, valueParameter, firstValue) {
        super();
        this.platform = ccuJackAccessory.platform;
        this.accessory = ccuJackAccessory.accessory;
        this.channelObject = channelObject;
        this.log = ccuJackAccessory.log;
        this.valueParameter = valueParameter;
        this.lastValue = firstValue;
        this.serviceTitled = this.accessory.getServiceById(this.platform.Service.ContactSensor, 'Kipp') || this.accessory.addService(new this.platform.Service.ContactSensor(ccuJackAccessory.deviceObject.title + ' Kipp Status', 'Kipp'));
        this.serviceOpened = this.accessory.getServiceById(this.platform.Service.ContactSensor, 'Offen') || this.accessory.addService(new this.platform.Service.ContactSensor(ccuJackAccessory.deviceObject.title + ' Offen Status', 'Offen'));
        this.serviceTitled.setCharacteristic(this.platform.Characteristic.Name, ccuJackAccessory.deviceObject.title + ' Kipp Status');
        this.serviceOpened.setCharacteristic(this.platform.Characteristic.Name, ccuJackAccessory.deviceObject.title + ' Offen Status');
        this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');
        api_1.default.getInstance().registerNewValueCallback(this.valueParameter.mqttStatusTopic, this.newValue.bind(this));
        this.serviceTitled.getCharacteristic(this.platform.Characteristic.ContactSensorState)
            .onGet(this.handleContactSensorTiltedStateGet.bind(this));
        this.serviceOpened.getCharacteristic(this.platform.Characteristic.ContactSensorState)
            .onGet(this.handleContactSensorOpenedStateGet.bind(this));
    }
    newValue(newValue) {
        this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
        this.lastValue = newValue;
        if (this.lastValue.value === 0) {
            this.serviceOpened.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
            this.serviceTitled.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
        }
        else if (this.lastValue.value === 1) {
            this.serviceOpened.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
            this.serviceTitled.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
        }
        else {
            this.serviceOpened.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
            this.serviceTitled.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED);
        }
    }
    handleContactSensorTiltedStateGet() {
        this.log.debug('Triggered GET ContactSensorState');
        if (this.lastValue.value === 1) {
            return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
        }
        else {
            return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
        }
    }
    handleContactSensorOpenedStateGet() {
        this.log.debug('Triggered GET ContactSensorState');
        if (this.lastValue.value === 2) {
            return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
        }
        else {
            return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
        }
    }
}
exports.default = RotaryHandleTransceiverAdapter;
//# sourceMappingURL=rotaryHandleTransceiverAdapter.js.map