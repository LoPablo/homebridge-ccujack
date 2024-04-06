"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../model/tools"));
const api_1 = __importDefault(require("../api"));
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class DoorOpenerAdapter extends serviceAdapter_1.default {
    constructor(ccuJackAccessory, channelObject, stateParameter, firstStateValue, commandParameter) {
        super();
        this.platform = ccuJackAccessory.platform;
        this.accessory = ccuJackAccessory.accessory;
        this.channelObject = channelObject;
        this.log = ccuJackAccessory.log;
        this.stateParameter = stateParameter;
        this.lastStateValue = firstStateValue;
        this.commandParameter = commandParameter;
        if (this.lastStateValue.value === 0) {
            this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
        }
        else {
            this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPEN;
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.OPEN;
        }
        this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');
        api_1.default.getInstance().registerNewValueCallback(this.stateParameter.mqttStatusTopic, this.newValue.bind(this));
        this.garageDoorService = this.accessory.getService(this.platform.Service.GarageDoorOpener) || this.accessory.addService(this.platform.Service.GarageDoorOpener);
        this.garageDoorService.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
            .onGet(this.handleCurrentDoorStateGet.bind(this));
        this.garageDoorService.getCharacteristic(this.platform.Characteristic.TargetDoorState)
            .onGet(this.handleTargetDoorStateGet.bind(this))
            .onSet(this.handleTargetDoorStateSet.bind(this));
    }
    static async newInstance(ccuJackAccessory, channelObject) {
        let commandParameterSearch;
        let stateParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'DOOR_COMMAND') {
                commandParameterSearch = parameter;
            }
            if (parameter.id === 'DOOR_STATE') {
                stateParameterSearch = parameter;
            }
        }
        if (stateParameterSearch === null && commandParameterSearch === null) {
            ccuJackAccessory.log.info(channelObject.address + ': STATE Parameter or COMMAND Parameter is missing for hörmann garage door opener. Cannot continue');
        }
        else {
            ccuJackAccessory.log.info(channelObject.address + ': Getting first stateValue via http.');
            const firstValue = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValue));
            new DoorOpenerAdapter(ccuJackAccessory, channelObject, stateParameterSearch, firstValue, commandParameterSearch);
        }
    }
    newValue(newValue) {
        this.log.info(this.channelObject.address + ': New Value: ' + JSON.stringify(newValue));
        const previousValue = this.lastStateValue;
        this.lastStateValue = newValue;
        if (this.stateTimeout) {
            clearTimeout(this.stateTimeout);
        }
        if (this.lastStateValue.value === 0) {
            this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
        }
        else if (this.lastStateValue.value === 1 || this.lastStateValue.value === 2) {
            this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPEN;
            if (this.stateTimeout) {
                clearTimeout(this.stateTimeout);
            }
        }
        else {
            if (previousValue.value === 0) {
                this.assuemedState = this.platform.Characteristic.CurrentDoorState.OPENING;
            }
            else if (previousValue.value === 1) {
                this.assuemedState = this.platform.Characteristic.CurrentDoorState.CLOSING;
            }
            else {
                this.assuemedState = this.platform.Characteristic.CurrentDoorState.STOPPED;
            }
            this.stateTimeout = setTimeout(() => {
                this.assuemedState = this.platform.Characteristic.CurrentDoorState.STOPPED;
                this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assuemedState);
            }, 10000);
        }
        this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assuemedState);
    }
    newAssumedState(assumedState) {
        this.assuemedState = assumedState;
        this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assuemedState);
    }
    handleCurrentDoorStateGet() {
        this.log.debug('Triggered GET CurrentDoorState');
        return this.assuemedState;
    }
    handleTargetDoorStateGet() {
        this.log.debug('Triggered GET TargetDoorState');
        return this.assumedTargetState;
    }
    handleTargetDoorStateSet(value) {
        this.log.debug('Triggered SET TargetDoorState: ' + value);
        if (value === this.platform.Characteristic.TargetDoorState.CLOSED) {
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 3);
        }
        else if (value === this.platform.Characteristic.TargetDoorState.OPEN) {
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.OPEN;
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 1);
        }
    }
}
exports.default = DoorOpenerAdapter;
//# sourceMappingURL=doorOpenerAdapter.js.map