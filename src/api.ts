import {Logger, PlatformConfig} from 'homebridge';
import {fetch, Client} from 'undici';
import * as mqtt from 'mqtt';
import Value from './model/value';

export default class Api {
  private readonly config: PlatformConfig;
  private static instance: Api;
  public readonly log: Logger;
  private mqttClient: mqtt.Client;
  private newValueListeners: { [mqttTopic: string]: (newValue: Value) => void };

  private constructor(log: Logger, config: PlatformConfig) {
    this.config = config;
    this.log = log;
    this.newValueListeners = {};
    this.mqttClient = mqtt.connect('mqtt://' + this.config.hostname + ':' + '1883');
    this.mqttClient.on('message', (topic, message) => {
      this.log.info('New MQTT Message for ' + topic + ' : ' + message);
      this.informCallback(topic, Value.fromObject(JSON.parse(message.toString())));
    });

  }

  public static createInstance(log: Logger, config: PlatformConfig) {
    Api.instance = new Api(log, config);
  }

  public static getInstance(): Api {
    if (Api.instance === undefined) {
      throw new Error('Cannot continue without PlatformConfig.');
    }
    return Api.instance;
  }

  public async makeRequest(subPath: string): Promise<any> {
    this.log.info('Making request wit url: ' + 'http://' + this.config.hostname + ':' + this.config.port + '/' + subPath);
    const response = await fetch('http://' + this.config.hostname + ':' + this.config.port + '/' + subPath);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Request did not return 200, but ' + response.status);
    }
  }

  private async putComand(subPath: string, body: string) {
    this.log.info('Making put with url: ' + 'http://' + this.config.hostname + ':' + this.config.port + '/' + subPath);
    const response = await fetch('http://' + this.config.hostname + ':' + this.config.port + '/' + subPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });
    if (response.ok) {
      this.log.info('Request ok');
      return '';
    } else {
      throw new Error('Request did not return 200, but ' + response.status);
    }
  }

  public async putCommandNumber(subPath: string, value: number): Promise<any> {
    this.putComand(subPath, JSON.stringify({
      v: value,
    }));
  }

  public async putCommandBoolean(subPath: string, value: boolean): Promise<any> {
    this.putComand(subPath, JSON.stringify({
      v: value,
    }));
  }

  public registerNewValueCallback(mqttTopic: string, callback: (newValue: Value) => void) {
    this.mqttClient.subscribe(mqttTopic, (err: Error) => {
      if (err) {
        this.log.error(err.message);
      }
    });
    this.newValueListeners[mqttTopic] = callback;
  }

  public informCallback(mqttTopic: string, newValue: Value) {
    if (this.newValueListeners[mqttTopic] !== null) {
      this.newValueListeners[mqttTopic](newValue);
    }
  }

}