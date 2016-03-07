'use strict'; // eslint-disable-line

const koa = require('koa');
const logger = require('koa-logger');
const config = require('./config');
const wemo = require('wemo-wrapper');
const router = require('koa-router')();

const app = koa();

const devices = [];

wemo
    .discover()
    .then((devicesFound) => {
        for (let deviceFound of devicesFound) { // eslint-disable-line prefer-const
            devices.push(deviceFound);
        }
    });

router
    .get('/', function* defaultRoute() {
        const deviceFriendlyNames = devices.map(o => o.friendlyName).join('\n');

        this.body = `I have found the following devices:\n${deviceFriendlyNames}`;
    })
    .get('/on', function* turnSwitchesOn() {
        for (let device of devices) { // eslint-disable-line prefer-const
            if (device.turnedOn) {
                continue;
            }

            yield device.turnOn();
        }

        this.body = 'switches turned on';
    })
    .get('/off', function* turnSwitchesOn() {
        for (let device of devices) { // eslint-disable-line prefer-const
            if (device.turnedOff) {
                continue;
            }

            yield device.turnOff();
        }

        this.body = 'switches turned off';
    });

app.use(logger());
app.use(router.routes());

app.listen(config.port);
