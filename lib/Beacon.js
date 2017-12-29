'use strict';

const {EventEmitter} = require('events');

const sConstructors = Symbol();

class Beacon extends EventEmitter {
    
    constructor() {
        super();
        this._lastUpdated = new Date();
        this._monitors = {};
    }
    
    get uniqueId() {
        throw new Error('unimplemented');
    }
    
    getProximity(monitor) {
        throw new Error('unimplemented');
    }
    
    _getMonitorData(monitor) {
        return this._monitors[monitor.monitorID];
    }
    
    getRSSI(monitor) {
        const monitorData = this._getMonitorData(monitor) || {};
        return monitorData.rssi;
    }
    
    onJoin(monitor, first) {
        this._monitors[monitor.monitorID] = {monitor};
        this.emit('join', monitor, this, first);
        return this._monitors[monitor.monitorID];
    }
    
    onLeave(monitor, last) {
        delete this._monitors[monitor.monitorID];
        this.emit('leave', monitor || this._monitor, this, last);
    }
    
    onProximityChange(monitor, monitorData) {
        let now = new Date();
        if(!monitorData.lastProximityChange || now - monitorData.lastProximityChange > 1000) {
            monitorData.lastProximityChange = now;
            monitorData.lastReportedProximity = this.getProximity(monitor);
            this.emit('proximityChanged', monitor, this);
        }
        else if(monitorData.lastReportedProximity === this.getProximity(monitor)) {
            monitorData.lastProximityChange = now;
        }
    }
    
    updateData(monitor, data) {
        let monitorData = this._getMonitorData(monitor);
        if(!monitorData) monitorData = this.onJoin(monitor, Object.keys(this._monitors).length < 1);
        
        monitorData.rssi = data.rssi;
        this.onProximityChange(monitor, monitorData);
        monitorData.lastUpdated = new Date();
    }
    
    get type() {
        throw new Error('unimplemented');
    }
    
    get lastUpdated() {
        return this._lastUpdated;
    }
    
    tick(now) {
        Object.values(this._monitors).forEach(monitorData => {
            if(now - monitorData.lastUpdated > 3000) {
                this.onLeave(monitorData.monitor, Object.keys(this._monitors).length <= 1);
            }
        });
    }
    
    static _addType(type, name, constructor) {
        this.types = this.types || {};
        this[sConstructors] = this[sConstructors] || {};
        this.types[type] = name;
        this[sConstructors][name] = constructor;
    }
    
    static makeBeacon(type, id, data) {
        if(!this[sConstructors][type]) throw new TypeError('Invalid beacon type');
        return new this[sConstructors][type](id, data);
    }
}

module.exports = Beacon;

Beacon._addType('IBEACON', 'iBeacon', require('./beacons/iBeacon'));
Beacon._addType('EDDYSTONE', 'Eddystone', require('./beacons/Eddystone'));