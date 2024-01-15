"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextService = exports.DisplayLine = void 0;
const hap_nodejs_1 = require("hap-nodejs");
class DisplayLine extends hap_nodejs_1.Characteristic {
    constructor() {
        super('Display Line', DisplayLine.UUID, {
            format: "string" /* STRING */,
            unit: "seconds" /* SECONDS */,
            perms: ["pr" /* PAIRED_READ */, "pw" /* PAIRED_WRITE */, "ev" /* NOTIFY */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.DisplayLine = DisplayLine;
DisplayLine.UUID = '000000A4-0000-1000-8000-0026BB765298';
class TextService extends hap_nodejs_1.Service {
    constructor(displayName, subtype) {
        super(displayName, TextService.UUID, subtype);
        this.addCharacteristic(DisplayLine);
        this.addOptionalCharacteristic(hap_nodejs_1.Characteristic.Name);
    }
}
exports.TextService = TextService;
TextService.UUID = '00000085-0000-1000-8000-0026BB765215';
//# sourceMappingURL=customServices.js.map