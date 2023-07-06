import Link from './link';
import Parameter from './parameter';
import Tools from './tools';

export default class Channel {
  title: string;
  identifier:string;
  address: string;
  parent : string;
  type: string;
  version: number;
  parameters: Parameter[];

  constructor(
    title: string,
    identifier :string,
    address: string,
    parent : string,
    type: string,
    version: number,
    parameters: Parameter[]
  ) {
    this.title = title;
    this.identifier = identifier;
    this.address = address;
    this.parent = parent;
    this.type = type;
    this.version = version;
    this.parameters = parameters;
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async fromObject(object:any){
    return new Channel(
      object.title,
      object.identifier,
      object.address,
      object.parent,
      object.type,
      object.version,
      await Tools.getParamters(object.parent, object.identifier, Tools.getLinks(object, 'parameter')),
    );
  }
}