'use strict';

const { Driver, FlowCardTriggerDevice } = require('homey');

const BeaconManager = require('../../lib/BeaconManager');

class BeaconDriver extends Driver {
    
    getDeviceByBeaconId(id) {
        return this.getDevices().filter(dev => dev.getData().id === id).pop();
    }
    
    onInit() {
        
        // register the card
        this._beaconJoinTrigger = new FlowCardTriggerDevice('beacon_range_enter');
        this._beaconJoinTrigger
            .register();
            
        // register the card
        this._beaconProximityTrigger = new FlowCardTriggerDevice('beacon_range_proximity');
        this._beaconProximityTrigger
            .registerRunListener(async (args, state) => {
                return args.monitor.monitorID === state.monitorID;
            })
            .register();
            
        // register the card
        this._beaconLeaveTrigger = new FlowCardTriggerDevice('beacon_range_leave');
        this._beaconLeaveTrigger
            .register();
        
        BeaconManager.on('join', this.onBeaconJoin.bind(this));
        BeaconManager.on('proximityChange', this.onBeaconProximityChange.bind(this));
        BeaconManager.on('leave', this.onBeaconLeave.bind(this));
        
    }
    
    onBeaconJoin( monitor, beacon, first ) {
        let device = this.getDeviceByBeaconId(beacon.uniqueId);
        if(!device || !first) return; //TODO add monitor-specific card
        this._beaconJoinTrigger.trigger(device);
    }
    
    onBeaconProximityChange(monitor, beacon) {
        let device = this.getDeviceByBeaconId(beacon.uniqueId);
        if(!device) return;
        this._beaconProximityTrigger.trigger(device, {proximity: beacon.getProximity(monitor)}, {monitorID: monitor.monitorID});
    }
    
    onBeaconLeave(monitor, beacon, last) {
        let device = this.getDeviceByBeaconId(beacon.uniqueId);
        if(!device || !last) return; //TODO add monitor-specific card
        this._beaconLeaveTrigger.trigger(device);
    }

    onPair( socket ) {

        socket.on('list_devices', async ( data, callback ) => {
            let result = [];
    
            await this.constructor.discover((devices) => {
                result = devices;
                socket.emit('list_devices', result );
            });
            
            callback(null, result);
            return result;
        });
    }
    
    static fetchBeacons() {
        const beacons = BeaconManager.getCurrentBeacons();
        return Object.keys(beacons)
            .map(id => { return {
                name: beacons[id].type,
                data: {id},
            }});
    }
    
    static async discover(update) {
        
        update = update || ( () => {} );
        
        let result = [];
        
        const updateBeacons = () => {
            result = this.fetchBeacons()
            update(result);
        };
        
        updateBeacons();
        
        BeaconManager.on('join', updateBeacons);
        BeaconManager.on('leave', updateBeacons);
        
    
        return new Promise((resolve) => {
            setTimeout(() => {
                BeaconManager.removeListener('join', updateBeacons);
                BeaconManager.removeListener('leave', updateBeacons);
                resolve(result);
            }, 15000); //TODO: just keep looking while the window is open
        });
    }

}

module.exports = BeaconDriver;