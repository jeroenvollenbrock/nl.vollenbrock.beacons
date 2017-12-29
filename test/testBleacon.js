'use strict';

const {Homey} = require('homey-mock');
const HappyBubblesDriver = require('../drivers/happy-bubbles/driver.js');

let first = true;

HappyBubblesDriver.discover((dev) => {
    if(!first) return;
    first = false;
    console.log(dev);
    
    const driver = new HappyBubblesDriver('happy-bubbles', [dev]);
});