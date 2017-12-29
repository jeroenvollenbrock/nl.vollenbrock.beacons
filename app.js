'use strict';

const Homey = require('homey');

const BeaconManager = require('./lib/BeaconManager');

class BLEBeaconApp extends Homey.App {
	
	onInit() {
		this.log('BLEBeaconApp is running...');
	}
	
}

module.exports = BLEBeaconApp;