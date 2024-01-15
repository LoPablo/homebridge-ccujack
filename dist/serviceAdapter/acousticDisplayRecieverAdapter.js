"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../model/tools"));
const customServices_1 = require("./customServices");
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class AcousticDisplayRecieverAdapter extends serviceAdapter_1.default {
    constructor(ccuJackAccessory, channelObject, valueParameter, firstValue) {
        super();
        this.platform = ccuJackAccessory.platform;
        this.accessory = ccuJackAccessory.accessory;
        this.channelObject = channelObject;
        this.log = ccuJackAccessory.log;
        this.valueParameter = valueParameter;
        this.lastValue = firstValue;
        this.serviceLine1 = this.accessory.getService(customServices_1.TextService) || this.accessory.addService(customServices_1.TextService);
        //this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');
        //Api.getInstance().registerNewValueCallback(this.valueParameter!.mqttStatusTopic!, this.newValue.bind(this));
        this.serviceLine1.getCharacteristic(customServices_1.DisplayLine)
            .onGet(this.handleLineTextStateGet.bind(this))
            .onSet(this.handleLineTextStateSet.bind(this));
    }
    static async newInstance(ccuJackAccessory, channelObject) {
        let stateValueParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'COMBINED_PARAMETER') {
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
            new AcousticDisplayRecieverAdapter(ccuJackAccessory, channelObject, stateValueParameterSearch, firstValue);
        }
    }
    handleLineTextStateGet() {
        return 'Penis';
    }
    handleLineTextStateSet(value) {
        this.log.info(JSON.stringify(value));
    }
}
exports.default = AcousticDisplayRecieverAdapter;
//# sourceMappingURL=acousticDisplayRecieverAdapter.js.map