'use strict';

const Beacon = require('../Beacon');

const util = require('../util');

class Eddystone extends Beacon {
    
    constructor(id, {namespace, instance, measuredPower}) {
        super();
        this._uniqueId = id;
        this._namespace = namespace;
        this._instance = instance;
        this._measuredPower = measuredPower;
    }
    
    get type() {
        return Beacon.types.EDDYSTONE;
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
    
    
    get namespace() {
        return this._namespace;
    }
    
    get instance() {
        return this._instance;
    }
    
    get measuredPower() {
        return this._measuredPower;
    }
}

module.exports = Eddystone;