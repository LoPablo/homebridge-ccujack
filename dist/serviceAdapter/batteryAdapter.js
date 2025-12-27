"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
const api_1 = __importDefault(require("../api"));
const tools_1 = __importDefault(require("../model/tools"));
class BatteryAdapter extends serviceAdapter_1.default {
    static async newInstance(ccuJackAccessory, channelObject) {
        let stateValueParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'LOW_BAT') {
                stateValueParameterSearch = parameter;
            }
        }
        if (stateValueParameterSearch === null || stateValueParameterSearch === undefined) {
            ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: LOW_BAT Parameter is missing for Battery Service. Cannot continue');
        }
        else {
            ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: Getting first Value via http.');
            const firstValue = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateValueParameterSearch.id);
            ccuJackAccessory.log.info('{' + ccuJackAccessory.deviceObject.title + ',' + channelObject.title + '}: STATE firstValue is: ' + JSON.stringify(firstValue));
            new BatteryAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch, firstValue);
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
        this.service = this.accessory.getService(this.platform.Service.Battery) || this.accessory.addService(this.platform.Service.Battery);
        api_1.default.getInstance().registerNewValueCallback(this.valueParameter.mqttStatusTopic, this.newValue.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
            .onGet(this.handleStatusLowBatteryGet.bind(this));
        this.log.info("BATTERY IS: ", this.lastValue.value);
    }
    newValue(newValue) {
        this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
        this.lastValue = newValue;
        if (this.lastValue.value === false) {
            this.service.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }
        else {
            this.service.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
        }
    }
    handleStatusLowBatteryGet() {
        this.log.debug('Triggered GET StatusLowBattery Get');
        if (this.lastValue.value === false) {
            return this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        }
        else {
            return this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
        }
    }
}
exports.default = BatteryAdapter;
//# sourceMappingURL=batteryAdapter.js.map