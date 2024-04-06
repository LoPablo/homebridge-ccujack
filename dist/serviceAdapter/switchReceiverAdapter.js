"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../model/tools"));
const api_1 = __importDefault(require("../api"));
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class SwitchReceiverAdapter extends serviceAdapter_1.default {
    constructor(ccuJackAccessory, channelObject, stateParameter, firstStateValue) {
        super();
        this.platform = ccuJackAccessory.platform;
        this.accessory = ccuJackAccessory.accessory;
        this.channelObject = channelObject;
        this.log = ccuJackAccessory.log;
        this.stateParameter = stateParameter;
        this.lastStateValue = firstStateValue;
        this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');
        //Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));
        api_1.default.getInstance().registerNewValueCallback(this.stateParameter.mqttStatusTopic, this.newValue.bind(this));
        this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.handleOnGet.bind(this))
            .onSet(this.handleOnSet.bind(this));
    }
    static async newInstance(ccuJackAccessory, channelObject) {
        let stateParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'STATE') {
                stateParameterSearch = parameter;
            }
        }
        if (stateParameterSearch === null) {
            ccuJackAccessory.log.info(channelObject.address + ': STATE Parameter is missing for hörmann garage door opener. Cannot continue');
        }
        else {
            ccuJackAccessory.log.info(channelObject.address + ': Getting first stateValue via http.');
            const firstValue = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValue));
            new SwitchReceiverAdapter(ccuJackAccessory, channelObject, stateParameterSearch, firstValue);
        }
    }
    newValue(newValue) {
        this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
        this.lastStateValue = newValue;
        this.service.updateCharacteristic(this.platform.Characteristic.On, newValue.value);
    }
    async handleOnGet() {
        this.log.debug('Triggered GET On');
        if (this.debounceJustSet) {
            await this.debounceJustSet;
        }
        return this.lastStateValue.value;
    }
    /**
       * Handle requests to set the "On" characteristic
       */
    handleOnSet(value) {
        this.log.debug('Triggered SET On:' + value);
        this.debounceJustSet = new Promise(resolve => setTimeout(resolve, 3000));
        if (value) {
            api_1.default.getInstance().putCommandBoolean('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.stateParameter.id + '/~pv', true);
        }
        else {
            api_1.default.getInstance().putCommandBoolean('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.stateParameter.id + '/~pv', false);
        }
    }
}
exports.default = SwitchReceiverAdapter;
//# sourceMappingURL=switchReceiverAdapter.js.map