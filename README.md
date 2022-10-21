Установка (консоль Shell):

npm install -g npm@8.19.2
npm install node@18.11.0
npm i

Получение токена VK и настройка config.json: 
1. Заходим в "Управление" в сообществе.
2. Далее переходим в "Работа с API".
3. Жмем конпку "Создать ключ".
4. Выбираем "Разрешить приложению доступ к управлению сообществом" и "Разрешить приложению доступ к стене сообщества".
5. Подтверждаем с помощью телефона.
6. Копируем полученный "token" в config.json.
7. Далее переходим в "Long Poll API.
8. Выбираем версию 5.126
9. Далее переходим в "Типы событий".
10. Выбираем "Добавление" и "Поделились"

https://regvk.com/id/
- определяем ИД групп, копируем в "group_id"

- берем вебхук с интеграции сервера в дискорде и копируем в "webhook_urls"

- даем имя боту в "username"

- оповещение с упоминанием ролей редактируем тут "content"

- задаем цвет ембеда полоски тут "color":

-				"author": true,  - указивает подпись автора
				"copyright": true, - указивает копирайт
				"date": true, - уазивает время поста
				"exclude_content": [] - запрещает контент

Добавляем мониторинг на https://uptimerobot.com:
копируем ссылку "пример: https://VK-Addons.forsakenworld.repl.co"
Авторизуемся на https://uptimerobot.com/
жмем Add New Monitor
Monitor Type - HTTP(s)
Friendly Name - Вестник Феникса
URL (or IP) - https://VK-Addons.forsakenworld.repl.co (пример, копируется непосредственно с окна над терминалом)
Monitoring Interval - every 5 minutes
Monitor Timeout - in 30 seconds
HTTP Method - HEAD
Завершаем настройку - жмем "Create Monitor"
