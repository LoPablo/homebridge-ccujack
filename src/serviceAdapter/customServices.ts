import { Characteristic, Service, Perms, Formats, Units } from 'hap-nodejs';
export class DisplayLine extends Characteristic {
  static readonly UUID: string = '000000A4-0000-1000-8000-0026BB765298';

  constructor() {
    super('Display Line', DisplayLine.UUID,{
      format: Formats.STRING,
      unit: Units.SECONDS,
      perms: [Perms.PAIRED_READ, Perms.PAIRED_WRITE, Perms.NOTIFY],
    });
    this.value = this.getDefaultValue();
  }
}
export class TextService extends Service {
  static UUID = '00000085-0000-1000-8000-0026BB765215';

  constructor(displayName: string, subtype?: string) {
    super(displayName, TextService .UUID, subtype);

    this.addCharacteristic(DisplayLine);
    this.addOptionalCharacteristic(Characteristic.Name);
  }
}