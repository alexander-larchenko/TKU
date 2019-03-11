const express = require('express');
const router = express.Router();
const request = require('request');
const _ = require('underscore');
const rp = require('request-promise');
const colors = require('colors');
const fs = require('fs');

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
const Users = new (require('./users'))();
const UnitTypes = (require('./units')).UnitTypes;
const Unit = (require('./units')).Unit;
const UnitsBuildSetup = (require('./units')).UnitsBuildSetup;
const listPayload = new (require('./farmLists'))();


const debug = 3;
// debug - 1, идут только необходимые логи, которые показывают процессы запуска.
// debug - 2, идут логи из основных функций
// debug - 3, идут полные логи

const defaultUser = Users.Coss;
let serverDomain = defaultUser.serverDomain;

let apiData = {
    gameworld: null,
    players: null,
    alliances: null,
    map: null,
    fromGame: null,
    crop: null
};
let apiKey = {};

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
function setHttpHeaders(serverDomain, cookie, contentLength) {

    return {
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-length': contentLength,
        'content-type': 'application/json;charset=UTF-8',
        'cookie': cookie,
        'dnt': 1,
        'origin': 'https://' + serverDomain + '.kingdoms.com',
        'referer': 'https://' + serverDomain + '.kingdoms.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36'
    }
}

/**
 * http request для травиан кингдомса, возвращает колбек ответа
 * @param opt
 */
function httpRequest(opt) {
    let timeForGame = 't' + Date.now();


    //TODO: разобраться с тем нужно ли body или как
    let options = {
        headers: setHttpHeaders(opt.serverDomain, opt.cookie || defaultUser.cookie, JSON.stringify(opt.body).length),
        method: opt.method || 'GET',
        uri: `https://${opt.serverDomain}.kingdoms.com/api/?c=${opt.body.controller}&a=${opt.body.action}&${timeForGame}`,
        body: opt.body,
        json: true // Automatically stringifies the body to JSON
    };

    // console.log(options)

    //RP - request promise, return deffered object.
    return rp(options);
}

function checkOnStatus(farmListsResponse, listPayload, now, fn, serverDomain) {
    asyncLoop(
        farmListsResponse.cache.length,
        (loopList) => {
            let i = loopList.iteration();
            let FarmListEntry = farmListsResponse.cache[i].name.split(':')[2];
            // //console.log(`Подан фармлист с Айди ${FarmListEntry}`.info);

            // console.log(FarmListEntry)
            asyncLoop(
                farmListsResponse.cache[i].data.cache.length,
                (loop) => {

                    let j = loop.iteration();

                    let villageLog = farmListsResponse.cache[i].data.cache[j];

                    // console.log(`Чек этого  ${JSON.stringify(villageLog).green}`);


                    if (!villageLog || !villageLog.data || !villageLog.data.lastReport) {
                        //console.log(`Чек этого  ${JSON.stringify(villageLog.data).green}`);
                        loop.next();
                    } else if (villageLog.data.lastReport.notificationType == 1) {
                        // if (debug === 2 || debug === 3){
                        //     console.log('green log')
                        // }

                        //
                        //
                        // let villagesBody = {
                        //     "action":"get",
                        //     "controller":"cache",
                        //     "params":{
                        //         "names":[`Player:${villageLog.data.targetOwnerId}`],
                        //     },
                        //     "session":listPayload.session
                        // };
                        //
                        // let villagesOptions = {
                        //     method: 'POST',
                        //     json: true,
                        //     body: villagesBody,
                        //     serverDomain: serverDomain
                        // };
                        //
                        //
                        // httpRequest(villagesOptions)
                        // .then(
                        //     (body) => {
                        //         if (body && body.cache[0].data.active != 0){
                        //             let toggleBody = {
                        //                 "controller":"farmList",
                        //                 "action":"toggleEntry",
                        //                 "params":{
                        //                     "villageId":villageLog.data.villageId,
                        //                     "listId":   FarmListEntry
                        //                 },
                        //                 "session":listPayload.session
                        //             };
                        //
                        //             let options = {
                        //                 method: 'POST',
                        //                 headers: {
                        //                     'content-type' : 'application/x-www-form-urlencoded'
                        //                 },
                        //                 json: true,
                        //                 body: toggleBody,
                        //                 serverDomain: serverDomain
                        //             };
                        //
                        //             httpRequest(options)
                        //             .then(
                        //                 (body) => {
                        //                     console.log('Удаленая захваченная деревня.'.warn)
                        //                 },
                        //                 (error) => {
                        //                     console.log(error);
                        //                 }
                        //             )
                        //         }
                        //     },
                        //     (error) => {
                        //         console.log(error);
                        //     }
                        // )

                        let toggleBody = {
                            'controller': 'reports',
                            'action': 'getLastReports',
                            'params': {
                                'collection': 'search',
                                'start': 0,
                                'count': 10,
                                'filters': ['124', {'villageId': villageLog.data.villageId}],
                                'alsoGetTotalNumber': true
                            },
                            'session': listPayload.session
                        };

                        let options = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            json: true,
                            body: toggleBody,
                            serverDomain: serverDomain,
                        };

                        httpRequest(options)
                            .then(
                                (body) => {

                                    let capacity = 0, bounty = 0;

                                    if (body.errors) {
                                        console.log(body)
                                    }

                                    // console.log(body.response)
                                    if (body && body.response && body.response.reports) {

                                        body.response.reports.forEach((item, index, array) => {
                                            bounty += item.bounty;
                                            capacity += item.capacity;
                                        });

                                        let rel = bounty / capacity;

                                        if (rel >= 1) {

                                            for (let unitKey in villageLog.data.units) {
                                                let unit = villageLog.data.units[unitKey];
                                                if (unit == 0) {
                                                    //nothing?
                                                } else if (unit < 25) {
                                                    villageLog.data.units[unitKey] = parseInt(villageLog.data.units[unitKey]) + 1;
                                                } else {
                                                    //nothing?
                                                }
                                            }

                                            let unitBody = {
                                                'controller': 'farmList',
                                                'action': 'editTroops',
                                                'params': {
                                                    'entryIds': [parseInt(villageLog.data.entryId)],
                                                    'units': villageLog.data.units
                                                },
                                                'session': listPayload.session
                                            };

                                            let changeUnitOption = {
                                                method: 'POST',
                                                json: true,
                                                body: unitBody,
                                                serverDomain: serverDomain
                                            };


                                            httpRequest(changeUnitOption).then(
                                                resolve => {
                                                    // console.log('Кол-во войнов увеличено'.info);
                                                    loop.next();
                                                },
                                                reject => {
                                                    console.log(JSON.stringify(reject).warn);
                                                    loop.next();
                                                }
                                            )
                                        } else if (rel < 0.5) {

                                            for (let unitKey in villageLog.data.units) {
                                                let unit = villageLog.data.units[unitKey];
                                                if (unit > 1) {
                                                    villageLog.data.units[unitKey]--;
                                                }
                                            }

                                            let unitBody = {
                                                'controller': 'farmList',
                                                'action': 'editTroops',
                                                'params': {
                                                    'entryIds': [parseInt(villageLog.data.entryId)],
                                                    'units': villageLog.data.units
                                                },
                                                'session': listPayload.session
                                            };

                                            let changeUnitOption = {
                                                method: 'POST',
                                                json: true,
                                                body: unitBody,
                                                serverDomain: serverDomain
                                            };

                                            httpRequest(changeUnitOption).then(
                                                resolve => {
                                                    // console.log('Кол-во войнов уменьшено'.info);
                                                    loop.next();
                                                },
                                                reject => {
                                                    console.log(JSON.stringify(reject).warn);
                                                    loop.next();
                                                }
                                            )
                                            //    Добавить уменьшение войнов
                                        } else {
                                            //nothing now
                                            loop.next();
                                        }
                                    } else {
                                        loop.next();
                                    }

                                },
                                (error) => {
                                    //console.log(error);
                                }
                            )

                    } else if (villageLog.data.lastReport.notificationType == 2) {
                        if (debug === 2 || debug === 3) {
                            //console.log('yellow log')
                        }
                        let toggleBody = {
                            'controller': 'farmList',
                            'action': 'toggleEntry',
                            'params': {
                                'villageId': villageLog.data.villageId,
                                'listId': FarmListEntry
                            },
                            'session': listPayload.session
                        };

                        let options = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded'
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
                                    if (debug === 3) {
                                        console.log(body);
                                    }
                                    console.log('Жёлтый лог обработан.'.silly)
                                    loop.next();
                                },
                                (error) => {
                                    console.log(error);
                                }
                            )
                    } else if (villageLog.data.lastReport.notificationType == 3) {
                        if (debug === 2 || debug === 3) {
                        }
                        console.log('red log'.debug)
                        //TODO: вынести в отдельную функцию
                        let toggleBody = {
                            'controller': 'farmList',
                            'action': 'toggleEntry',
                            'params': {
                                'villageId': villageLog.data.villageId,
                                'listId': FarmListEntry
                            },
                            'session': listPayload.session
                        };

                        let options = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded'
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
                                    if (debug === 3) {
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
                () => {
                    loopList.next();
                }
            );

        },
        () => {
            let now = new Date();
            console.log('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session + '] запуск: [' + now.toString() + ']');
            fn(listPayload);
        }
    )
}

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
        'action': 'get',
        'controller': 'cache',
        'params': {
            'names': [
                'Kingdom:undefined',
                'Collection:FarmList:'
            ]
        },
        'session': listPayload.session
    };

    //for (let i = 0; i < listPayload.params.listIds.length; i++) {
    //  let obj = "Collection:FarmListEntry:" + listPayload.params.listIds[i];
    //  lastDataFromList.params.names.push(obj);
    //}
    let percentLose = 0.75;

    let startFarmListRaid = (listPayload) => {
        //console.log(listPayload);

        let options = {
            serverDomain: serverDomain,
            body: listPayload
        };

        httpRequest(options).then(
            (body) => {
                console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session + '] отправлен');
                // console.log(body);
            },
            (err) => {
                //console.error('Произошла ошибка');
                //console.log(err);
                //console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] отправлен');

            }
        );

    };

    let checkList = (listPayload) => {
        // console.log('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] проверка');

        function start() {


            let now = new Date();
            let rand = fixedTimeGenerator(fixedTime) + randomTimeGenerator(randomTime);

            //console.log(now+rand);

            let tempTime = now.valueOf() + rand;
            let dateNext = new Date(tempTime);
            //запуск сразу
            if (init) {

                if (debug === 2 || debug === 3) {
                    //console.log(listPayload)
                }

                let checkBodyObj = {
                    'controller': 'cache',
                    'action': 'get',
                    'params': {
                        names: []
                    },
                    'session': listPayload.session
                };


                console.log(listPayload.params.listIds)
                for (let i = 0; i < listPayload.params.listIds.length; i++) {
                    let list = listPayload.params.listIds[i];
                    checkBodyObj.params.names.push('Collection:FarmListEntry:' + list);
                }
                ;

                let options = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    json: true,
                    body: checkBodyObj,
                    serverDomain: serverDomain
                };

                //console.log('Сформировали массив фарм листов');

                httpRequest(options)
                    .then(
                        (body) => {
                            console.log(listPayload);
                            if (!body.cache) {
                                console.log(body);
                            } else {
                                //TODO: add callback on checkOnStatus
                                // callback(body);
                                checkOnStatus(body, listPayload, now, startFarmListRaid.bind(null, listPayload), serverDomain);

                                setTimeout(() => {

                                    console.log(rand);

                                    start();

                                }, rand);

                            }

                        },
                        (error) => {
                            console.log(error);
                        }
                    )
            }

            console.log('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session + '] следующий запуск: [' + dateNext.toString() + ']');
            init = true;


        };

        // let options = {
        //   serverDomain: serverDomain,
        //   body: lastDataFromList
        // };
        //
        start();

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
        uri: `https://${serverDomain}.kingdoms.com/api/external.php?action=requestApiKey&email=icecoss@gmail.com&siteName=theicecoss&siteUrl=https://theicecoss.com&public=true`,
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
        (token) => {
            let options = {
                method: 'GET',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                uri: `https://${serverDomain}.kingdoms.com/api/external.php?action=getMapData&privateApiKey=${token.response.privateApiKey}`,
                json: true // Automatically stringifies the body to JSON
            };

            //TODO: ТУТ ОСТАНОВИЛСЯ

            rp(options)
                .then(
                    (body) => {


                        const file = `./json/getMap/data${+Date.now()}.json`;

                        fs.writeFile(file, `${JSON.stringify(body)}`, function (err) {
                            if (err) {
                                return console.log(err);
                            }
                        });

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
    getMap((body) => {
        // console.log(body);

        let players = _.pluck(body.response.players, 'playerId');

        let divineI = 1000;
        let playersRequestLength = parseInt(players.length / divineI);
        let payloadArray = [];
        // console.log(players.length);

        for (let i = 0; i <= playersRequestLength; i++) {

            let playersBody = [];

            for (let j = 0; j < divineI; j++) {
                playersBody[j] = 'Player:' + players[i * divineI + j];
            }

            let payload = {
                controller: 'cache',
                action: 'get',
                params: {names: playersBody},
                session: defaultUser.session
            };

            let options = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4'
                },
                json: true,
                body: payload,
                serverDomain: serverDomain
            };


            payloadArray.push(options);
        }
        console.log('Сформировали массив игроков');

        let bodyAll = [];

        asyncLoop(
            payloadArray.length,
            (loop) => {
                let i = loop.iteration();
                httpRequest(payloadArray[i]).then(
                    (body) => {
                        console.log(body);
                        bodyAll.push(body);
                        loop.next();
                    },
                    (error) => {
                        console.log(error);
                        loop.next();
                    }
                )
            },
            () => {
                let unionCache = {
                    cache: []
                };

                console.log(bodyAll)

                for (let i = 0; i < bodyAll.length; i++) {
                    unionCache.cache = [...unionCache.cache, ...bodyAll[i].cache];
                }


                callback(unionCache);
            }
        );

    })
}

/**
 * Получаем карту по условиям.
 * Скрипт требует переработки, ибо код гавно, которому 1.5 года
 */
function getMapInfo(type, token, serverDomain) {
    type = type || 'animal';
    let timeForGame = 't' + Date.now();
    request
        .get({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: 'https://' + serverDomain + '.kingdoms.com/api/external.php?action=requestApiKey&email=icecoss@gmail.com&siteName=theicecoss&siteUrl=https://theicecoss.com&public=true'
        }, (error, response, body) => {

            apiKey = JSON.parse(body);
            //console.log('Получили токен');
            //console.log(apiKey);

            request
                .get({
                    headers: {'content-type': 'application/x-www-form-urlencoded'},
                    url: 'https://' + serverDomain + '.kingdoms.com/api/external.php?action=getMapData&privateApiKey=' + apiKey.response.privateApiKey
                }, (error, response, body) => {
                    //TODO: холишит блять
                    //Переделай, стыдно же людям такое показывать.
                    //console.log('получили данные с опенапи')
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
                        //console.log('Сформировали массив');

                        let session = {
                            'controller': 'cache',
                            'action': 'get',
                            'params': {'names': oasisArr},
                            'session': token
                        };

                        request
                            .post({
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                url: 'https://' + serverDomain + '.kingdoms.com/api/?c=cache&a=get&' + timeForGame,
                                body: JSON.stringify(session)
                            }, (error, response, body) => {
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
                                            if (avgAllDpsInfantry / troopsCounter < 100 || avgAllDpsMounted / troopsCounter < 100) {
                                                break;
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

                                var AnimalsById = {
                                    1: 'Rat',
                                    2: 'Spider',
                                    3: 'Snake',
                                    4: 'Bat',
                                    5: 'Boar',
                                    6: 'Wolf',
                                    7: 'Bear',
                                    8: 'Crocs',
                                    9: 'Tiger',
                                    10: 'Eleph'
                                };

                                console.log((new Date()).toLocaleString(), ' Animal Data Updated');
                                apiData.map = map;
                                if (map.length > 0 && (+map[0].avgAllDpsInfantry > 150 || +map[0].avgAllDpsMounted > 150)) {
                                    console.log('\x1b[31m%s\x1b[0m', `We Have 150+ Animals`);
                                    var stillHave = true;
                                    var index = 0;
                                    while (stillHave) {
                                        var item = map[index];
                                        var log = `[${item.avgAllDpsInfantry}|${item.avgAllDpsMounted}](${item.counterAnimalType}) on  (${item.x}|${item.y}) `;
                                        Object.keys(item.animal).forEach((key) => {
                                            let name = AnimalsById[+key];
                                            log += `{${name}: ${item.animal[key]}} `;
                                        });
                                        console.log(log);
                                        if (index == map.length - 1 || +map[index + 1].avgAllDpsInfantry < 150 && +map[index + 1].avgAllDpsInfantry < 150) {
                                            stillHave = false;
                                        } else {
                                            index++;
                                        }
                                    }
                                }
                                //console.log(apiData.map);
                                //console.log(jsonBody.cache);
                                //console.log(toJson.response.map.cells);

                            });
                    }

                    function crop(map) {

                        let cropArray = [];

                        // console.log(map);

                        // console.log(map.length);

                        // obj.path = Math.sqrt(Math.pow((obj.x-custom.x),2) + Math.pow((obj.y-custom.y), 2));
                        // obj.path = obj.path.toFixed(3);
                        // if(obj.path.length==5){obj.path='0'+obj.path}
                        // cropArray.push(obj);

                        asyncLoop(
                            map.length,
                            (loop) => {

                                let i = loop.iteration();

                                let obj = map[i];

                                if (obj.resType == '3339' && obj.oasis == 0 && obj.kingdomId == 0) {

                                    //9ka добавлена
                                    console.log('9ka')

                                    //TODO: owner ID make is variable
                                    let listObj = {
                                        'controller': 'map',
                                        'action': 'editMapMarkers',
                                        'params': {
                                            'markers': [
                                                {
                                                    'owner': 1,
                                                    'type': 3,
                                                    'color': 3,
                                                    'editType': 3,
                                                    'ownerId': 1880,
                                                    'targetId': obj.id
                                                }
                                            ],
                                            'fieldMessage': {
                                                'text': '',
                                                'type': 5,
                                                'duration': 12,
                                                'cellId': obj.id,
                                                'targetId': 1880
                                            }
                                        },
                                        'session': token
                                    };

                                    let options = {
                                        method: 'POST',
                                        headers: {
                                            'content-type': 'application/json;charset=UTF-8'
                                        },
                                        serverDomain: serverDomain,
                                        json: true,
                                        body: listObj
                                    };

                                    httpRequest(options)
                                        .then(
                                            (body) => {
                                                console.log(body)
                                                setTimeout(loop.next, 10);
                                            },
                                            (error) => {
                                                console.log(error)
                                            }
                                        );

                                } else if (obj.resType == '11115' && obj.oasis == 0 && obj.kingdomId == 0) {

                                    console.log('15ka')

                                    //15ka добавлена
                                    let listObj = {
                                        'controller': 'map',
                                        'action': 'editMapMarkers',
                                        'params': {
                                            'markers': [
                                                {
                                                    'owner': 1,
                                                    'type': 3,
                                                    'color': 10,
                                                    'editType': 3,
                                                    'ownerId': 1880,
                                                    'targetId': obj.id
                                                }
                                            ],
                                            'fieldMessage': {
                                                'text': '',
                                                'type': 5,
                                                'duration': 12,
                                                'cellId': obj.id,
                                                'targetId': 1880
                                            }
                                        },
                                        'session': token
                                    };

                                    let options = {
                                        method: 'POST',
                                        headers: {
                                            'content-type': 'application/json;charset=UTF-8'
                                        },
                                        serverDomain: serverDomain,
                                        json: true,
                                        body: listObj
                                    };

                                    httpRequest(options)
                                        .then(
                                            (body) => {
                                                console.log(body);
                                                setTimeout(loop.next, 10);
                                            },
                                            (error) => {
                                                console.log(error)
                                            }
                                        );

                                } else {
                                    loop.next();
                                }

                            },
                            () => {
                                console.log('Добавление точек заверешено :)')
                            }
                        );


                    }

                    switch (type) {
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

function autoUnitsBuild(villageId, UnitsSetup, fixedTime, randomTime, session) {
    let rand = fixedTimeGenerator(fixedTime) + randomTimeGenerator(randomTime);
    let stillHaveResources = true;
    let buildUntilNoResourcesLeft = process.env.npm_config_ner !== undefined;
    const withCropControl = process.env.npm_config_withcrop !== undefined;

    if (buildUntilNoResourcesLeft) {
        console.log('Building until no resources left');
    }

    if (withCropControl) {
        console.log('With Crop Control');
    }

    const Buildings = {
        Barracks: {
            name: 'Barracks',
            typeId: 19
        },
        Stables: {
            name: 'Stables',
            typeId: 20
        },
        Workshop: {
            name: 'Workshop',
            typeId: 21
        },
        GreatBarracks: {
            name: 'GreatBarracks',
            typeId: 29
        },
        GreatStables: {
            name: 'GreatStables',
            typeId: 30
        }
    };

    let getAllOptions = {
        method: 'POST',
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        },
        json: true,
        body: {
            'controller': 'player',
            'action': 'getAll',
            'params': {deviceDimension: '1920:1080'},
            'session': session
        },
        serverDomain: serverDomain
    };

    function updateBuildingLocations(body) {

        body.cache.forEach((item, i, arr) => {
            if (item.name === `Collection:Building:${villageId}`) {
                item.data.cache.forEach((building) => {
                    //Конюшня
                    if (building.data.buildingType == Buildings.Stables.typeId.toString()) {
                        Buildings.Stables.location = building.data.locationId;
                    }
                    //Казарма
                    if (building.data.buildingType == Buildings.Barracks.typeId.toString()) {
                        Buildings.Barracks.location = building.data.locationId;
                    }
                    //Мастерская
                    if (building.data.buildingType == Buildings.Workshop.typeId.toString()) {
                        Buildings.Workshop.location = building.data.locationId;
                    }
                    //Большая Казарма
                    if (building.data.buildingType == Buildings.GreatBarracks.typeId.toString()) {
                        Buildings.GreatBarracks.location = building.data.locationId;
                    }
                    //Большая Конюшня
                    if (building.data.buildingType == Buildings.GreatStables.typeId.toString()) {
                        Buildings.GreatStables.location = building.data.locationId;
                    }
                })
            }
        });

        console.log('Buildings placed: ', JSON.stringify(Buildings));
    }

    function getRecruitUnitsRequest(buildingName, units) {
        var locationId = Buildings[buildingName].location;
        var buildingType = Buildings[buildingName].typeId;

        return {
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            json: true,
            body: {
                'controller': 'building',
                'action': 'recruitUnits',
                'params': {
                    'villageId': villageId,
                    'locationId': locationId,
                    'buildingType': buildingType,
                    'units': units
                },
                'session': session
            },
            serverDomain: serverDomain
        }
    }

    function buildUnits(buildingName, units) {

        if (Buildings[buildingName].location) {

            httpRequest(getRecruitUnitsRequest(buildingName, units))
                .then(
                    (body) => {

                        let log = `${(new Date()).toLocaleString()} ${Users.getUserNameBySession(session)} ${buildingName}: ${printUnits(units)} `;

                        if (body.response && body.response.errors) {
                            if (body.response.errors instanceof Array &&
                                body.response.errors.some((error) => error.message === 'NotEnoughRes')) {

                                stillHaveResources = false;

                                let newAmount =
                                    units[Object.getOwnPropertyNames(units)[0]] - (1 + Math.round(Math.random() * 5));

                                if (newAmount > 0) {
                                    let newUnits = {};
                                    newUnits[Object.getOwnPropertyNames(units)[0]] = newAmount;
                                    let timeout = 9000 + Math.round(Math.random() * 5000);
                                    log += `NER: Building ${printUnits(newUnits)} in ${printTime(timeout / 1000)} ...`;
                                    setTimeout(() => {
                                        buildUnits(buildingName, newUnits);
                                    }, timeout);
                                } else {
                                    log += 'No Resources Left';
                                }
                            } else {
                                log += JSON.stringify(body);
                            }
                        }
                        console.log(log);
                        // console.log(body)
                    },
                    (error) => {
                        console.log(error);
                    }
                );
        }
    }

    httpRequest(getAllOptions)
        .then(
            (body) => {

                updateBuildingLocations(body);

                function build() {
                    Object.keys(UnitsSetup).forEach(buildingName => {
                        setTimeout(() => {
                            buildUnits(buildingName, UnitsSetup[buildingName]);
                        }, Math.random() * 10000);
                    });
                    if (buildUntilNoResourcesLeft) {
                        setTimeout(function () {
                            console.log('stillHaveResources', stillHaveResources);
                            if (stillHaveResources) {
                                console.log('Calling Repeat because still have resources');
                                build();
                            } else {
                                console.log('buildUntilNoResourcesLeft enabled and no resources left');
                            }
                        }, 15000);
                    }
                }

                var unitsInfoString = '';
                Object.keys(UnitsSetup).forEach(buildingName => {
                    unitsInfoString += ` \r\n${buildingName}: ${printUnits(UnitsSetup[buildingName])}`
                });
                console.log(`${Users.getUserNameBySession(session)} Starting to build ${unitsInfoString} \r\nRepeat build each ${printTime(rand / 1000)}\r\n====================>>>>>>>`);

                if (process.env.npm_config_initial !== undefined) {
                    console.log('Initial Build Requested');
                    build();
                }

                setInterval(function () {
                    stillHaveResources = true;
                    if (withCropControl) {
                        cropControl(session, villageId);
                    }
                    build();
                }, rand);
            },
            (error) => {
                console.log(error);
            }
        );
}

function printUnits(unitsData) {
    var properties = Object.getOwnPropertyNames(unitsData);
    if (properties.length > 0) {
        var key = Object.getOwnPropertyNames(unitsData)[0];
        var unitNaming = UnitTypes[key];
        var unitCount = unitsData[key];
        return '[' + unitNaming + ': ' + unitCount + ']';
    }
    return '';
}

function printTime(timeInSeconds) {
    var formattedTime = '';
    var hours = Math.floor(timeInSeconds / 3600);
    if (hours > 0) {
        formattedTime = hours.toString() + 'h ';
    }
    var timeLeft = timeInSeconds - hours * 3600;
    if (timeLeft <= 0) return formattedTime;
    var minutes = Math.floor(timeLeft / 60);
    formattedTime = formattedTime + minutes.toString() + 'm ';
    timeLeft = timeLeft - minutes * 60;
    if (timeLeft <= 0) return formattedTime;
    formattedTime = formattedTime + Math.round(timeLeft).toString() + 's';
    return formattedTime;
}

/**
 * Метод для периодического переключения добычи ресурсов
 */
var ResourceGatheringType = {
    0: 'All',
    1: 'Wood',
    2: 'Clay',
    3: 'Metall',
    4: 'Crop'
};
var resourceIteration = 3600;

function initResourcesGatheringStrategy(session, rate, strategy) {

    function getResourceTypeRequest(resourceType) {
        return {
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            json: true,
            body: {
                'controller': 'hero',
                'action': 'addAttributePoints',
                'params': {
                    'attBonusPoints': 0,
                    'defBonusPoints': 0,
                    'fightStrengthPoints': 0,
                    'resBonusPoints': 0,
                    'resBonusType': resourceType
                },
                'session': session
            },
            serverDomain: serverDomain
        }
    }

    //rate = 1440;
    //strategy = [1, 0.76, 0.35, 0];

    var totalInterval = 0;
    strategy.forEach((time) => totalInterval += time);
    if (totalInterval === 0) return;
    var strategyIncome = [];
    strategy.forEach((time) => strategyIncome.push(Math.round(time * rate / totalInterval)));
    var incomeMessage = `${Users.getUserNameBySession(session)} Hero income/h: `;
    strategyIncome.forEach((income, index) => {
        incomeMessage += `${ResourceGatheringType[index + 1]}:${income} `
    });
    console.log(incomeMessage);
    var singleIterationTime = resourceIteration * 1000;
    var totalCycleTime = totalInterval * singleIterationTime;

    function sendRequest(type, timeActive) {
        httpRequest(getResourceTypeRequest(type))
            .then(
                (body) => {
                    console.log(`${new Date().toLocaleString()} ${Users.getUserNameBySession(session)} Resouce gathering set to: ${ResourceGatheringType[type]} for the next ${printTime(timeActive / 1000)}`);
                },
                (error) => {
                    console.log(error);
                }
            )
    }

    function overAllAction() {
        var index = 0;

        function iteration() {
            if (index > 3) return;
            var timeActive = Math.round(strategy[index] * singleIterationTime);
            if (timeActive > 0) {
                sendRequest(index + 1, timeActive);
                var timeout = setTimeout(() => {
                    if (index === 3) {
                        clearTimeout(timeout);
                    } else {
                        ++index;
                        iteration();
                    }
                }, timeActive);
            } else {
                ++index;
                iteration();
            }
        };
        iteration();
    }

    overAllAction();
    setInterval(overAllAction, totalCycleTime);
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
        next: () => {
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

        iteration: () => {
            return index - 1;
        },

        break: () => {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}

function cropControl(session, villageId, callback) {

    let getAllOptions = {
        method: 'POST',
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        },
        json: true,
        body: {
            'controller': 'player',
            'action': 'getAll',
            'params': {deviceDimension: '1920:1080'},
            'session': session
        },
        serverDomain: serverDomain
    };

    const StorageKeys = {
        Wood: 1,
        Clay: 2,
        Metal: 3,
        Crop: 4
    };

    function checkResources(body) {
        body.cache.forEach((item) => {
            if (item.name === `Collection:Village:own`) {
                item.data.cache.forEach((village) => {
                    if (village.name === `Village:${villageId}`) {
                        //CossMainVillage
                        console.log('found main village', JSON.stringify(village));
                        const villageData = village.data;

                        const currentCropAmount = villageData.storage[StorageKeys.Crop];
                        const cropCapacity = +villageData.storageCapacity[StorageKeys.Crop];

                        console.log(`Wood ${villageData.storage[StorageKeys.Wood]}/${villageData.storageCapacity[StorageKeys.Wood]}`);
                        console.log(`Clay ${villageData.storage[StorageKeys.Clay]}/${villageData.storageCapacity[StorageKeys.Clay]}`);
                        console.log(`Metal ${villageData.storage[StorageKeys.Metal]}/${villageData.storageCapacity[StorageKeys.Metal]}`);
                        console.log(`Crop ${currentCropAmount}/${cropCapacity}`);

                        const otherResourcesFreeStorage =
                            +villageData.storageCapacity[StorageKeys.Wood] - villageData.storage[StorageKeys.Wood] +
                            +villageData.storageCapacity[StorageKeys.Clay] - villageData.storage[StorageKeys.Clay] +
                            +villageData.storageCapacity[StorageKeys.Metal] - villageData.storage[StorageKeys.Metal];

                        if (cropCapacity - currentCropAmount <= 50000 &&
                            currentCropAmount <= otherResourcesFreeStorage) {
                            //Make NPC Trade call;
                            const totalResources = villageData.storage[StorageKeys.Crop] +
                                villageData.storage[StorageKeys.Wood] +
                                villageData.storage[StorageKeys.Clay] +
                                villageData.storage[StorageKeys.Metal];

                            const hourlyCropProduction = +villageData.production[StorageKeys.Crop];
                            let neededCrop = hourlyCropProduction < 0 ? Math.abs(hourlyCropProduction) : 0;
                            console.log(`NPC will save ${neededCrop} crop`);

                            NPCExchange(totalResources, neededCrop);
                        }
                    }
                })
            }
        });

    }

    console.log('calling getAll for crop check');
    httpRequest(getAllOptions)
        .then(
            (body) => {

                checkResources(body);

            },
            (error) => {
                console.log(error);
            }
        );

    function NPCExchange(totalResources, crop) {
        const eachRes = Math.round((totalResources - crop) / 3);

        const NPCOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            json: true,
            body: {
                'controller': 'premiumFeature',
                'action': 'bookFeature',
                'params': {
                    'featureName': 'NPCTrader',
                    'params': {
                        'villageId': villageId,
                        'distributeRes': {'1': eachRes, '2': eachRes, '3': eachRes, '4': crop}
                    }
                },
                'session': session
            },
            serverDomain: serverDomain
        };

        httpRequest(NPCOptions).then(
            () => {
                console.log('NPC exchange passed successfully');
                if (typeof callback === 'function') {
                    callback();
                }
            }, (error) => {
                console.log(error)
            }
        )
    }
}

// run tasks by executing
// @example: npm start --animals
const Tasks = {
    heroChecker: process.env.npm_config_check !== undefined,
    build: process.env.npm_config_build !== undefined,
    animals: process.env.npm_config_animals !== undefined,
    farm: process.env.npm_config_farm !== undefined,
    cropControl: process.env.npm_config_cropc !== undefined,
    heroResources: process.env.npm_config_herores !== undefined,
    cropMap9_15: process.env.npm_config_cropmap !== undefined,
};

const BuildForVillage = {
    Coss_Main: process.env.npm_config_build == 'Coss_Main',
};

if (Tasks.heroChecker) {
    heroChecker([535838712], 100, Users.DOGMA.session, Users.DOGMA.village1);
}

if (Tasks.build) {
    var buildInterval = 1800;
    resourceIteration = 600;

    if (BuildForVillage.Coss_Main) {
        var unitsCossMain = new UnitsBuildSetup();
        unitsCossMain.Barracks[Unit.Rome.Imperian] = 25; //22
        unitsCossMain.Stables[Unit.Rome.Ceserian] = 23; //cesar: 19
        unitsCossMain.Workshop[Unit.Rome.Catapult] = 6; //5
        unitsCossMain.GreatBarracks[Unit.Rome.Imperian] = 25; //22
        unitsCossMain.GreatStables[Unit.Rome.Ceserian] = 5; //cesar: 19

        autoUnitsBuild(Users.Coss.village, unitsCossMain, buildInterval, 10, Users.Coss.session);

        // initResourcesGatheringStrategy(Users.Coss.session, 5000, [1, 2, 2, 0]);
    }
}

if (Tasks.heroResources) {
    initResourcesGatheringStrategy(Users.Coss.session, 1440, [1, 1, 1, 0]);
}

if (Tasks.cropControl) {
    cropControl(Users.Coss.session, Users.Coss.village);
}

/**
 * Крокодилы
 */
if (Tasks.animals) {
    setInterval(function () {
        getMapInfo('animal', defaultUser.session, serverDomain);
    }, 635000);
    getMapInfo('animal', defaultUser.session, serverDomain);
}

/** Пометить Девятки Пятнашки */
if (Tasks.cropMap9_15) {
    getMapInfo('crop', defaultUser.session, serverDomain);
}

/**
 * Фармлисты
 */
if (Tasks.farm) {
    const startFarmOnRun = true; /*process.env.npm_config_init !== undefined*/

    if (process.env.npm_config_farm === '0') {
        // All Fast
        autoFarmList(2800, 10, listPayload.Coss_0, 'ru1x3', startFarmOnRun);
    }
    if (process.env.npm_config_farm === '1') {
        // Kiril
        // autoFarmList(2800, 50, listPayload.Coss_Kiril1, 'ru1x3', startFarmOnRun);
        autoFarmList(3800, 50, listPayload.Coss_Kiril2, 'ru1x3', startFarmOnRun);
    }
    if (process.env.npm_config_farm === '2') {
        // Alice
        // autoFarmList(2800, 50, listPayload.Coss_Alice1, 'ru1x3', startFarmOnRun);
        autoFarmList(3800, 50, listPayload.Coss_Alice2, 'ru1x3', startFarmOnRun);
    }
    if (process.env.npm_config_farm === '3') {
        // Petka
        // autoFarmList(2800, 50, listPayload.Coss_Petka1, 'ru1x3', startFarmOnRun);
        autoFarmList(3800, 50, listPayload.Coss_Petka2, 'ru1x3', startFarmOnRun);
    }

}

module.exports = router;
