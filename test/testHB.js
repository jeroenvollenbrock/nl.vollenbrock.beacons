'use strict';

const {Homey} = require('homey-mock');
const BleaconDriver = require('../drivers/bleacon-proxy/driver.js');

let first = true;

BleaconDriver.discover((dev) => {
    if(!first) return;
    first = false;
    console.log(dev);
    
    const driver = new BleaconDriver('bleacon-proxy', [dev]);
});