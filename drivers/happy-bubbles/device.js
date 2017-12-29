'use strict';

const HappyBubblesClient = require('./HappyBubblesClient');
const MonitorDevice = require('../lib/MonitorDevice');
const Beacon = require('../../lib/Beacon');
const util = require('../../lib/util');


class HappyBubblesDevice extends MonitorDevice {
    onInit() {
        this.connect();
    }
    
    onDeleted() {
        this.disconnect();
    }
    
    connect() {
        if(!this._client) {
            this._client = new HappyBubblesClient({mqttId: this.mqttId, hostname: this.hostname});
            this._client.on('discover_ibeacon', this._onMeasureIbeacon.bind(this));
            this._client.on('discover_eddystone', this._onMeasureEddystone.bind(this));
        }
        this.log('Connecting...');
        this._client.connect();
    }
    
    disconnect() {
        if(!this._client) return;
        this.log('Disconnecting...');
        this._client.disconnect();
        this._client.removeAllListeners();
        delete this._client;
    }

    _onMeasureIbeacon(beacon) {
        beacon.major = parseInt(beacon.major, 16);
        beacon.minor = parseInt(beacon.minor, 16);
        beacon.measuredPower = parseInt(beacon.tx_power, 16);
        let uniqueId = util.iBeaconUniqueId(beacon.uuid, beacon.major, beacon.minor);
        this.updateBeacon(Beacon.types.IBEACON, uniqueId, beacon);
    }
    
    _onMeasureEddystone(beacon) {
        beacon.measuredPower = parseInt(beacon.tx_power, 16);
        let uniqueId = util.eddystoneUniqueId(beacon.namespace, beacon.instance_id);
        this.updateBeacon(Beacon.types.EDDYSTONE, uniqueId, beacon);
    }
    
    get mqttId() {
        return this.getData().mqttId || 'local';
    }

    get hostname() {
        return this.getData().hostname;
    }
    
    get monitorID() {
        return this.getData().id;
    }
    
    static getMonitorId(mqttId, hostname) {
        return [mqttId, hostname].join('-');
    }
}

module.exports = HappyBubblesDevice;