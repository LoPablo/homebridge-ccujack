"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const undici_1 = require("undici");
const mqtt = __importStar(require("mqtt"));
const value_1 = __importDefault(require("./model/value"));
class Api {
    constructor(log, config) {
        this.config = config;
        this.log = log;
        this.newValueListeners = {};
        this.mqttClient = mqtt.connect('mqtt://' + this.config.hostname + ':' + '1883');
        this.mqttClient.on('message', (topic, message) => {
            this.log.info('New MQTT Message for ' + topic + ' : ' + message);
            this.informCallback(topic, value_1.default.fromObject(JSON.parse(message.toString())));
        });
    }
    static createInstance(log, config) {
        Api.instance = new Api(log, config);
    }
    static getInstance() {
        if (Api.instance === undefined) {
            throw new Error('Cannot continue without PlatformConfig.');
        }
        return Api.instance;
    }
    async makeRequest(subPath) {
        this.log.info('Making request wit url: ' + 'http://' + this.config.hostname + ':' + this.config.port + '/' + subPath);
        const response = await (0, undici_1.fetch)('http://' + this.config.hostname + ':' + this.config.port + '/' + subPath);
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error('Request did not return 200, but ' + response.status);
        }
    }
    async putComand(subPath, body) {
        this.log.info('Making put with url: ' + 'http://' + this.config.hostname + ':' + this.config.port + '/' + subPath + ' and body ' + body);
        const response = await (0, undici_1.fetch)('http://' + this.config.hostname + ':' + this.config.port + '/' + subPath, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });
        if (response.ok) {
            this.log.info('Request ok');
            return '';
        }
        else {
            //throw new Error('Request did not return 200, but ' + response.status);
            this.log.info('Request did not return 200, but ' + response.status);
            this.log.info('Request answer, but ' + JSON.stringify(response));
        }
    }
    async putCommandNumber(subPath, value) {
        this.putComand(subPath, JSON.stringify({
            v: value,
        }));
    }
    async putCommandBoolean(subPath, value) {
        this.putComand(subPath, JSON.stringify({
            v: value,
        }));
    }
    registerNewValueCallback(mqttTopic, callback) {
        this.mqttClient.subscribe(mqttTopic, (err) => {
            if (err) {
                this.log.error(err.message);
            }
        });
        this.newValueListeners[mqttTopic] = callback;
    }
    informCallback(mqttTopic, newValue) {
        if (this.newValueListeners[mqttTopic] !== null) {
            this.newValueListeners[mqttTopic](newValue);
        }
    }
}
exports.default = Api;
//# sourceMappingURL=api.js.map