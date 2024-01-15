import { Characteristic, Service } from 'hap-nodejs';
export declare class DisplayLine extends Characteristic {
    static readonly UUID: string;
    constructor();
}
export declare class TextService extends Service {
    static UUID: string;
    constructor(displayName: string, subtype?: string);
}
//# sourceMappingURL=customServices.d.ts.map