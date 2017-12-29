'use strict';

const { EventEmitter } = require('events');
const util = require('./util');

const Beacon = require('./Beacon'); 

class BeaconManager extends EventEmitter {
    
    constructor() {
        super();
        this._beacons = {};
        setInterval(this._tick.bind(this), 3000);
    }
    
    getCurrentBeacons() {
        return this._beacons;
    }
    
    async testBeacon(args, state) {
        console.log(arguments);
        //TODO
        return true;
    }
    
    updateBeacon(type, monitor, id, data) {
        if(!this._beacons[id]) this._beacons[id] = this.makeBeacon(type, monitor, id, data);
        
        this._beacons[id].updateData(monitor, data);
    }
    
    makeBeacon(type, monitor, id, data) {
        const beacon = Beacon.makeBeacon(type, id, data);

        beacon.on('join', this.onBeaconJoin.bind(this));
        beacon.on('proximityChanged', this.onBeaconProximityChange.bind(this));
        beacon.on('leave', this.onBeaconLeave.bind(this));
        
        return beacon;
    }
    
    
    onBeaconJoin(monitor, beacon, first) {
        console.log('beacon join', monitor.monitorID, beacon.uniqueId, first);
        //TODO: generic flow cards
        this.emit('join', monitor, beacon, first);
    }
    
    onBeaconProximityChange(monitor, beacon) {
        console.log('beacon proximity', monitor.monitorID, beacon.uniqueId, beacon.getProximity(monitor));
        //TODO: generic flow cards
        this.emit('proximityChange', monitor, beacon);
    }
    
    onBeaconLeave(monitor, beacon, last) {
        console.log('beacon leave', monitor.monitorID, beacon.uniqueId, last);
        //TODO: generic flow cards
        this.emit('leave', monitor, beacon, last);
        if(last) {
            beacon.removeAllListeners();
            delete this._beacons[beacon.uniqueId];
        }
    }
    
    _tick() {
        let now = new Date()
        Object.values(this._beacons).forEach( (beacon) => beacon.tick(now) );
    }
}



module.exports = new BeaconManager();