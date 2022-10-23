import { Handler, Storage } from './modules';
// @ts-ignore
import config from '../config.json' assert { type: 'json' };
const { clusters } = config;
import moment from 'moment';
import fs from 'fs';
import util from 'util';
import express from 'express';
import os from 'os';
import morgan from 'morgan';
moment.locale(`ru`);

var now = new moment().format('MMMM Do YYYY, h:mm:ss a');
const app = express();
const port = process.env.PORT || 3000;
var accessLogStream = fs.createWriteStream('log.log', { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
var logFile = fs.createWriteStream('log.log', { flags: 'a' });
var logStdout = process.stdout;
if(os.hostname()) {
    var hostname = os.hostname();
    console.log(now.brightBlue, `Hostname for the operating`
        + " system is " + String(hostname));
}
console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

morgan.token('host', function(req, res) {
return req.hostname;
});

app.use(morgan(':date[web] :method :host :status :res[content-length] - :response-time ms'));
app.get("/", (req, res) => {
   res.sendFile('./log.log', { root: '.' })
});
app.listen(port, ()=>{
    console.log(now.brightBlue, 'WEB-Cервер запущен', "\x1b[31m", 'порт:', port, '\x1b[0m', )
  
});


console.log(now.brightBlue, "Весия ноды:", process.version );
console.log(now.brightBlue, '[Вестник Феникса] Запущен.');
const handlers = await Promise.all(clusters.map((cluster, index) => (new Handler({
    ...cluster,
    index: index + 1
})
    .init())));
const uniqueHandlers = handlers.reduce((handlers, handler) => {
    const instanceIndex = handlers.findIndex(([{ prefix }]) => (prefix === handler.storage.prefix));
    const hasInstance = instanceIndex !== -1;
    const handlerGroupId = handler.cluster.vk.group_id;
    if (!hasInstance) {
        handlers.push([handler.storage, [handlerGroupId]]);
    }
    else {
        handlers[instanceIndex][1].push(handlerGroupId);
    }
    return handlers;
}, []);
uniqueHandlers.forEach(async ([storage, groupIds]) => {
    const keys = await storage.getKeys();
    const outdatedKeys = keys.reduce((keys, key) => {
        if (key.startsWith(Storage.PREFIX) &&
            groupIds.findIndex((id) => key.includes(`-${id}-`)) === -1) {
            keys.push(key);
        }
        return keys;
    }, []);
    await Promise.all(outdatedKeys.map((key) => (storage.set(key))));
});
