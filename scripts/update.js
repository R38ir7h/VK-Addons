import fs from 'fs';

import { LATEST_CONFIG_VERSION } from './constants';

import config from '../config.json' assert { type: 'json' };

const { clusters, version_dont_modify_me } = config;
var d = new Date();
var datetime = d.toLocaleString();
// Изменения версий фиксируются в массивах
const changes = new Map([
    [2, [{}, { author: true, copyright: true }]],
    [3, [{}, { content: '', username: '', avatar_url: '' }]],
    [4, [{ donut: false, ads: false, words_blacklist: [] }, {}]],
    [5, [{}, { date: true, exclude_content: [] }]]
]);

if (!clusters || !version_dont_modify_me) {
    console.warn("\x1b[33m",  datetime, '\x1b[0m', '[!] Структура вашего конфига больше не поддерживается скриптом, вам необходимо обновить конфиг вручную следуя инструкции.');

    process.exit(0);
}

if (version_dont_modify_me >= LATEST_CONFIG_VERSION) {
    console.log("\x1b[32m",  datetime, '\x1b[0m', '[!] Текущая версия конфига последняя, обновление не требуется.');

    process.exit(0);
}

config.clusters = clusters.map(({ vk, discord }) => {
    for (let version = version_dont_modify_me; version !== LATEST_CONFIG_VERSION; version++) {
        const [vkChanges, discordChanges] = changes.get(version + 1);

        vk = {
            ...vk,
            ...vkChanges
        };

        discord = {
            ...discord,
            ...discordChanges
        };
    }

    return {
        vk,
        discord
    };
});

config.version_dont_modify_me = LATEST_CONFIG_VERSION;

fs.writeFileSync('./config.json', JSON.stringify(config, null, '\t'));

console.log("\x1b[32m",  datetime, '\x1b[0m', '[Феникс] Конфиг обновлен до последней версии.');
