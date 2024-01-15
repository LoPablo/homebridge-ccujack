import Link from './link';
export default class VendorInfo {
    description: string;
    identifier: string;
    serverDescription: string;
    serverName: string;
    serverVersion: string;
    title: string;
    veapVersion: string;
    vendorName: string;
    links: Link[];
    constructor(description: string, identifier: string, serverDescription: string, serverName: string, serverVersion: string, title: string, veapVersion: string, vendorName: string, links: Link[]);
    static fromObject(object: any): VendorInfo;
}
//# sourceMappingURL=vendorInfo.d.ts.map