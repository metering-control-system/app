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

## Как сделать build проекта
❗️Для использования нативных модулей и работы без интернета работы через Expo Go недостаточно. При разработке используется 2 вида билдов: development и preview. Выполните следующие действия в терминале
```bash
pwd #вы должны находиться в директории app или MetericControlApp проекта
npx expo install expo-dev-client #позволяет собрать build
``` 

### Сборка через EAS cloud
❗️Почему-то с **dev зависимостями** сборка не получается. Удалите все eslint и prettier зависимости в **package.json** и сделайте коммит. Только после этого приступайте к выполнению билда. После билда можете удалить коммит

```bash
npm install --global eas-cli #установка command tools для управления
```
Зарегистрируйтесь по [ссылке](https://expo.dev/signup)
```bash
eas login
```
Удалите следующие свойства в app.json: <u>"bundleIdentifier"</u>, <u>"owner"</u>, <u>"projectId"</u>, <u>"package"</u>
```bash
eas init
```
❗️Мы используем app.config.js, поэтому имя билду указывается там, поэтому перенесите логику из текущего eas.json в последующий ваш. Если хотите протетстить на разных ОС, то удалите eas.json и выполните:
```bash
eas build:configure
```
Далее происходит build приложения. Для того чтобы сбилдить development версию, выполните:
```bash
eas build --platform android --profile development
```
Для preview build, убедитесь, что заданы env переменные в eas, т.к при сборке не будут использоваться локальные env:
```bash
eas env:create --name EXPO_PUBLIC_<имя переменной> --value <значение переменной> --environment preview --visibility plaintext #установка переменной в eas
eas build --platform android --profile preview
eas env:pull --environment production #так можно подтянуть переменные из eas. Создается файл .env.local
```
Переменные можно поменять вручную, зайдя на свой проект в eas во вкладку Environment variables

❗️Отличие в том, что preview build полностью автономен и работает без запуска metro сервера, то есть без запуска проекта в консоли.

После выполните в консоли
```bash
npm run dev
```

### Сборка через gradlew(android only)
На mac
```bash
brew install openjdk@17
```
На основе debian
```bash
sudo apt update -y && apt install openjdk-17-jdk
```
На centOS
```bash
sudo yum update
sudo yum install java-17-openjdk-devel
```
Выполните появивщиеся в консоли команды после установки jdk, примерно в такой строчке: `For the system Java wrappers to find this JDK...
sudo ln -sfn ...`
```bash
#Установка переменных окружения
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

#обновление конфига
source ~/.zshrc #или source ~/.bashrc, смотря какой shell

#Проверка версии
java -version
echo $JAVA_HOME

expo prebuild
#сборка preview gradle
cd android
./gradlew clean && ./gradlew assembleRelease #или eas build
cd ..
#сборка development 
cd android
./gradlew clean && npx expo run:android #подключите перед этим телефон к компу и включите режим разработчика
```

## Установка
- Если собирали через EAS cloud, отсканируйте появившийся qr-код на сайте с помощью смартфона
- Если собирали через gradle, подключите телефон к компу, включите режим разработчика. Может потребоваться установка android studio, для корректной работы утилиты adb
```bash
brew install android-platform-tools
adb devices #проверка подключенных устройств
adb install android/app/build/outputs/apk/release/app-release.apk 
```

