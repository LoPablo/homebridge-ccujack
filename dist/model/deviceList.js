"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("./tools"));
class DeviceList {
    constructor(devices) {
        this.devices = devices;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async fromObject(object) {
        return new DeviceList(await tools_1.default.getDevices(tools_1.default.getLinks(object, 'device')));
    }
}
exports.default = DeviceList;
//# sourceMappingURL=deviceList.js.map