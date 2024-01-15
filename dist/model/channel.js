"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("./tools"));
class Channel {
    constructor(title, identifier, address, parent, type, version, parameters) {
        this.title = title;
        this.identifier = identifier;
        this.address = address;
        this.parent = parent;
        this.type = type;
        this.version = version;
        this.parameters = parameters;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async fromObject(object) {
        return new Channel(object.title, object.identifier, object.address, object.parent, object.type, object.version, await tools_1.default.getParamters(object.parent, object.identifier, tools_1.default.getLinks(object, 'parameter')));
    }
}
exports.default = Channel;
//# sourceMappingURL=channel.js.map