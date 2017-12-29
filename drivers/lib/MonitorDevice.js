'use strict';

const {Device} = require('homey');

const BeaconManager = require('../../lib/BeaconManager');

class MonitorDevice extends Device {
    
    updateBeacon(type, id, data) {
        BeaconManager.updateBeacon(type, this, id, data);
    }
    
    get monitorID() {
        throw new Error('unimplemented');
    }
}

module.exports = MonitorDevice;