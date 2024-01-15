"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const link_1 = __importDefault(require("./link"));
class VendorInfo {
    constructor(description, identifier, serverDescription, serverName, serverVersion, title, veapVersion, vendorName, links) {
        this.description = description;
        this.identifier = identifier;
        this.serverDescription = serverDescription;
        this.serverName = serverName;
        this.serverVersion = serverVersion;
        this.title = title;
        this.veapVersion = veapVersion;
        this.vendorName = vendorName;
        this.links = links;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromObject(object) {
        const tempValues = [];
        for (const linkEntry of object['~links']) {
            const tmp = link_1.default.fromObject(linkEntry);
            if (tmp.href !== '..' && tmp.href !== '$MASTER') {
                tempValues.push(link_1.default.fromObject(linkEntry));
            }
        }
        return new VendorInfo(object.description, object.identifier, object.serverDescription, object.serverName, object.serverVersion, object.title, object.veapVersion, object.vendorName, tempValues);
    }
}
exports.default = VendorInfo;
//# sourceMappingURL=vendorInfo.js.map