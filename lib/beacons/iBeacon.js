'use strict';

const Beacon = require('../Beacon');

const util = require('../util');

class iBeacon extends Beacon {
    
    constructor(id, {uuid, major, minor, measuredPower}) {
        super();
        this._uniqueId = id;
        this._uuid = uuid;
        this._major = major;
        this._minor = minor;
        this._measuredPower = measuredPower;
    }
    
    get type() {
        return Beacon.types.IBEACON;
    }
    
    get uniqueId() {
        return this._uniqueId;
    }
    
    
    getProximity(monitor) {
        let rssi = this.getRSSI(monitor);
        let accuracy = Math.pow(12.0, 1.5 * ((rssi / this.measuredPower) - 1));
        
        if (typeof rssi === 'undefined' || accuracy < 0) {
            return 'unknown';
        } else if (accuracy < 0.5) {
            return 'immediate';
        } else if (accuracy < 4.0) {
            return 'near';
        } else {
            return 'far';
        }
    }
    
    
    get uuid() {
        return this._uuid;
    }
    
    get major() {
        return this._major;
    }
    
    get minor() {
        return this._minor;
    }
    
    get measuredPower() {
        return this._measuredPower;
    }
}

module.exports = iBeacon;