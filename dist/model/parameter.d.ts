export default class Parameter {
    title: string;
    id: string;
    maximum: boolean;
    minimum: boolean;
    mqttStatusTopic: string;
    type: string;
    unit: string;
    constructor(title: string, id: string, maximum: boolean, minimum: boolean, mqttStatusTopic: string, type: string, unit: string);
    static fromObject(object: any): Promise<Parameter>;
}
//# sourceMappingURL=parameter.d.ts.map