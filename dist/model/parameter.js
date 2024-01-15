"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parameter {
    constructor(title, id, maximum, minimum, mqttStatusTopic, type, unit) {
        this.title = title;
        this.id = id;
        this.maximum = maximum;
        this.minimum = minimum;
        this.mqttStatusTopic = mqttStatusTopic;
        this.type = type;
        this.unit = unit;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async fromObject(object) {
        return new Parameter(object.title, object.id, object.maximum, object.minimum, object.mqttStatusTopic, object.type, object.untit);
    }
}
exports.default = Parameter;
//# sourceMappingURL=parameter.js.map