

export default class Value{
  value : string | number | boolean;
  timestamp : Date;

  constructor(value : string | number | boolean, timestamp : Date) {
    this.value = value;
    this.timestamp = timestamp;
  }

  static fromObject(object : any) : Value{
    return new Value(
      object.v,
      new Date(object.ts)
    )
  }
}