import {API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic} from 'homebridge';

import {PLATFORM_NAME, PLUGIN_NAME} from './settings';
import {CCUJackPlatformAccessory} from './platformAccessory';


//import * as mqtt from 'mqtt';
import {fetch} from 'undici';

import DeviceList from './model/deviceList';
import VendorInfo from './model/vendorInfo';
// import serviceAdapterCreator from './serviceAdapter/serviceAdapterCreator';
import Device from './model/device';
import Api from './api';
import Tools from './model/tools';


export class CCUJackPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  public readonly log: Logger;
  public readonly config: PlatformConfig;
  public readonly api: API;
  //
  public readonly accessories: PlatformAccessory[] = [];


  constructor(log: Logger,config: PlatformConfig,  api: API) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;
    this.log.info('CCUJack (' + this.config.name + ') is initilizing and waiting for homebridge');
    this.log.info('Checking config');
    if (this.checkConfigOK()) {
      this.log.info('Config valid');
      this.api.on('didFinishLaunching', async () => {
        log.info('Hombridge signaled didFinishLaunching callback');
        if (await this.firstContact()) {


          //serviceAdapterCreator.createInstance(config);
          await this.discoverDevices();
        } else {
          this.log.error('There was an error making first contact. See error above. Cannot continue.');
        }
      });
    } else {
      this.log.error('Config not valid. Cannot continue.');
    }


  }

  checkConfigOK() {
    let isOK = true;
    isOK = isOK && this.config.hostname !== undefined;
    if (this.config.port === undefined) {
      this.config.port = 2121;
    }
    return isOK;
  }


  async firstContact(): Promise<boolean> {
    this.log.info('Trying to contact CCU');
    Api.createInstance(this.log, this.config);
    let wasSuccessful = false;
    try {
      const response = await Api.getInstance().makeRequest('~vendor');
      this.log.info('CCU answered');
      const data: VendorInfo = VendorInfo.fromObject(response);
      if (data.serverName === 'CCU-Jack' && data.serverVersion !== undefined) {
        this.log.info('yay! CCU communication was with CCU Jack Version: ' + data.serverVersion);
        wasSuccessful = true;
      }
    } catch (error) {
      this.log.error(error);
      this.log.error('CCU was not contacted successfully.');
    }
    return wasSuccessful;
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  async discoverDevices() {
    this.log.info('Requesting devices from CCU');
    try {
      const data: DeviceList = await DeviceList.fromObject(await Api.getInstance().makeRequest('device'));
      if (data.devices.length > 0) {
        this.log.info('Discovered ' + data.devices.length + ' devices from CCU');

        for (const device of data.devices) {
          const uuid = this.api.hap.uuid.generate(device.address);
          const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

          if (existingAccessory) {
            this.log.info('Found CCU device as existing accessory. Restoring from cache:', existingAccessory.displayName);
            new CCUJackPlatformAccessory(this, existingAccessory, device);
          } else {
            this.log.info('Adding new accessory:', device.title);
            const accessory = new this.api.platformAccessory(device.title, uuid);


            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          }

        }

      } else {
        this.log.info('No devices available');
      }
    } catch (error) {
      this.log.error(error);
    }


    // // EXAMPLE ONLY
    // // A real plugin you would discover accessories from the local network, cloud services
    // // or a user-defined array in the platform config.
    // const exampleDevices = [
    //   {
    //     exampleUniqueId: 'ABCD',
    //     exampleDisplayName: 'Bedroom',
    //   },
    //   {
    //     exampleUniqueId: 'EFGH',
    //     exampleDisplayName: 'Kitchen',
    //   },
    // ];

    // // loop over the discovered devices and register each one if it has not already been registered
    // for (const device of exampleDevices) {

    //   // generate a unique id for the accessory this should be generated from
    //   // something globally unique, but constant, for example, the device serial
    //   // number or MAC address
    //   const uuid = this.api.hap.uuid.generate(device.exampleUniqueId);

    //   // see if an accessory with the same uuid has already been registered and restored from
    //   // the cached devices we stored in the `configureAccessory` method above
    //   const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    //   if (existingAccessory) {
    //     // the accessory already exists
    //     this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

    //     // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
    //     // existingAccessory.context.device = device;
    //     // this.api.updatePlatformAccessories([existingAccessory]);

    //     // create the accessory handler for the restored accessory
    //     // this is imported from `platformAccessory.ts`
    //     new ExamplePlatformAccessory(this, existingAccessory);

    //     // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
    //     // remove platform accessories when no longer present
    //     // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
    //     // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
    //   } else {
    //     // the accessory does not yet exist, so we need to create it
    //     this.log.info('Adding new accessory:', device.exampleDisplayName);

    //     // create a new accessory
    //     const accessory = new this.api.platformAccessory(device.exampleDisplayName, uuid);

    //     // store a copy of the device object in the `accessory.context`
    //     // the `context` property can be used to store any data about the accessory you may need
    //     accessory.context.device = device;

    //     // create the accessory handler for the newly create accessory
    //     // this is imported from `platformAccessory.ts`
    //     new ExamplePlatformAccessory(this, accessory);

    //     // link the accessory to your platform
    //     this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    //  }
    //}
  }
}
