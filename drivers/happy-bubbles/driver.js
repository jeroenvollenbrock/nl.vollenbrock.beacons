'use strict';

const MonitorDriver = require('../lib/MonitorDriver');
const HappyBubblesClient = require('./HappyBubblesClient');

const Device = require('./device');

class HappyBubblesDriver extends MonitorDriver {

    onPair( socket ) {
        
        socket.on('list_devices', async ( data, callback ) => {
            let result = [];
            await this.constructor.discover('local', (dev) => {
                
                if(this.getDeviceByMonitorId(dev.data.id)) return;
                
                result.push(dev);
                
                socket.emit('list_devices', result );
            });
            callback(null, result);
            return result;
        });
    }
    
    static discoverDevToHomeyDev(mqttId, dev) {
        return {
            name: dev,
            data: {
                hostname: dev,
                mqttId: mqttId,
                id: Device.getMonitorId(mqttId, dev),
            }
        };
    }
    
    static async discover(mqttId, enumerate) {
        
        enumerate = enumerate || ( () => {} );
        
        const devs = await HappyBubblesClient.discover('local', 15000, (dev) => enumerate(this.discoverDevToHomeyDev(mqttId, dev)));
        return devs.map(this.discoverDevToHomeyDev.bind(null, mqttId));
    }
}

module.exports = HappyBubblesDriver;