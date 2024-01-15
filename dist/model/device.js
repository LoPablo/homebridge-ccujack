"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("./tools"));
class Device {
    constructor(title, address, availableFirmware, firmware, interfaceType, rxMode, type, version, channels) {
        this.title = title;
        this.address = address;
        this.availableFirmware = availableFirmware;
        this.firmware = firmware;
        this.interfaceType = interfaceType;
        this.rxMode = rxMode;
        this.type = type;
        this.version = version;
        this.channels = channels;
    }
    static async fromObject(object) {
        return new Device(object.title, object.address, object.availableFirmware, object.firmware, object.interfaceType, object.rxMode, object.type, object.version, await tools_1.default.getChannels(object.address, tools_1.default.getLinks(object, 'channel')));
    }
}
exports.default = Device;
//# sourceMappingURL=device.js.map