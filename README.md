# Guidelines for application development
Разрабатываем приложение на React Native, используя платформу Expo и Expo EAS

## Требования
1. Node.js (version >= 18)
2. Expo Go (на телефоне) или эмулятор

## Быстрый старт
1. Клонируете репозиторий и заходите в папку MetericControlApp
```bash
    git clone https://github.com/metering-control-system/app.git
    cd MetericControlApp
```
2. Устанавливаете зависимости
```bash
    npm install
```
3. Запускаете проект
```bash
    npm run start
```
4. Сканируете QR-код из консоли через Expo Go
    
## Разработка
❗️Работает commit hook и commitlint. Создание коммита не по правилам из `README.md` осуществляться не будет 
Если коммитите файлы, то выполняйте команду:
```bash
    npm run lint:fix
```
чтобы исправить ошибки форматирования.

❗Сообщения с ошибками, которые не смог исправить ESlint могут появиться в консоли. Прочитайте и исправьте их!

## Правила написания кода
- Код пишем в *camelCase* нотации
- Не используем inline комментарии
- console.log и debugger запрещены

## Пути в файлам
❗️Вместо относительных путей используем символ @. Пример пути к файлу: `@/<путь к файлу>`.

