'use strict';

const {Driver} = require('homey');

class MonitorDriver extends Driver {
    getDeviceByMonitorId(id) {
        return this.getDevices().filter(dev => dev.monitorID === id).pop();
    }
}

module.exports = MonitorDriver;