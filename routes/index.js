const express = require('express');
const router = express.Router();
const request = require('request');
const _ = require('underscore');
const rp = require('request-promise');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

//user data
const userDate = require('./../config.json');

const debug = 1;
// debug - 1, идут только необходимые логи, которые показывают процессы запуска.
// debug - 2, идут логи из основных функций
// debug - 3, идут полные логи


let listPayload = {
    Wahlberg:  {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7628, 7629, 7630, 7631, 7632],"villageId":535576589},"session":"b02689242327472cfe49"},
    Wahlberg2: {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7628, 7629],"villageId":535543833},"session":"b02689242327472cfe49"},
    lolko:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7801, 7802],"villageId":536231973},"session":"512bf1edb8e02fb8cfc8"},
    cheetah:   {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7854, 7855, 7856],"villageId":535674893},"session":"ebfca8388dead74e845c"},
    Morpoh:    {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7835, 7836, 7837, 7838],"villageId":535904265},"session":"3ae3d17a5f3484e3c1d7"},
    Morpoh2:   {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[3237],"villageId":535543819},"session":"3ae3d17a5f3484e3c1d7"},
    grando:    {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7757,7758],"villageId":535969825},"session":"8736c7539713f1d7e2fe"},
    andrew:    {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7456, 7457, 7696, 7697, 7698],"villageId":536035383},"session":"fa9dfe3a87a7f4d061a9"},
    pushgun:   {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7777, 7778, 7779, 7780, 7781, 7782],"villageId":536133667},"session":"277f3ee941e5bf712f7b"},
    engal:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7895, 7896, 7897],"villageId":536231970},"session":"4e4ad78c792acd4b76ce"},
    rinko:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[8077, 8078, 8079, 8080, 8081, 8082, 8083],"villageId":535478280},"session":"474169e3f213fd76b0eb"},
    hedin:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7721, 7722, 7723, 7724],"villageId":535576588},"session":"c10c4a5b835cf9fd46dc"},
    hedin2:    {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[7718, 7719, 7720],"villageId":535642126},"session":"c10c4a5b835cf9fd46dc"}
};
let cookie = userDate.cookie;
let apiData = {
    gameworld: null,
    players: null,
    alliances: null,
    map: null,
    fromGame: null,
    crop: null
};
let apiKey = {};
let timeForGame = 't' + Date.now();
let token = userDate.token;
let serverDomain = userDate.serverDomain;

//different = {less, equal, more}
//value = value
//TODO: вынести фильтры
/**
 * Примеры фильров
 * @type {{players: {active: {different: string, value: string}}, villages: {population: {different: string, value: string}}}}
 */
let deathsFilter = {
    players: {
        active: {
            different: "equal",
            value: "0"
        },
        population:{
            different: "more",
            value: "100"
        }
    },
    villages: {
        population:{
            different: "more",
            value: "100"
        }
    }
};
let withoutKingdomsFilter = {
    players: {
        kingdomId: {
            different: "equal",
            value: "0"
        },
        active: {
            different: "equal",
            value: "1"
        }
    },
    villages: {
        population:{
            different: "more",
            value: "100"
        }
    }
};

//TODO: переписать на класс, добавить es6 , ts

/** Генераторы времени
 * @param seconds
 * @returns {Number}
 */
function fixedTimeGenerator(seconds) {
    //Точное кол-во seconds секунд
    return parseInt(1000 * seconds);
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomTimeGenerator(seconds) {
    //Рандом число в пределах seconds секунд
    return parseInt(getRandomInt(-1000, 1000) * seconds);
}

/**
 * Проставляет заголовки из конфига, требуется для защиты
 * @param serverDomain
 * @param cookie
 * @returns {{content-type: string, Cookie: *, Host: string, Origin: string, Pragma: string, Referer: string, User-Agent: string}}
 */
function setHttpHeaders(serverDomain, cookie, contentLength){

    return {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Cookie' : cookie,
        'Host': serverDomain+'.kingdoms.com',
        'Origin': 'http://'+serverDomain+'.kingdoms.com',
        'Content-Length':contentLength,
        'Pragma':'no-cache',
        'Referer': 'http://'+serverDomain+'.kingdoms.com',
        'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    }
}

/**
 * http request для травиан кингдомса, возвращает колбек ответа
 * @param opt
 */
function httpRequest(opt){
    let timeForGame = 't' + Date.now();

    let options = {
        headers: setHttpHeaders(opt.serverDomain, cookie, JSON.stringify(opt.body).length),
        method: opt.method || 'GET',
        uri: `http://${opt.serverDomain}.kingdoms.com/api/?c=${opt.body.controller}&a=${opt.body.action}&${timeForGame}`,
        body: JSON.stringify(opt.body),
        json: true // Automatically stringifies the body to JSON
    };

    //console.log(JSON.stringify(options).help)

    //RP - request promise, return deffered object.
    return rp(options);
}
//fixedTime - фиксированное время
//randomTime - разброс

/**
 * Требуется рефакторинг и доработка
 * Фармлисты
 * @param fixedTime - основное время через которое должно повторяться
 * @param randomTime - случайный разброс, что бы не спалили
 * @param listPayload - запрос который шлётся из ПСа, требуется ТК+
 * @param serverDomain - домен сервера, требуется рефакторинг и вынос этого гавна
 * @param init - инцилизировать сразу, или запустить через fixedTime+randomTime
 */
function autoFarmList(fixedTime, randomTime, listPayload, serverDomain, init) {

    let lastDataFromList = {
        "action": "get",
        "controller": "cache",
        "params": {
            "names": [
                "Kingdom:undefined",
                "Collection:FarmList:"
            ]
        },
        "session": listPayload.session
    };

    //for (let i = 0; i < listPayload.params.listIds.length; i++) {
    //  let obj = "Collection:FarmListEntry:" + listPayload.params.listIds[i];
    //  lastDataFromList.params.names.push(obj);
    //}

    let percentLose = 0.75;

    let startFarmListRaid = function (listPayload) {
        //console.log(listPayload);

        let options = {
            serverDomain: serverDomain,
            body: listPayload
        };

        httpRequest(options).then(
            function (body) {
                //console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] отправлен');
                // console.log(body);
            },
            function (err) {
                //console.error('Произошла ошибка');
                //console.log(err);
                //console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] отправлен');

            }
        );


    };

    let checkList = function (listPayload) {
        // console.log('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] проверка');

        function start(counter, countMax, timeout, clearTimer, func, obj) {

            if (counter < countMax){

                setTimeout(function () {

                    if (func){func(obj, counter);}

                    counter++;
                    start(counter, countMax, timeout, clearTimer, func, obj);

                }, timeout);

            } else{

//                console.log('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] проверка закончена');

                let now = new Date();
                let rand = fixedTimeGenerator(fixedTime) + randomTimeGenerator(randomTime);

                //console.log(now+rand);

                let tempTime = now.valueOf() + rand;
                let dateNext = new Date(tempTime);
                //запуск сразу
                if (init) {

                    if (debug === 2 || debug === 3){
                        //console.log(listPayload)
                    }

                    let checkBodyObj = {
                        "controller":"cache",
                        "action":"get",
                        "params":{
                            names: []
                        },
                        "session":listPayload.session
                    };

                    for (let i = 0; i < listPayload.params.listIds.length; i++) {
                        let list = listPayload.params.listIds[i];
                        checkBodyObj.params.names.push("Collection:FarmListEntry:"+list);
                    };

                    let options = {
                        method: 'POST',
                        headers: {
                            'content-type' : 'application/x-www-form-urlencoded'
                        },
                        json: true,
                        body: checkBodyObj,
                        serverDomain: serverDomain
                    };

                    //console.log('Сформировали массив фарм листов');

                    //TODO: ПРОВЕРИТЬ!
                    httpRequest(options)
                    .then(
                        (body) => {

                            function checkOnStatus(farmListsResponse, fn){
                                asyncLoop(
                                    farmListsResponse.cache.length,
                                    function(loopList){

                                        //TODO: возможно nginx этот луп убьёт, но возможно нет так как всего посылается 2 запроса.
                                        let i = loopList.iteration();
                                        let FarmListEntry = body.cache[i].name.split(":")[2];
                                        // //console.log(`Подан фармлист с Айди ${FarmListEntry}`.info);

                                        // console.log(FarmListEntry)
                                        asyncLoop(
                                            farmListsResponse.cache[i].data.cache.length,
                                            function(loop){

                                                let j = loop.iteration();

                                                let villageLog = farmListsResponse.cache[i].data.cache[j];

                                                // console.log(`Чек этого  ${JSON.stringify(villageLog).green}`);

                                                if (!villageLog || !villageLog.data || !villageLog.data.lastReport){
                                                    //console.log(`Чек этого  ${JSON.stringify(villageLog.data).green}`);
                                                    loop.next();
                                                } else if (villageLog.data.lastReport.notificationType == 1){
                                                    // if (debug === 2 || debug === 3){
                                                    //     console.log('green log')
                                                    // }
                                                    loop.next();
                                                } else if (villageLog.data.lastReport.notificationType == 2){
                                                    if (debug === 2 || debug === 3){
                                                        //console.log('yellow log')
                                                    }
                                                    let toggleBody = {
                                                        "controller":"farmList",
                                                        "action":"toggleEntry",
                                                        "params":{
                                                            "villageId":villageLog.data.villageId,
                                                            "listId":   FarmListEntry
                                                        },
                                                        "session":listPayload.session
                                                    };

                                                    let options = {
                                                        method: 'POST',
                                                        headers: {
                                                            'content-type' : 'application/x-www-form-urlencoded'
                                                        },
                                                        json: true,
                                                        body: toggleBody,
                                                        serverDomain: serverDomain
                                                    };

                                                    //console.log(options.info)


                                                    httpRequest(options)
                                                        .then(
                                                            (body) => {
                                                                //console.log(body);
                                                                return httpRequest(options);
                                                            },
                                                            (error) => {
                                                                //console.log(error);
                                                            }
                                                        )
                                                        .then(
                                                            (body) => {
                                                                //console.log(body);
                                                                if (debug === 3){
                                                                    console.log(body);
                                                                }
                                                                console.log('Жёлтый лог обработан.'.silly)
                                                                loop.next();
                                                            },
                                                            (error) => {
                                                                console.log(error);
                                                            }
                                                        )
                                                } else if (villageLog.data.lastReport.notificationType == 3){
                                                    if (debug === 2 || debug === 3){
                                                    }
                                                    console.log('red log'.debug)
                                                    //TODO: вынести в отдельную функцию
                                                    let toggleBody = {
                                                        "controller":"farmList",
                                                        "action":"toggleEntry",
                                                        "params":{
                                                            "villageId":villageLog.data.villageId,
                                                            "listId":   FarmListEntry
                                                        },
                                                        "session":listPayload.session
                                                    };

                                                    let options = {
                                                        method: 'POST',
                                                        headers: {
                                                            'content-type' : 'application/x-www-form-urlencoded'
                                                        },
                                                        json: true,
                                                        body: toggleBody,
                                                        serverDomain: serverDomain
                                                    };

                                                    console.log(options.info)


                                                    httpRequest(options)
                                                        .then(
                                                            (body) => {
                                                                console.log(body);
                                                                return httpRequest(options);
                                                            },
                                                            (error) => {
                                                                console.log(error);
                                                            }
                                                        )
                                                        .then(
                                                            (body) => {
                                                                console.log(body);
                                                                if (debug === 3){
                                                                    console.log(body);
                                                                }
                                                                console.log('Красный лог обработан.'.silly)
                                                                loop.next();
                                                            },
                                                            (error) => {
                                                                console.log(error);
                                                            }
                                                        )
                                                } else {
                                                    console.log(`Странный лог ${villageLog.lastReport.notificationType}`);
                                                }
                                            },
                                            function () {
                                                loopList.next();
                                            }
                                        );

                                    },
                                    function () {
                                        console.log('cycle list ended');
                                        console.log('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] запуск: [' + now.toString()+']');
                                        fn(listPayload);
                                    }
                                )
                            }


                            //TODO: add callback on checkOnStatus
                            // callback(body);
                            checkOnStatus(body, startFarmListRaid.bind(null, listPayload));

                        },
                        (error) => {
                            console.log(error);
                        }
                    )
                }

                console.log('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] следующий запуск: [' + dateNext.toString()+']');


                init = true;

                setTimeout(checkList.bind(null, listPayload), rand);

            }
        }

        function rowInListChanger(body, i, j){
            let objFromCache = body.cache[j].data.cache[i],
                lastReport = objFromCache.data.lastReport;

            // console.log(j, i);

            let newObjUnits = {
                "controller": "farmList",
                "action": "editTroops",
                "params": {
                    "entryIds": [objFromCache.data.entryId],
                    "units": objFromCache.data.units
                },
                "session": listPayload.session
            };

            //TODO: переписывать в зависимости от рассы
            let romeTroops = {
                1: 50,
                2: 20,
                3: 50,
                4: 0,
                5: 100,
                6: 70
            };

            if (!lastReport) return false;
            // console.log(lastReport);
            if (lastReport.notificationType == '1') {
                let sum = 0;

                for (let unitKey in objFromCache.data.units) {
                    sum += parseInt(objFromCache.data.units[unitKey]);
                }

                //Если полный хабар то увеличиваем счётчик юнита
                if (lastReport.capacity === lastReport.raidedResSum) {
                    for (let unitKey in objFromCache.data.units) {

                        if (objFromCache.data.units[unitKey] != 0) {
                            objFromCache.data.units[unitKey]++;
                        }

                        // console.log('Зелёный лог: увеличилось на 1 юнита');

                    }
                }

                //Если хабар не полный, то грузподъемность пополам
                else if (lastReport.capacity / 2 > lastReport.raidedResSum || sum > 10) {
                    if (objFromCache.data.units[unitKey] != 0) {
                        objFromCache.data.units[unitKey]--;
                    }

                    // console.log('Зелёный лог: уменьшилось на 1 юнита');

                }

                else {
                    //console.log('Зелёный лог: оставить без изменений');
                    return false;
                }

            }
            else if (lastReport.notificationType == '2') {
                let capacity = 0;

                for (let unitKey in objFromCache.data.units) {
                    // console.log(parseInt(objFromCache.data.units[unitKey]));
                    // console.log(romeTroops[unitKey]);
                    capacity += parseInt(objFromCache.data.units[unitKey]) * romeTroops[unitKey];
                }

                //Если потери будут меньше чем указанный процент, то кол-во юнитов увеличивается в два раза

                // console.log('Capacity: ' + capacity);
                // console.log('LastReport: ' + lastReport.capacity * percentLose);
                if (capacity > lastReport.capacity * percentLose && capacity/4 < lastReport.capacity * percentLose) {
                    for (let unitKey in objFromCache.data.units) {
                        objFromCache.data.units[unitKey] *= 2
                    }
                    // console.log('Жёлтый лог: отправлен запрос');
                } else {

                    for (let unitKey in objFromCache.data.units) {
                        sum += parseInt(objFromCache.data.units[unitKey]);
                        objFromCache.data.units[unitKey] = 0;
                    }

                    objFromCache.data.units[1] = 1;

                    // console.log('Жёлтый лог: убран');
                }
            }
            else if (lastReport.notificationType == '3'){

                let sum = 0;

                for (let unitKey in objFromCache.data.units) {
                    sum += parseInt(objFromCache.data.units[unitKey]);
                    objFromCache.data.units[unitKey] = 0;
                }

                objFromCache.data.units[2] = 1;

                if (sum == 1) {
                    // console.log('Красный лог: оставлен без изменения');
                    return false;
                } else {
                    // console.log('Название деревни' + objFromCache.data.villageName);
                    // console.log('Красный лог: отправлен запрос');
                }
            }

            // console.log(newObjUnits);

            //TODO: вынести options в начале функции

            let options = {
                serverDomain: serverDomain,
                body: newObjUnits
            };

            httpRequest(options).then(
                function (body) {
                    console.log(body);
                },
                function (err) {
                    console.log(err);
                }
            );
        }

        function listTimer(body, i){
            let j = 1;
            let diffI = 0;
            let sum = body.cache[1].data.cache.length;

            for (let k = 1; k < body.cache.length;k++ ) {
                if (i >= sum){
                    diffI = sum;
                    sum += body.cache[k].data.cache.length;
                    j++;
                }
            }

            // console.log(sum);
            // console.log(sum);

            //+1 от Kingdom:undefined
            // let rowInListChangerTimerObj = rowInListChanger(body, i-diffI+1 , j);
        }

        let options = {
            serverDomain: serverDomain,
            body: lastDataFromList
        }



        httpRequest(options)
            .then(function (body) {
                let counter = 0;
                let countMax = 0;

                if (body && body.error){
                    console.log(body.error.message + " " + listPayload.session);
                }

                for (let i = 0; i < body.cache.length; i++) {
                    if (body.cache[i].name === "Kingdom:undefined"){
                        continue;
                    }
                    countMax += body.cache[i].data.cache.length;
                }

                //console.log(countMax);

                let listTimerObj = 0;

                listTimerObj = start(counter, countMax,  1000, listTimerObj, listTimer, body);


            })
            .catch(function (err) {
                //console.log(err);
                console.log(err);
                // POST failed...
            });

    };

    checkList(listPayload);
};
/**
 * Получаем опенапи токен
 * @param callback
 */
function getToken(callback) {
    let options = {
        method: 'GET',
        uri: `http://${serverDomain}.kingdoms.com/api/external.php?action=requestApiKey&email=allin.nikita@yandex.ru&siteName=borsch&siteUrl=http://borsch-label.com&public=true`,
        json: true // Automatically stringifies the body to JSON
    };

    rp(options).then(
        (body) => {
            //console.log('Токен ' + body.response.privateApiKey);
            callback(body);
        },
        (error) => {
            //console.log(error);
        }
    )
}
/**
 * Получение карты
 * @param callback
 */
function getMap(callback) {
    getToken(
        function (token) {
            let options = {
                method: 'GET',
                headers: {
                    'content-type' : 'application/x-www-form-urlencoded'
                },
                uri: `http://${serverDomain}.kingdoms.com/api/external.php?action=getMapData&privateApiKey=${token.response.privateApiKey}`,
                json: true // Automatically stringifies the body to JSON
            };

            //TODO: ТУТ ОСТАНОВИЛСЯ

            rp(options)
                .then(
                    (body) => {
                        callback(body);
                    },
                    (error) => {
                        //console.log(error);
                    }
                )
        }
    );
    // token = await getToken().response.privateApiKey;
    //
}
/**
 * Получние информации о юзерах
 * @param callback
 */
function getPlayers(callback) {
    getMap(function (body) {
        let players = _.pluck(body.response.players, 'playerId');

        for (let i = 0; i < players.length; i++) {
            players[i] = 'Player:'+players[i];
        }

        let payload = {
            controller: "cache",
            action: "get",
            params: {names: players},
            session: token
        };

        let options = {
            method: 'POST',
            headers: {
                'content-type' : 'application/x-www-form-urlencoded'
            },
            json: true,
            body: payload,
            serverDomain: serverDomain
        };
        
        console.log('Сформировали массив игроков');

        httpRequest(options)
            .then(
                (body) => {
                    callback(body);
                },
                (error) => {
                    console.log(error);
                }
            )
    })
}
/**
 * Получаем карту по условиям.
 * Скрипт требует переработки, ибо код гавно, которому 1.5 года
 * @param type
 * @param token
 * @param serverDomain
 * @param timeForGame
 */
function getMapInfo(type, token, serverDomain, timeForGame) {
        type = type || 'animal';
        request
            .get({
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                url: 'http://' + serverDomain + '.kingdoms.com/api/external.php?action=requestApiKey&email=allin.nikita@yandex.ru&siteName=borsch&siteUrl=http://borsch-label.com&public=true'
            }, function (error, response, body) {

                apiKey = JSON.parse(body);
                console.log('Получили токен');
                //console.log(apiKey);

                request
                    .get({
                        headers: {'content-type': 'application/x-www-form-urlencoded'},
                        url: 'http://' + serverDomain + '.kingdoms.com/api/external.php?action=getMapData&privateApiKey=' + apiKey.response.privateApiKey
                    }, function (error, response, body) {
                        let toJson = JSON.parse(body);
                        apiData.players = JSON.stringify(toJson.response.players);
                        apiData.alliances = JSON.stringify(toJson.response.alliances);
                        apiData.gameworld = JSON.stringify(toJson.response.gameworld);
                        apiData.crop = {};


                        function oasis() {

                            let oasisArr = [];
                            let oasisObj = JSON.parse(JSON.stringify(toJson.response.map.cells));
                            let j = 0;
                            for (let i = 0; i < oasisObj.length; i++) {
                                if (oasisObj[i].oasis != 0) {
                                    oasisArr[j] = 'MapDetails:' + oasisObj[i].id;
                                    j++;
                                }
                            }

                            let oasisAnimal = [];
                            let k = 0;
                            console.log('Сформировали массив');

                            let session = {"controller": "cache", "action": "get", "params": {"names": oasisArr}, "session": token};

                            request
                                .post({
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    url: 'http://' + serverDomain + '.kingdoms.com/api/?c=cache&a=get&' + timeForGame,
                                    body: JSON.stringify(session)
                                }, function (error, response, body) {
                                    //console.log(body);
                                    let jsonBody = JSON.parse(body);

                                    let map = [];
                                    let defenseTable = [
                                        {Infantry: 25, Mounted: 20},
                                        {Infantry: 35, Mounted: 40},
                                        {Infantry: 40, Mounted: 60},
                                        {Infantry: 66, Mounted: 55},
                                        {Infantry: 70, Mounted: 33},
                                        {Infantry: 80, Mounted: 70},
                                        {Infantry: 140, Mounted: 200},
                                        {Infantry: 380, Mounted: 240},
                                        {Infantry: 170, Mounted: 250},
                                        {Infantry: 440, Mounted: 520},
                                        {Infantry: 1000, Mounted: 1000}
                                    ];
                                    let l = 0;


                                    //console.log(jsonBody.cache);

                                    for (let m = 0; m < jsonBody.cache.length; m++) {
                                        for (let k = 0; k < toJson.response.map.cells.length; k++) {
                                            if (toJson.response.map.cells[k].id == jsonBody.cache[m].data.troops.villageId) {

                                                let avgMaxDpsInfantry = 0;
                                                let avgAllDpsInfantry = 0;
                                                let avgMaxDpsMounted = 0;
                                                let avgAllDpsMounted = 0;
                                                let troopsCounter = 0;
                                                let minTroopsCounter = 1000000;
                                                let toIntUnits = 0;
                                                let counterAnimalType = 0;

                                                for (let counterUnits in jsonBody.cache[m].data.troops.units) {
                                                    if (jsonBody.cache[m].data.troops.units.hasOwnProperty(counterUnits)) {
                                                        toIntUnits = parseInt(jsonBody.cache[m].data.troops.units[counterUnits], 10);
                                                        if (toIntUnits != 0 &&
                                                            minTroopsCounter > toIntUnits) {
                                                            minTroopsCounter = toIntUnits;
                                                        }
                                                        if (toIntUnits) {
                                                            counterAnimalType++
                                                        }
                                                        troopsCounter += toIntUnits;
                                                        avgAllDpsInfantry += jsonBody.cache[m].data.troops.units[counterUnits] * defenseTable[counterUnits - 1].Infantry;
                                                        avgAllDpsMounted += jsonBody.cache[m].data.troops.units[counterUnits] * defenseTable[counterUnits - 1].Mounted;
                                                    }
                                                }

                                                avgAllDpsInfantry = (avgAllDpsInfantry / troopsCounter).toFixed(1);
                                                avgAllDpsMounted = (avgAllDpsMounted / troopsCounter).toFixed(1);

                                                if (avgAllDpsInfantry.length < 5) {
                                                    avgAllDpsInfantry = '0' + avgAllDpsInfantry
                                                }

                                                if (avgAllDpsMounted.length < 5) {
                                                    avgAllDpsMounted = '0' + avgAllDpsMounted
                                                }

                                                if (troopsCounter === 0) {
                                                    break;
                                                }

                                                map[l] = {
                                                    x: toJson.response.map.cells[k].x,
                                                    y: toJson.response.map.cells[k].y,
                                                    animal: jsonBody.cache[m].data.troops.units,
                                                    counterAnimalType: counterAnimalType,
                                                    avgAllDps: avgAllDpsInfantry + '/' + avgAllDpsMounted,
                                                    avgAllDpsInfantry: avgAllDpsInfantry,
                                                    avgAllDpsMounted: avgAllDpsMounted
                                                };

                                                l++;
                                                break;
                                            }
                                        }
                                    }

                                    map = _.sortBy(map, 'avgAllDpsInfantry').reverse();


                                    apiData.map = map;
                                    //console.log(apiData.map);
                                    //console.log(jsonBody.cache);
                                    //console.log(toJson.response.map.cells);
                                    console.log('Создали объект');

                                });
                        }
                        function crop(map){

                            let cropArray = [];

                            // console.log(map);

                            // console.log(map.length);

                            // obj.path = Math.sqrt(Math.pow((obj.x-custom.x),2) + Math.pow((obj.y-custom.y), 2));
                            // obj.path = obj.path.toFixed(3);
                            // if(obj.path.length==5){obj.path='0'+obj.path}
                            // cropArray.push(obj);

                            asyncLoop(
                                map.length,
                                function(loop){

                                    let i = loop.iteration();

                                    let obj = map[i];

                                    if(obj.resType == '3339' && obj.oasis == 0 && obj.kingdomId == 0){

                                        //9ka добавлена

                                        let listObj = {
                                            "controller":"map",
                                            "action":"editMapMarkers",
                                            "params":{
                                                "markers":[
                                                    {
                                                        "owner":1,
                                                        "type":3,
                                                        "color":6,
                                                        "editType":3,
                                                        "ownerId":2627,
                                                        "targetId":obj.id
                                                    }
                                                ],
                                                "fieldMessage":{
                                                    "text":"",
                                                    "type":4,
                                                    "duration":0,
                                                    "cellId":obj.id,
                                                    "targetId":31
                                                }
                                            },
                                            "session": token
                                        };

                                        let options = {
                                            method: 'POST',
                                            headers: {
                                                'content-type' : 'application/x-www-form-urlencoded'
                                            },
                                            serverDomain: serverDomain,
                                            json: true,
                                            body: listObj
                                        };


                                        httpRequest(options)
                                        .then(
                                            function (body) {
                                                console.log(body)
                                                setTimeout(loop.next, 100);


                                            },
                                            function (error) {
                                                console.log(error)
                                            }
                                        );

                                    } else if (obj.resType == '11115' && obj.oasis == 0 && obj.kingdomId == 0){


                                        //15ka добавлена
                                        let listObj = {
                                            "controller":"map",
                                            "action":"editMapMarkers",
                                            "params":{
                                                "markers":[
                                                    {
                                                        "owner":1,
                                                        "type":3,
                                                        "color":10,
                                                        "editType":3,
                                                        "ownerId":2627,
                                                        "targetId":obj.id
                                                    }
                                                ],
                                                "fieldMessage":{
                                                    "text":"",
                                                    "type":4,
                                                    "duration":0,
                                                    "cellId":obj.id,
                                                    "targetId":31
                                                }
                                            },
                                            "session": token
                                        };

                                        let options = {
                                            method: 'POST',
                                            headers: {
                                                'content-type' : 'application/x-www-form-urlencoded'
                                            },
                                            serverDomain: serverDomain,
                                            json: true,
                                            body: listObj
                                        };

                                        httpRequest(options)
                                        .then(
                                            function (body) {
                                                console.log(body);

                                                setTimeout(loop.next, 100);
                                            },
                                            function (error) {
                                                console.log(error)
                                            }
                                        );

                                    } else {
                                        loop.next();
                                    }

                                },
                                function () {
                                    console.log('Добавление точек заверешено :)')
                                }
                            );


                        }

                        switch (type){
                            case 'animal':
                                oasis();
                                break;
                            case 'crop':
                                crop(toJson.response.map.cells);
                                break;
                        }
                    });
            });
    };

function autoUnitsBuild(villageId, unitsBarack, unitsStable, fixedTime, randomTime, session){
    let rand = fixedTimeGenerator(fixedTime) + randomTimeGenerator(randomTime);

    let getAllOptions = {
        method: 'POST',
        headers: {
            'content-type' : 'application/json;charset=UTF-8'
        },
        json: true,
        body: {"controller":"player","action":"getAll","params":{deviceDimension: "1920:1080"},"session":session},
        serverDomain: serverDomain
    };

    httpRequest(getAllOptions)
    .then(
        (body) => {
            let location = {};
            body.cache.forEach(function (item, i, arr) {
                if (item.name === `Collection:Building:${villageId}`){
                    item.data.cache.forEach(function (building, i, arr) {
                        //Конюшня
                        if(building.data.buildingType == "20"){
                            location.stable = building.data.locationId;
                        }
                        //Казарма
                        if(building.data.buildingType == "19"){
                            location.barack = building.data.locationId;
                        }
                    })
                }
            });

            console.log(location)

            let barackOptions = {
                method: 'POST',
                headers: {
                    'content-type' : 'application/json;charset=UTF-8'
                },
                json: true,
                body: {"controller":"building","action":"recruitUnits","params":{"villageId":villageId,"locationId":location.barack,"buildingType":19,"units":unitsBarack},"session":session},
                serverDomain: serverDomain
            };

            let stableOptions = {
                method: 'POST',
                headers: {
                    'content-type' : 'application/json;charset=UTF-8'
                },
                json: true,
                body: {"controller":"building","action":"recruitUnits","params":{"villageId":villageId,"locationId":location.stable,"buildingType":20,"units":unitsStable},"session":session},
                serverDomain: serverDomain
            };

            function build() {
                if (location.barack){
                    httpRequest(barackOptions)
                        .then(
                            (body) => {
                                console.log('barack')
                                // console.log(body)
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                }

                if (location.stable) {
                    httpRequest(stableOptions)
                        .then(
                            (body) => {

                                console.log('stable')
                                // console.log(body)
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                }
            }

            build();
            setInterval(build, rand);
        },
        (error) => {
            console.log(error);
        }
    );
}

/**
 * Асинх луп, служит для итераций после колбека. Важно для эмуляции действий пользователя - так как есть возможность добавить 400 деревней за 2 секунду, но это немного палевно
 * @param iterations
 * @param func
 * @param callback
 * @returns {{next: loop.next, iteration: loop.iteration, break: loop.break}}
 */
function asyncLoop(iterations, func, callback) {
    let index = 0;
    let done = false;
    let loop = {
        next: function() {
            if (done) {
                return;
            }

            if (index < iterations) {
                index++;
                func(loop);

            } else {
                done = true;
                callback();
            }
        },

        iteration: function() {
            return index - 1;
        },

        break: function() {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}

/**
 * Функция для добавление в фарм лист. Передаём массив ID с листами и список деревень
 * @param listMassive
 * @param villages
 */
function addToFarmList(listMassive, villages) {
    if (debug === 3){
        console.log(listMassive);
        console.log(villages);
    }

    let listIndex = 0;

    asyncLoop(
        villages.length,
        function (loop) {

            let i = loop.iteration();
            if (i % 100 == 0 && i != 0) {
                listIndex++
            }

            let villageId = villages[i].villageId;
            console.log(listIndex);
            console.log(listMassive[listIndex]);

            let bodyReq = {
                "action": "toggleEntry",
                "controller": "farmList",
                "params": {
                    "villageId": villageId,
                    "listId": listMassive[listIndex]
                },
                "session": token
            };

            let options = {
                method: 'POST',
                headers: {
                    'content-type' : 'application/x-www-form-urlencoded'
                },
                serverDomain: serverDomain,
                json: true,
                body: bodyReq
            };

            httpRequest(options)
                .then(
                    function (body) {
                        console.log(body);
                        let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);
                        setTimeout(function () {
                            console.log('Рандомное время ' + i + ': ' + rand);
                            loop.next();
                        }, rand);
                    },
                    function () {

                    }
                );
        },
        function () {
            console.log('cycle addToFarmList ended')
        }
    )

}


/**
 * Находит деревни согласно заданным условиям.
 * Есть настроенные фильтры -
 *      deathsFilter - является фильтром для мертвяков
 *      withoutKingdomsFilter - фильтр для игроков без королевства
 * @param xCor
 * @param yCor
 * @param filters - IFilters {
 *      players: IPlayers,
 *      villages: IVillages
 * }
 * IPlayers {
 *      active: number {"0", "1"}
 *      filterInformation: boolean
 *      hasNoobProtection:boolean
 *      isKing: boolean
 *      kingId: number
 *      kingdomId: number
 *      kingdomRole: number
 *      kingdomTag: string
 *      kingstatus: number
 *      level: number
 *      name: string
 *      nextLevelPrestige: number
 *      playerId: number
 *      population: number
 *      prestige: number
 *      stars:{bronze: 0, silver: 0, gold: 3}
 *      tribeId: number{ "1", 2", "3" }
 * }
 *
 * IVillages{
 *      allowTributeCollection:"1" //hz
 *      belongsToKing: number
 *      belongsToKingdom: number
 *      coordinates:{x: "-6", y: "-1"}
 *      isMainVillage:boolean
 *      isTown:boolean
 *      name: string
 *      playerId:number
 *      population:number
 *      protectionGranted:"0"//hz
 *      realTributePercent:0.2 //hz, % dani mb
 *      treasures:"0" //hz
 *      treasuresUsable:"0" // hz
 *      tribeId: number {"1", "2", "3"}
 *      tributeCollectorPlayerId: number
 *      type:"2" //hz
 *      villageId: number
 * }
 */

function searchEnemy(fn, xCor, yCor, filtersParam) {
    getPlayers(function (players) {

        let allPlayers = players;
        let sortedPlayers;
        let sortedVillages;

        //Условия
        for (let filter in filtersParam.players) {
            sortedPlayers = {
                cache: []
            };

            if (filtersParam.players[filter].different === 'equal') {
                allPlayers.cache.forEach(function (item, i, arr) {
                    if (item.data[filter] === filtersParam.players[filter].value) {
                        sortedPlayers.cache.push(item);
                    }
                });
            }

            else if (filtersParam.players[filter].different === 'less') {
                allPlayers.cache.forEach(function (item, i, arr) {
                    if (item.data[filter] < filtersParam.players[filter].value) {
                        sortedPlayers.cache.push(item);
                    }
                });
            }

            else if (filtersParam.players[filter].different === 'more') {
                allPlayers.cache.forEach(function (item, i, arr) {
                    if (item.data[filter] > filtersParam.players[filter].value) {
                        sortedPlayers.cache.push(item);
                    }
                });
            }

            allPlayers = Object.assign({},sortedPlayers);
        }

        sortedPlayers = allPlayers;

        if (debug === 2) {
            console.log("Подготовили список игроков подходящим условиям")
        }

        let hackPlayer = {
            cache: [
                {
                    data:{
                        villages: []
                    }
                }
            ]
        }

        //TODO: проверить мультифильтры
        for (let filter in filtersParam.villages) {

            sortedVillages = {
                cache: []
            };

            if (filtersParam.villages[filter].different === 'equal') {
                sortedPlayers.cache.forEach(function (item, i, arr) {
                    for (let j = 0; j < item.data.villages.length; j++) {
                        let obj = item.data.villages[j];
                        if (obj[filter] === filtersParam.villages[filter].value) {
                            sortedVillages.cache.push(obj);
                        }
                    }
                });
            }

            else if (filtersParam.villages[filter].different === 'less') {
                sortedPlayers.cache.forEach(function (item, i, arr) {
                    for (let j = 0; j < item.data.villages.length; j++) {
                        let obj = item.data.villages[j];
                        if (obj[filter] < filtersParam.villages[filter].value) {
                            sortedVillages.cache.push(obj);
                        }
                    }
                });
            }

            else if (filtersParam.villages[filter].different === 'more') {
                sortedPlayers.cache.forEach(function (item, i, arr) {
                    for (let j = 0; j < item.data.villages.length; j++) {
                        let obj = item.data.villages[j];
                        if (obj[filter] > filtersParam.villages[filter].value) {
                            sortedVillages.cache.push(obj);
                        }
                    }
                });
            }

            hackPlayer.cache[0].data.villages = sortedVillages;
            sortedPlayers = Object.assign({}, hackPlayer);
        }

        let villages = hackPlayer.cache[0].data.villages.cache;
        let sortedVillagesByCoor = _.sortBy(villages, function (villages) {
            console.log(villages)
            let len = Math.sqrt(Math.pow(villages.coordinates.x - xCor, 2) + Math.pow(villages.coordinates.y - yCor, 2));
            return len;
        });

        console.log(`Количество ${sortedVillagesByCoor.length}`);
        fn(sortedVillagesByCoor);

        //
        // asyncLoop(
        //     sortedAllSortedVillages.length,
        //     function (loop) {
        //
        //
        //         let i = loop.iteration();
        //
        //         let villageId = sortedAllSortedVillages[i].villageId;
        //         //console.log(listIndex);
        //
        //         //TODO: villageID это номер деревни из которой отправляют !
        //
        //         let requestPayload = {
        //             "controller":"troops",
        //             "action":"send",
        //             "params":{
        //                 "destVillageId":villageId,
        //                 "villageId":536723454,
        //                 "movementType":6,
        //                 "redeployHero":false,
        //                 "units":{
        //                     "1":0,
        //                     "2":0,
        //                     "3":0,
        //                     "4":1,
        //                     "5":0,
        //                     "6":0,
        //                     "7":0,
        //                     "8":0,
        //                     "9":0,
        //                     "10":0,
        //                     "11":0
        //                 },
        //                 "spyMission":"resources"
        //             },
        //             "session":token
        //         };
        //         // http://rux3.kingdoms.com/api/?c=troops&a=send&t1486071488668
        //
        //         let lastReportPayload = {
        //             "controller":"reports",
        //             "action":"getLastReports",
        //             "params":{
        //                 "collection":"search",
        //                 "start":0,
        //                 "count":10,
        //                 "filters":[
        //                     "15","16","17",
        //                     {"villageId":villageId}
        //                 ],
        //                 "alsoGetTotalNumber":true
        //             },
        //             "session":token
        //         };
        //
        //         request
        //             .post({
        //                 headers: {
        //                     'content-type' : 'application/x-www-form-urlencoded',
        //                     'Cookie' : 't5mu=YBnM550V5tEbE9UM; gl5SessionKey=%7B%22key%22%3A%221a936d1acfe5bac9f4a5%22%2C%22id%22%3A%22166540%22%7D; gl5PlayerId=166540; t5SessionKey=%7B%22key%22%3A%22e0a9610f253ef9814ada%22%2C%22id%22%3A%22124%22%7D; _ga=GA1.2.1502737351.1484125044; _gat=1; t5socket=%22client588d54d17b8f4%22; village=536723453; msid=ci7d1tr76t4br93dqodgu4c3h5',
        //                     'Host': serverDomain+'.kingdoms.com',
        //                     'Origin': 'http://'+serverDomain+'.kingdoms.com',
        //                     'Pragma':'no-cache',
        //                     'Referer': 'http://'+serverDomain+'.kingdoms.com',
        //                     'User-Agent':'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
        //                 },
        //                 url:     'http://'+serverDomain+'.kingdoms.com/api/?c=reports&a=getLastReports&'+timeForGame,
        //                 body:    JSON.stringify(lastReportPayload)
        //             }, function(error, response, body) {
        //                 body = JSON.parse(body);
        //                 //15 - чистый лог
        //                 //16 - с потерями
        //                 //17 - всё проёбано блеать :(
        //                 if (body.response && body.response.reports && body.response.reports.length > 0 && body.response.reports[0].notificationType === 15){
        //                     scanNow();
        //                     // console.log('body.response.reports > 0');
        //                     // console.log(body.response.reports[0]);
        //                 } else if (body.response && body.response.reports && body.response.reports.length === 0) {
        //                     // console.log('body.response.reports === 0')
        //                     scanNow();
        //                 } else {
        //                     // if (body.response && body.response.reports){
        //                     //     console.log(body.response.reports[0].notificationType);
        //                     // } else {
        //                     //     console.log(body.response)
        //                     // }
        //                     loop.next();
        //                 }
        //
        //             });
        //
        //         function scanNow(){
        //
        //             request
        //                 .post({
        //                     headers: {
        //                         'content-type' : 'application/x-www-form-urlencoded',
        //                         'Cookie' : 't5mu=YBnM550V5tEbE9UM; gl5SessionKey=%7B%22key%22%3A%221a936d1acfe5bac9f4a5%22%2C%22id%22%3A%22166540%22%7D; gl5PlayerId=166540; t5SessionKey=%7B%22key%22%3A%22e0a9610f253ef9814ada%22%2C%22id%22%3A%22124%22%7D; _ga=GA1.2.1502737351.1484125044; _gat=1; t5socket=%22client588d54d17b8f4%22; village=536723453; msid=ci7d1tr76t4br93dqodgu4c3h5',
        //                         'Host': serverDomain+'.kingdoms.com',
        //                         'Origin': 'http://'+serverDomain+'.kingdoms.com',
        //                         'Pragma':'no-cache',
        //                         'Referer': 'http://'+serverDomain+'.kingdoms.com',
        //                         'User-Agent':'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
        //                     },
        //                     url:     'http://'+serverDomain+'.kingdoms.com/api/?c=troops&a=send&'+timeForGame,
        //                     body:    JSON.stringify(requestPayload)
        //                 }, function(error, response, body) {
        //                     let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);
        //                     setTimeout(function(){
        //                         console.log('Рандомное время ' + i + ': ' + rand);
        //                         loop.next();
        //                     }, rand);
        //                     //console.log(body);
        //                 });
        //         }
        //     },
        //     function(){console.log('Search ended')}
        // );
        // return false;
    })
}

/**
 * Добавляет список по фильтрам.
 * @param name - имя листа
 * @param xCor
 * @param yCor
 * @param filter - фильтр, интерфейс к фильтрам находится над сёрч энеми
 */

function farmListCreator(name, xCor, yCor, filter) {
    searchEnemy(function (villages) {

        let listLength = Math.ceil(villages.length / 100);
        let listMassive = [];

        // Если нужен только первые 100 целей
        // listLength = 3;
        //TODO: улушчить эту часть
        asyncLoop(
            listLength,
            function (loop) {
                let i = loop.iteration();

                let listObj = {
                    "controller": "farmList",
                    "action": "createList",
                    "params": {"name": `${name} ${i}`},
                    "session": token
                };

                let options = {
                    method: 'POST',
                    headers: {
                        'content-type' : 'application/x-www-form-urlencoded'
                    },
                    serverDomain: serverDomain,
                    json: true,
                    body: listObj
                };

                httpRequest(options)
                .then(
                    function (body) {
                        if (body && body.response && body.response.errors){
                            console.log(body.response.errors);
                        }
                        //Добавляем полученный массив в лист массивов
                        listMassive.push(body.cache[0].data.cache[0].data.listId);

                        if (listMassive.length == listLength) {
                            addToFarmList(listMassive, villages);
                        }

                        loop.next();

                    },
                    function (error) {
                        console.log(error)
                    }
                );
            },
            function () {
                console.log('cycle farmListCreator ended')
            }
        );


        // let sortedAllGreyVillages
    }, xCor, yCor, filter);
}
// let troops = {
//     "controller": "troops",
//     "action": "send",
//     "params": {
//         "catapultTargets": [99],
//         "destVillageId": "537247789",
//         "villageId": 537346086,
//         "movementType": 3,
//         "redeployHero": false,
//         "units": {
//             "1": 340,
//             "2": 0,
//             "3": 0,
//             "4": 0,
//             "5": 0,
//             "6": 0,
//             "7": 0,
//             "8": 10,
//             "9": 0,
//             "10": 0,
//             "11": 0
//         },
//         "spyMission": "resources"
//     },
//     "session": token
// };

/**
 * Автобилд войнов
 */
// autoUnitsBuild('536035362', {2: 7}, {4: 8}, 3600, 1200, '7ff33d82f4a9a8dca460');

/**
 * Добавления юнитов по улсовиям
 */
// farmListCreator('withoutKing', '13', '-40', withoutKingdomsFilter);
// farmListCreator('f', '8', '-43', deathsFilter);

/**
 * Фармлисты
 */
autoFarmList(3600, 1200, listPayload.Wahlberg ,      'com3', false);
autoFarmList(3600, 1200, listPayload.cheetah,        'com3', false);
autoFarmList(3600, 1200, listPayload.Wahlberg2 ,     'com3', false);
autoFarmList(3600, 1200, listPayload.hedin ,         'com3', false);
autoFarmList(3600, 1200, listPayload.hedin2 ,        'com3', false);
autoFarmList(3600, 1200, listPayload.pushgun ,       'com3', true);
autoFarmList(3600, 1200, listPayload.Morpoh,         'com3', false);
autoFarmList(3600, 1200, listPayload.Morpoh2,        'com3', false);
autoFarmList(3600, 1200, listPayload.grando,         'com3', false);
autoFarmList(3600, 1200, listPayload.andrew,         'com3', false);
autoFarmList(3600, 1200, listPayload.rinko,          'com3', false);
autoFarmList(3600, 1200, listPayload.lolko,          'com3', false);
autoFarmList(3600, 1200, listPayload.engal,          'com3', false);

/**
 * Крокодилы
 */
//Переписать вызов
// let repeatFn = function(fn){
//  getMapInfo('animal', token, serverDomain, timeForGame);
//  setTimeout(repeatFn, 600000);
// };
//
// getMapInfo('animal', token, serverDomain, timeForGame);
// setTimeout(repeatFn, 600000);

/**
 * Кроп
 */
// getMapInfo('crop', token, serverDomain, timeForGame);



/* GET home page. */
router.get('/animal2/', function (req, res, next) {

    res.render('animal', {
        title: 'Animal finder',
        gameworld: apiData.gameworld,
        players: apiData.players,
        alliances: apiData.alliances,
        map: JSON.stringify(apiData.map)
    });

});

router.get('/animal/', function (req, res, next) {

    res.json(apiData.map);

});

/* GET home page. */
router.get('/crop/', function (req, res, next) {

    res.render('crop', {
        title: 'Crop finder',
        crop: JSON.stringify(apiData.crop)
    });

});

module.exports = router;
