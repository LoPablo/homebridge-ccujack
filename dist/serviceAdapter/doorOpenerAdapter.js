"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../model/tools"));
const api_1 = __importDefault(require("../api"));
const serviceAdapter_1 = __importDefault(require("./serviceAdapter"));
class DoorOpenerAdapter extends serviceAdapter_1.default {
    static async newInstance(ccuJackAccessory, channelObject) {
        let commandParameterSearch;
        let stateParameterSearch;
        let sectionParameterSearch;
        for (const parameter of channelObject.parameters) {
            if (parameter.id === 'DOOR_COMMAND') {
                commandParameterSearch = parameter;
            }
            if (parameter.id === 'DOOR_STATE') {
                stateParameterSearch = parameter;
            }
            if (parameter.id === 'SECTION') {
                sectionParameterSearch = parameter;
            }
        }
        if (stateParameterSearch === null && commandParameterSearch === null && sectionParameterSearch === null) {
            ccuJackAccessory.log.info(channelObject.address + ': STATE, COMMAND or SECTION Parameter is missing for garage door opener. Cannot continue');
        }
        else {
            ccuJackAccessory.log.info(channelObject.address + ': Getting first stateValue via http.');
            const firstValueState = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, stateParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValueState));
            const firstValueSection = await tools_1.default.getFirstValueOfParameter(channelObject.parent, channelObject.identifier, sectionParameterSearch.id);
            ccuJackAccessory.log.info(channelObject.address + ': STATE firstValue ist: ' + JSON.stringify(firstValueSection));
            new DoorOpenerAdapter(ccuJackAccessory, channelObject, stateParameterSearch, sectionParameterSearch, firstValueState, firstValueSection, commandParameterSearch);
        }
    }
    constructor(ccuJackAccessory, channelObject, stateParameter, sectionParameter, firstStateValue, firstSectionValue, commandParameter) {
        super();
        this.platform = ccuJackAccessory.platform;
        this.accessory = ccuJackAccessory.accessory;
        this.channelObject = channelObject;
        this.log = ccuJackAccessory.log;
        this.stateParameter = stateParameter;
        this.sectionParameter = sectionParameter;
        this.stateValue = firstStateValue;
        this.sectionValue = firstSectionValue;
        this.commandParameter = commandParameter;
        if (this.stateValue.value === 0) {
            this.assumedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
        }
        else {
            this.assumedState = this.platform.Characteristic.CurrentDoorState.OPEN;
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.OPEN;
        }
        this.log.info(channelObject.address + ': Registering Value Callback for Mqtt.');
        api_1.default.getInstance().registerNewValueCallback(this.stateParameter.mqttStatusTopic, this.newStateValue.bind(this));
        api_1.default.getInstance().registerNewValueCallback(this.sectionParameter.mqttStatusTopic, this.newSectionValue.bind(this));
        this.garageDoorService = this.accessory.getService(this.platform.Service.GarageDoorOpener) || this.accessory.addService(this.platform.Service.GarageDoorOpener);
        this.ventingSwitchService = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
        this.garageDoorService.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
            .onGet(this.handleCurrentDoorStateGet.bind(this));
        this.garageDoorService.getCharacteristic(this.platform.Characteristic.TargetDoorState)
            .onGet(this.handleTargetDoorStateGet.bind(this))
            .onSet(this.handleTargetDoorStateSet.bind(this));
        this.ventingSwitchService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.handleOnGet.bind(this))
            .onSet(this.handleOnSet.bind(this));
    }
    convertValuesToAssumedStates() {
        if (this.stateValue.value === 0) {
            this.assumedState = this.platform.Characteristic.CurrentDoorState.CLOSED;
            this.log.info('New Value is closed, therefore assumed state is closed.');
        }
        else if (this.stateValue.value === 1 || this.stateValue.value === 2) {
            this.assumedState = this.platform.Characteristic.CurrentDoorState.OPEN;
            this.log.info('New Value is open or venting (' + this.stateValue + ') , therefore assumed state is open.');
        }
        else if (this.stateValue.value === 3) {
            this.log.info('New Value is unknown position, see next message for more info...');
            if (this.sectionValue.value === 2) {
                this.log.info('... Section Value is 2, so assumed state is opening.');
                this.assumedState = this.platform.Characteristic.CurrentDoorState.OPENING;
            }
            else if (this.sectionValue.value === 5) {
                this.log.info('... Section Value is 4, so assumed state is closing.');
                this.assumedState = this.platform.Characteristic.CurrentDoorState.CLOSING;
            }
            else {
                this.assumedState = this.platform.Characteristic.CurrentDoorState.STOPPED;
            }
        }
        this.garageDoorService.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.assumedState);
    }
    newSectionValue(newSectionValue) {
        this.sectionValue = newSectionValue;
        this.log.info('New Section Value: ' + JSON.stringify(newSectionValue));
        this.convertValuesToAssumedStates();
    }
    newStateValue(newValue) {
        this.sectionValue = newValue;
        this.log.info('New State Value: ' + JSON.stringify(newValue));
        this.convertValuesToAssumedStates();
    }
    handleCurrentDoorStateGet() {
        this.log.debug('Triggered GET CurrentDoorState');
        return this.assumedState;
    }
    handleTargetDoorStateGet() {
        this.log.debug('Triggered GET TargetDoorState');
        return this.assumedTargetState;
    }
    handleOnGet() {
        this.log.debug('Triggered GET On Venting Switch');
        if (this.stateValue.value === 2) {
            return 1;
        }
        else {
            return 0;
        }
    }
    /**
     * Handle requests to set the "On" characteristic
     */
    handleOnSet(value) {
        this.log.info('Triggered SET On Venting Switch: ' + value);
        if (value === 1) {
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.OPEN;
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 4);
        }
        else {
            this.assumedTargetState = this.platform.Characteristic.TargetDoorState.CLOSED;
            api_1.default.getInstance().putCommandNumber('device/' + this.channelObject.parent + '/' + this.channelObject.identifier + '/' + this.commandParameter.id + '/~pv', 3);
        }
    }
    handleTargetDoorStateSet(value) {
        if (this.debounceTimeout) {
            this.log.info('Await State Debounce Timeout');
        }
        else {
            this.log.info('Triggered SET TargetDoorState: ' + value);
            this.debounceTimeout = setTimeout(async () => {
                this.log.info('Debounce Timeout timed out');
                clearTimeout(this.debounceTimeout);
                this.debounceTimeout = undefined;
            }, 1000);
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
}
exports.default = DoorOpenerAdapter;
//# sourceMappingURL=doorOpenerAdapter.js.map