"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const channel_1 = __importDefault(require("./channel"));
const link_1 = __importDefault(require("./link"));
const api_1 = __importDefault(require("../api"));
const device_1 = __importDefault(require("./device"));
const parameter_1 = __importDefault(require("./parameter"));
const value_1 = __importDefault(require("./value"));
class Tools {
    static getLinks(object, withType) {
        const links = [];
        for (const linkEntry of object['~links']) {
            const tmp = link_1.default.fromObject(linkEntry);
            if (tmp.rel === withType) {
                links.push(link_1.default.fromObject(linkEntry));
            }
        }
        return links;
    }
    static async getFirstValueOfParameter(parentDeviceAdress, parentChannelNumber, parameterId) {
        const responseForValue = await api_1.default.getInstance().makeRequest('device/' + parentDeviceAdress + '/' + parentChannelNumber + '/' + parameterId + '/~pv');
        return value_1.default.fromObject(responseForValue);
    }
    static async getParamters(parentDeviceAdress, parentChannelNumber, links) {
        const parameters = [];
        for (const parameter of links) {
            const responseForParameter = await api_1.default.getInstance().makeRequest('device/' + parentDeviceAdress + '/' + parentChannelNumber + '/' + parameter.href);
            const parameterObject = await parameter_1.default.fromObject(responseForParameter);
            parameters.push(parameterObject);
        }
        return parameters;
    }
    static async getChannels(parentDeviceAddress, links) {
        const channels = [];
        for (const channel of links) {
            const responseForChannel = await api_1.default.getInstance().makeRequest('device/' + parentDeviceAddress + '/' + channel.href);
            const channelObject = await channel_1.default.fromObject(responseForChannel);
            channels.push(channelObject);
        }
        return channels;
    }
    static async getDevices(links) {
        const devices = [];
        for (const device of links) {
            const responseForDevice = await api_1.default.getInstance().makeRequest('device/' + device.href);
            const deviceObject = await device_1.default.fromObject(responseForDevice);
            devices.push(deviceObject);
        }
        return devices;
    }
}
exports.default = Tools;
//# sourceMappingURL=tools.js.map