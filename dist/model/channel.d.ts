import Parameter from './parameter';
export default class Channel {
    title: string;
    identifier: string;
    address: string;
    parent: string;
    type: string;
    version: number;
    parameters: Parameter[];
    constructor(title: string, identifier: string, address: string, parent: string, type: string, version: number, parameters: Parameter[]);
    static fromObject(object: any): Promise<Channel>;
}
//# sourceMappingURL=channel.d.ts.map