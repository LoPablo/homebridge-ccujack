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

  constructor(description: string, identifier: string, serverDescription: string, serverName: string, serverVersion: string, title: string,
    veapVersion: string, vendorName: string, links: Link[]){
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
  static fromObject(object : any) : VendorInfo{
    const tempValues : Link[] = [];
    for (const linkEntry of object['~links']){
      const tmp = Link.fromObject(linkEntry);
      if(tmp.href !== '..' && tmp.href !== '$MASTER'){
        tempValues.push(Link.fromObject(linkEntry));
      }

    }
    return new VendorInfo(
      object.description,
      object.identifier,
      object.serverDescription,
      object.serverName,
      object.serverVersion,
      object.title,
      object.veapVersion,
      object.vendorName,
      tempValues,
    );
  }

}