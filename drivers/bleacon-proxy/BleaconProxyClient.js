'use strict';

const dgram = require('dgram');
const {EventEmitter} = require('events');
const net = require('net');
const readline = require('readline');


const PING_INTERVAL = 15000;
const RETRY_INTERVAL = 15000;

class BleaconProxyDriver extends EventEmitter {
    
    constructor(port, host) {
        super();
        this.port = port;
        this.host = host;
    }
    
    /**
     * Connects to the bleacon proxy
     */
    connect() {
        this.disconnect();
        this._client = new net.Socket();
        this._client.connect(this.port, this.host, () => {
        	this._startPing();
            this.connected = true;
            this.emit('available');
        });
        
        readline.createInterface({
            input: this._client
        }).on('line', this._onBeacon.bind(this));
        
        this._client.on('close', () => {
            if(this.connected) {
                this.disconnect();
        	}
            setTimeout(() => this.connect(), RETRY_INTERVAL); //retry after 15 seconds
        });
        this._client.on('error', (err) => {
            this.emit('error', err);
        });
    }
    
        
    _startPing() {
        this._stopPing();
        this._pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL);
    }   
     
    ping() {
        if(!this._client) return;
        this._client.write("ping");
    }
    
    _stopPing() {
        if(this._pingInterval) clearInterval(this._pingInterval);
    }
    
    disconnect() {
        this._stopPing();
        if(!this._client) return;
        this._client.removeAllListeners();
        this._client.destroy();
        if(this.connected) {
            this.connected = false;
            this.emit('unavailable');
    	}
        delete this._client;
    }

    _onBeacon(beacon) {
        try {
            beacon = JSON.parse(beacon);
        } catch(e) { return; }
        this.emit('discover_ibeacon', beacon);
    }
    
    /**
     * Scans for <timeout>ms and calls enumerate whenever a new device is discovered.
     * Resolves with an array of discovered devices
     * @param {number} timeout - time to scan for
     * @param {function} enumerate callback (gets called multiple times
     */
    static async discover(timeout, enumerate) {
        
        enumerate = enumerate || ( () => {} );
        
        const client = dgram.createSocket('udp4');
        
        const result = [];
        
        client.on('listening', () => {
            client.setBroadcast(true);
            client.send(JSON.stringify({
                type: 'bleacon-discover'
            }), 1337, '255.255.255.255');
        });
        
        client.on('message', (dev, rinfo) => {
            try {
                dev = JSON.parse(dev);
                if(dev.type === 'bleacon-discover') {
                    dev.address = rinfo.address;
                    enumerate(dev);
                    result.push(dev);
                }
            } catch(e) {
                console.error(e);
            }
        });
        
        client.on('error', (err) => {
            console.error(err);
        });
        
        client.bind();
    
        return new Promise((resolve) => {
            setTimeout(() => {
                client.close();
                client.removeAllListeners();
                resolve(result);
            }, timeout);
        });
    }
}

module.exports = BleaconProxyDriver;