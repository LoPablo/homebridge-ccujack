export default class Value {
    value: string | number | boolean;
    timestamp: Date;
    constructor(value: string | number | boolean, timestamp: Date);
    static fromObject(object: any): Value;
}
//# sourceMappingURL=value.d.ts.map