"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Value {
    constructor(value, timestamp) {
        this.value = value;
        this.timestamp = timestamp;
    }
    static fromObject(object) {
        return new Value(object.v, new Date(object.ts));
    }
}
exports.default = Value;
//# sourceMappingURL=value.js.map