'use strict';

class Util {
    static iBeaconUniqueId(uuid, major, minor) {
        return ['ibeacon', uuid.replace('-','').trim(), major, minor].join('-').toLowerCase();
    }
    
    static eddystoneUniqueId(uuid, major, minor) {
        //TODO
        return ['eddystone', uuid.replace('-','').trim(), major, minor].join('-').toLowerCase();
    }
    
    static async delay(timeout) {
        return new Promise((resolve) => {
            setTimeout(resolve, timeout);
        });
    }
}

module.exports = Util;