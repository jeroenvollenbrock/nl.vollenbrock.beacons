'use strict';

const mqtt = require('async-mqtt');
const {ApiApp, manifest} = require('homey');

const {delay} = require('./util');

const MQTT_CONNECT_TIMEOUT = 7000;

class MQTTManager {
    
    constructor() {
        this._connections = {};
    }
    
    async getLocalBrokerInfo() {
        try {
            const brokerApi = new ApiApp('nl.scanno.mqttbroker');
            if(! await brokerApi.getInstalled()) throw new Error('broker_not_installed');
            const info = await brokerApi.get('/app2app/info');
            
            info.username = manifest.id;
            info.password = '1234'; //TODO
            info.protocol = info.tls ? 'tls': 'tcp';
            info.hostname = 'localhost';
            
            await brokerApi.put('/app2app/user', {
                userName: info.username,
                userPassword: info.password,
            });
            return info;
        } catch(e) {
            throw new Error('broker_not_installed');
        }
    }
    
    async connectLocal() {
        const info = await this.getLocalBrokerInfo();
        info.rejectUnauthorized = info.hasOwnProperty('selfSigned') && !info.selfSigned;
        
        const client = mqtt.connect(info);
        
        client.on('error', console.log);
        
        return new Promise((resolve, reject) => {
            client.once('connect', () => resolve(client));
            delay(MQTT_CONNECT_TIMEOUT).then(() => reject(new Error('timeout')));
        });
    }
    
    async getConnection(id, opts) {
        if(this._connections[id]) return this._connections[id];
        if(id === 'local')
            return this._connections[id] = this.connectLocal();
        throw new Error('unimplemented');
    }
}

module.exports = new MQTTManager();