import { WebhookClient } from 'discord.js';
import { Keywords, KeywordsType } from './Keywords';
import { Message } from './Message';
import { FieldType } from './Storage';
import colors from 'colors';
import moment from 'moment';
moment.locale(`ru`);

export class Sender extends Message {
    payload;
    constructor(cluster, payload) {
        super(cluster);
        this.payload = payload;
    }
    async handle() {
        var now = new moment().format('MMMM Do YYYY, h:mm:ss a');
        const { index, storage, vk: { longpoll, filter, group_id, keywords, ads, donut: donutStatus, words_blacklist } } = this.cluster;
        const { date, owner_id, from_id, marked_as_ads, donut, text } = this.payload;
        const [last, published] = await Promise.all([
            storage.get(`${group_id}-last`, FieldType.NUMBER),
            storage.get(`${group_id}-published`, FieldType.ARRAY_NUMBER)
        ]);
        const hasInCache = last === date || published.includes(date);
        if (hasInCache) {
            return console.log(now.yellow, `[!] Новых записей в кластере #${index} нет.`);
        }
        const isNotFromGroupName = longpoll && filter && owner_id !== from_id;
        const hasAds = !ads && marked_as_ads;
        const hasDonut = !donutStatus && donut?.is_donut;
        if (isNotFromGroupName || hasAds || hasDonut) {
            return console.log(now.red, `[!] Новая запись в кластере #${index} не соответствует настройкам конфигурации, игнорируем ее.`);
        }
        const hasKeywords = new Keywords({
            type: KeywordsType.KEYWORDS,
            keywords
        })
            .check(text);
        const notHasBlacklistWords = new Keywords({
            type: KeywordsType.BLACKLIST,
            keywords: words_blacklist
        })
            .check(text);
        if (hasKeywords && notHasBlacklistWords) {
            await this.parsePost();
            return this.#send();
        }
        return console.log(now.yellow, `[!] Новая запись в кластере #${index} не соответствует ключевым словам, игнорируем ее.`);
    }
    async #send() {
        var now = new moment().format('MMMM Do YYYY, h:mm:ss a');
        const { post, repost, embeds: [embed], cluster: { index, discord: { webhook_urls, content, username, avatar_url: avatarURL } } } = this;
        embed.setDescription(post + repost);
        await this.#pushDate();
        if (!embed.description &&
            !embed.fields.length &&
            !embed.image) {
            return;
        }
        const results = await Promise.allSettled(webhook_urls.map((url) => (new WebhookClient({
            url
        })
            .send({
            content: content || null,
            avatarURL,
            embeds: this.embeds,
            files: this.files,
            username: username.slice(0, 80)
        }))));
        const rejects = results.filter(({ status }) => status === 'rejected');
        if (rejects.length) {
            return rejects.forEach(({ reason }) => {
                console.error(now.red, `[!] Произошла ошибка при отправке сообщения в кластере #${index}:`);
                console.error(reason);
            });
        }

        console.log(now.brightGreen, `[Вестник Феникса], \x1b[36m ПОСТ: \x1b[0m \n \x1b[33m${post}\x1b[0m \x1b[36m Опубликован в DISCORD! \x1b[0m`);

    }
    async #pushDate() {
        const { cluster: { vk: { group_id }, storage }, payload: { date } } = this;
        const published = await storage.get(`${group_id}-published`, FieldType.ARRAY_NUMBER);
        await Promise.all([
            storage.set(`${group_id}-last`, date),
            storage.set(`${group_id}-published`, [date, ...published].splice(0, 50))
        ]);
    }
}
