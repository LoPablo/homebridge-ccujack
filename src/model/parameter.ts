import Link from './link';

export default class Parameter {
  title: string;
  id: string;
  maximum: boolean;
  minimum: boolean;
  mqttStatusTopic: string;
  type: string;
  unit: string;

  constructor(
    title: string,
    id: string,
    maximum: boolean,
    minimum: boolean,
    mqttStatusTopic: string,
    type: string,
    unit: string,
  ){
    this.title = title;
    this.id = id;
    this.maximum = maximum;
    this.minimum = minimum;
    this.mqttStatusTopic = mqttStatusTopic;
    this.type = type;
    this.unit = unit;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async fromObject(object : any) : Promise<Parameter>{
    return new Parameter(
      object.title,
      object.id,
      object.maximum,
      object.minimum,
      object.mqttStatusTopic,
      object.type,
      object.untit,
    );
  }
}