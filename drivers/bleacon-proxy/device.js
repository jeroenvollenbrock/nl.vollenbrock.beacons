'use strict';

const BleaconProxyClient = require('./BleaconProxyClient');
const MonitorDevice = require('../lib/MonitorDevice');
const Beacon = require('../../lib/Beacon');
const util = require('../../lib/util');


class BleaconDevice extends MonitorDevice {
    onInit() {
        this.connect();
    }
    
    onDeleted() {
        this.disconnect();
    }
    
    setAvailable() {
        super.setAvailable();
        this.log('Connected');
    }
    
    setUnavailable() {
        super.setUnavailable();
        this.log('Disconnected');
    }
    
    _onConnectionError(err) {
        this.error(err.message);
    }
    
    connect() {
        if(!this._client) {
            this._client = new BleaconProxyClient(this.port, this.host);
            this._client.on('available', this.setAvailable.bind(this));
            this._client.on('unavailable', this.setUnavailable.bind(this));
            this._client.on('discover_ibeacon', this._onMeasure.bind(this));
            this._client.on('error', this._onConnectionError.bind(this));
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

    _onMeasure(beacon) {
        let uniqueId = util.iBeaconUniqueId(beacon.uuid, beacon.major, beacon.minor);
        this.updateBeacon(Beacon.types.IBEACON, uniqueId, beacon);
    }
    
    get host() {
        return this.getSetting('host');
    }
    
    get port() {
        return this.getSetting('port');
    }
    
    get monitorID() {
        return this.getData().id;
    }
}

module.exports = BleaconDevice;