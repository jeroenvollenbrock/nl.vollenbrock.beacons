'use strict';

const {EventEmitter} = require('events');

const {delay} = require('../../lib/util');
const MQTTManager = require('../../lib/MQTTManager');

const MQTT_TOPICS = [
    'happy-bubbles/ble/{hostname}/ibeacon/+',
    'happy-bubbles/ble/{hostname}/eddystone/+',
];

const MQTT_DISCOVER_TOPIC = 'happy-bubbles/ble/#';

class HappyBubblesClient extends EventEmitter {
    
    constructor({mqttId, hostname}) {
        super();
        this._mqttId = mqttId;
        this._hostname = hostname;
        this._onMessage = this._onMessage.bind(this);
    }
    
    /**
     * Connects to the bleacon proxy
     */
    async connect() {
        await this.disconnect();
        this._client = await MQTTManager.getConnection(this._mqttId);
        this._client.on('message', this._onMessage);
        return await this._client.subscribe(MQTT_TOPICS.map(topic => topic.replace('{hostname}', this._hostname)));
    }
    
    async disconnect() {
        if(!this._client) return;
        this._client.removeListener('message', this._onMessage);
        return await this._client.unsubscribe(MQTT_TOPICS.map(topic => topic.replace('{hostname}', this._hostname)));
    }
    
    _onMessage(topic, message) {
        const parts = topic.split('/');
        const hostname = parts[2];
        if(this._hostname !== hostname) return;
        const type = parts[3];
        switch(type) {
            case 'ibeacon':
                this._onIBeacon(JSON.parse(message.toString()));
            break;
            case 'eddystone':
                this._onEddystone(JSON.parse(message.toString()));
            break;
            default:
            break;
        }
    }

    _onIBeacon(beacon) {
        this.emit('discover_ibeacon', beacon);
    }

    _onEddystone(beacon) {
        this.emit('discover_eddystone', beacon);
    }
    
    /**
     * Scans for <timeout>ms and calls enumerate whenever a new device is discovered.
     * Resolves with an array of discovered devices
     * @param {number} timeout - time to scan for
     * @param {function} enumerate callback (gets called multiple times
     */
    static async discover(mqttId, timeout, enumerate) {
        
        enumerate = enumerate || ( () => {} );
        const hostnames = [];
        
        const client = await MQTTManager.getConnection(mqttId);
        await client.subscribe(MQTT_DISCOVER_TOPIC);
        
        const onMessage = (topic, message) => {
            topic = topic.replace(/^happy-bubbles\/ble\//, '');
            topic = topic.split('/').shift();
            if(hostnames.indexOf(topic) < 0) {
                hostnames.push(topic);
                enumerate(topic);
            }
        };
        
        client.on('message', onMessage);
        
        await delay(timeout);
        
        client.removeListener('message', onMessage);
        await client.unsubscribe(MQTT_DISCOVER_TOPIC);
        
        return hostnames;
    }
}

module.exports = HappyBubblesClient;