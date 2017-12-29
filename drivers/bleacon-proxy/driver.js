'use strict';

const MonitorDriver = require('../lib/MonitorDriver');
const BleaconProxyClient = require('./BleaconProxyClient');

class BleaconDriver extends MonitorDriver {

    onPair( socket ) {

        socket.on('list_devices', async ( data, callback ) => {
            let result = [];
            await this.constructor.discover((dev) => {
                
                if(this.getDeviceByMonitorId(dev.data.id)) return;
                
                result.push(dev);
                
                socket.emit('list_devices', result );
            });
            callback(null, result);
            return result;
        });
    }
    
    static discoverDevToHomeyDev(dev) {
        return {
            name: dev.name,
            settings: {
                host: dev.address,
                port: dev.port
            },
            data: {
                id: dev.id
            }
        };
    }
    
    static async discover(enumerate) {
        
        enumerate = enumerate || ( () => {} );
        
        const devs = await BleaconProxyClient.discover(15000, (dev) => enumerate(this.discoverDevToHomeyDev(dev)));
        return devs.map(this.discoverDevToHomeyDev);
    }
}

module.exports = BleaconDriver;