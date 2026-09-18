"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../model/tools"));
const api_1 = __importDefault(require("../api"));
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class OpticalSignalReceiverAdapter extends serviceAdapter_1.default {
    static async newInstance(ccuJackAccessory, channelObject) {
        let colorParameterSearch;
        let colorBehaviorParameterSearch;
        let levelParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'COLOR') {
                colorParameterSearch = parameter;
            }
            if (parameter.id === 'COLOR_BEHAVIOUR') {
                colorBehaviorParameterSearch = parameter;
            }
            if (parameter.id === 'LEVEL') {
                levelParameterSearch = parameter;
            }
        }
        if (colorParameterSearch === undefined && colorBehaviorParameterSearch === undefined && levelParameterSearch === undefined) {
            ccuJackAccessory.log.info(channelObject.address + ': COLOR, COLOR_BEHAVIOR or LEVEL Parameter is missing for switch light. Cannot continue');
        }
        else {
            ccuJackAccessory.log.info(channelObject.address + ': Getting first stateValue via http.');
            const firstValueColor = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, colorParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': COLOR firstValue ist: ' + JSON.stringify(firstValueColor));
            const firstValueColorBehavior = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, colorBehaviorParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': COLOR_BEHAVIOR firstValue ist: ' + JSON.stringify(firstValueColorBehavior));
            const firstValueLevel = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, levelParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': LEVEL firstValue ist: ' + JSON.stringify(firstValueLevel));
            new OpticalSignalReceiverAdapter(ccuJackAccessory, channelObject, colorParameterSearch, colorBehaviorParameterSearch, levelParameterSearch, firstValueColor, firstValueColorBehavior, firstValueLevel);
        }
    }
    constructor(ccuJackAccessory, channelObject, colorParameter, colorBehaviorParameter, levelParameter, firstColorValue, firstColorBehaviorValue, firstLevelValue) {
        super();
        this.platform = ccuJackAccessory.platform;
        this.accessory = ccuJackAccessory.accessory;
        this.channelObject = channelObject;
        this.log = ccuJackAccessory.log;
        this.colorParameter = colorParameter;
        this.colorBehaviorParameter = colorBehaviorParameter;
        this.levelParameter = levelParameter;
        this.colorValue = firstColorValue;
        this.colorBehaviorValue = firstColorBehaviorValue;
        this.levelValue = firstLevelValue;
        this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');
        if (this.colorValue.value === 0) {
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorParameter.id + '/~pv', 1);
        }
        if (this.levelValue.value === 0) {
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorParameter.id + '/~pv', 1);
        }
        api_1.default.getInstance().registerNewValueCallback(this.colorParameter.mqttStatusTopic, this.newColorValue.bind(this));
        api_1.default.getInstance().registerNewValueCallback(this.colorBehaviorParameter.mqttStatusTopic, this.newColorBehaviorValue.bind(this));
        api_1.default.getInstance().registerNewValueCallback(this.levelParameter.mqttStatusTopic, this.newLevelValue.bind(this));
        this.colorLightService = this.accessory.getServiceById(this.platform.Service.Lightbulb, this.channelObject.title) || this.accessory.addService(new this.platform.Service.Lightbulb(ccuJackAccessory.deviceObject.title + channelObject.title, this.channelObject.title));
        this.colorLightService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.handleOnGet.bind(this))
            .onSet(this.handleOnSet.bind(this));
        this.colorLightService.getCharacteristic(this.platform.Characteristic.Brightness)
            .onSet(this.handleBrightnessSet.bind(this))
            .onGet(this.handleBrightnessGet.bind(this));
        // this.service.getCharacteristic(this.platform.Characteristic.Hue)
        //   .onSet(this.handleHueSet.bind(this))
        //  .onGet(this.handleHueGet.bind(this));
        //this.service.getCharacteristic(this.platform.Characteristic.Saturation)
        // .onSet(this.handleSaturationSet.bind(this))
        // .onGet(this.handleSaturationGet.bind(this));
    }
    newColorValue(newColorValue) {
        this.colorValue = newColorValue;
        this.log.info('New Color Value: ' + JSON.stringify(newColorValue));
    }
    newColorBehaviorValue(newColorBehaviorValue) {
        this.colorBehaviorValue = newColorBehaviorValue;
        this.log.info('New ColorBehavior Value: ' + JSON.stringify(newColorBehaviorValue));
        if (this.colorBehaviorValue.value >= 1) {
            this.colorLightService.updateCharacteristic(this.platform.Characteristic.On, true);
        }
        else {
            this.colorLightService.updateCharacteristic(this.platform.Characteristic.On, false);
        }
    }
    newLevelValue(newLevelValue) {
        this.levelValue = newLevelValue;
        this.log.info('New Level Value: ' + JSON.stringify(newLevelValue));
        this.colorLightService.updateCharacteristic(this.platform.Characteristic.Brightness, Number(newLevelValue.value) * 100);
    }
    handleOnGet() {
        this.log.debug('Triggered GET On');
        return this.colorBehaviorValue.value >= 1 && this.levelValue.value > 0;
    }
    handleBrightnessGet() {
        this.log.debug('Triggered GET Brightness Number(this.levelValue!.value)*100;');
        return Number(this.levelValue.value) * 100;
    }
    handleBrightnessSet(value) {
        this.log.info('Triggered SET Brightness: ' + value);
        if (value > 0) {
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorBehaviorParameter.id + '/~pv', 11);
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.levelParameter.id + '/~pv', Number(value) / 100);
        }
        else {
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.levelParameter.id + '/~pv', 0);
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorBehaviorParameter.id + '/~pv', 0);
        }
    }
    handleOnSet(value) {
        this.log.info('Triggered SET On: ' + value);
        if (value === true) {
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorBehaviorParameter.id + '/~pv', 11);
        }
        else {
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.colorBehaviorParameter.id + '/~pv', 0);
        }
    }
}
exports.default = OpticalSignalReceiverAdapter;
//# sourceMappingURL=opticalSignalReceiverAdapter.js.map