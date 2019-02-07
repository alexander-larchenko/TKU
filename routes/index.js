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
const userDate = require('./../config-coss.json');
const usersConstructor = require('./users');
const Users = new usersConstructor();
// use main user session token from Users object.
userDate.token = Users.Coss.session;

const debug = 3;
// debug - 1, идут только необходимые логи, которые показывают процессы запуска.
// debug - 2, идут логи из основных функций
// debug - 3, идут полные логи

let listPayload = {
    malaoban1: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6935, 6936, 6937], 'villageId': 537772036},
        'session': '63064b0c82f60aec5944',
        'server': 'com2'
    },//exploit
    malaoban2: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6935, 6936, 6937], 'villageId': 537739268},
        'session': '63064b0c82f60aec5944',
        'server': 'com2'
    },//script
    malaoban3: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6935, 6936, 6937], 'villageId': 537772036},
        'session': '63064b0c82f60aec5944',
        'server': 'com2'
    },//exploit
    malaoban4: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6935, 6936, 6937], 'villageId': 537739268},
        'session': '63064b0c82f60aec5944',
        'server': 'com2'
    },//script
    malaoban6: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6935, 6936, 6937], 'villageId': 537640972},
        'session': '63064b0c82f60aec5944',
        'server': 'com2'
    },//Trader 322
    malaoban7: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6935, 6936, 6937], 'villageId': 538198021},
        'session': '63064b0c82f60aec5944',
        'server': 'com2'
    },//script
    krolik: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6873, 6874, 6875, 6872], 'villageId': 536461368},
        'session': '63064b0c82f60aec5944',
        'server': 'com2x3'
    },//Trader 322

    wahlbergExp: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 537182225},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergScript: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 537051161},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergKop1: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 537051157},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergKop2: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 537018392},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergKop3: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 537018391},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergKop4: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 536461364},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergKop5: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 537018389},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergFig: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 537509919},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322
    wahlbergTulpia: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [8130, 8131, 8132], 'villageId': 536985598},
        'session': '6276e5022b13c3c156f7',
        'server': 'com2x3'
    },//Trader 322

    hysteria: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [5118, 5119, 5120, 5121], 'villageId': 535871492},
        'session': 'caca5e322aa15dad2024',
        'server': 'com2x3'
    },//Trader 322
    hysteria2: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6794, 6795, 6796, 6797], 'villageId': 537346070},
        'session': '6a67b0005c5f1babf15d',
        'server': 'com2x3'
    },//Trader 322

    ann: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2230, 2231], 'villageId': 536133651},
        'session': '95585089f22230adc82c',
        'server': 'ru1'
    },//
    ann2: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2230, 2231], 'villageId': 536068116},
        'session': '95585089f22230adc82c',
        'server': 'ru1'
    },//
    lolko: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [5839, 5840], 'villageId': 537215005},
        'session': '5a558ceb985f0e5bf984',
        'server': 'com2x3'
    },//
    julia: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6814, 6815, 6816, 6817], 'villageId': 537083930},
        'session': '092cb5dbcd80594e6ef1',
        'server': 'com2x3'
    },//
    julia2: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6814, 6815, 6816, 6817], 'villageId': 537149462},
        'session': '092cb5dbcd80594e6ef1',
        'server': 'com2x3'
    },//
    julia3: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6814, 6815, 6816, 6817], 'villageId': 537051159},
        'session': '092cb5dbcd80594e6ef1',
        'server': 'com2x3'
    },//

    serega: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [6803, 6769], 'villageId': 536985655},
        'session': '6e0a43e71c0a292e53e4',
        'server': 'com2x3'
    },//
    serega2: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [7160, 7195, 7666], 'villageId': 536657981},
        'session': '6e0a43e71c0a292e53e4',
        'server': 'com2x3'
    },//

    alex322: {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [1775, 1776], 'villageId': 536100855},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    },//Alex322
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
// node ./bin/wwwY
//different = {less, equal, more}
//value = value
//TODO: вынести фильтры
/**
 * Примеры фильров
 * @type {{players: {active: {different: string, value: string}}, villages: {population: {different: string, value: string}}}}
 */
let deathsFilterFrom60To150 = {
    players: {
        hasNoobProtection: {
            different: 'equal',
            value: false,
        },
        kingdomId: {
            different: 'equal',
            value: '0'
        },
        active: {
            different: 'equal',
            value: '0'
        },
        population: {
            different: 'between',
            valueTop: '149',
            valueBottom: '40',
        }
    },
    villages: {
        population: {
            different: 'between',
            valueTop: '149',
            valueBottom: '60',
        }
    }
};
let deathsFilterFrom150 = {
    players: {
        active: {
            different: 'equal',
            value: '0'
        },
        hasNoobProtection: {
            different: 'equal',
            value: false,
        },
        kingdomId: {
            different: 'equal',
            value: '0'
        },
    },
    villages: {
        population: {
            different: 'more',
            value: '150'
        }
    }
};
let deathsFilter = {
    players: {
        active: {
            different: 'equal',
            value: '0'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};
let withoutKingdomsFilter = {
    players: {
        hasNoobProtection: {
            different: 'equal',
            value: false,
        },
        kingdomId: {
            different: 'equal',
            value: '0'
        },
        active: {
            different: 'equal',
            value: '1'
        },
        population: {
            different: 'between',
            valueTop: '199',
            valueBottom: '40',
        }
    },
    villages: {
        population: {
            different: 'between',
            valueTop: '199',
            valueBottom: '40',
        }
    }
};

let withoutKingdomsFilter2 = {
    players: {
        hasNoobProtection: {
            different: 'equal',
            value: false,
        },
        kingdomId: {
            different: 'equal',
            value: '0'
        },
        active: {
            different: 'equal',
            value: '1'
        },
    },
    villages: {
        population: {
            different: 'less',
            value: '300',
        }
    }
};
let kingdomsFilters = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '503'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '100'
        }
    }
};
let neutrals = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '0'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};

let Ducheeze = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '78'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};


let BS = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '12'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};
let GoD = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '42'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};
let High5Inc = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '167'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};
let BSBS = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '269'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};
let Kelt = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '179'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};

let Bandits = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '27'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '120'
        }
    }
};

let Aero = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '28'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};

let Aero2 = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '28'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        },
        isMainVillage: {
            different: 'equal',
            value: false
        },
        isTown: {
            different: 'equal',
            value: false
        },
    }
};

let Resolute = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '211'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};


let GF = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '6'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};


let USNC = {
    players: {
        kingdomId: {
            different: 'equal',
            value: '20'
        },
        active: {
            different: 'equal',
            value: '1'
        }
    },
    villages: {
        population: {
            different: 'more',
            value: '1'
        }
    }
};

let FingertipAlbino = {
    players: {
        playerId: {
            different: 'equal',
            value: '3201'
        }
    },
    villages: {
        name: {
            different: 'equal',
            value: 'Albino'
        }
    }
};
let FingertipBravisimo = {
    players: {
        playerId: {
            different: 'equal',
            value: '3201'
        }
    },
    villages: {
        name: {
            different: 'equal',
            value: 'Albino'
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
function setHttpHeaders(serverDomain, cookie, contentLength) {

    return {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': cookie,
        'Host': serverDomain + '.kingdoms.com',
        'Origin': 'http://' + serverDomain + '.kingdoms.com',
        'Content-Length': contentLength,
        'Pragma': 'no-cache',
        'Referer': 'http://' + serverDomain + '.kingdoms.com',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
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
        headers: setHttpHeaders(opt.serverDomain, opt.cookie || cookie, JSON.stringify(opt.body).length),
        method: opt.method || 'GET',
        uri: `http://${opt.serverDomain}.kingdoms.com/api/?c=${opt.body.controller}&a=${opt.body.action}&${timeForGame}`,
        body: opt.body,
        json: true // Automatically stringifies the body to JSON
    };

    // console.log(options)

    //RP - request promise, return deffered object.
    return rp(options);
}

//fixedTime - фиксированное время
//randomTime - разброс

function autoExtendLists(playerFarmList, filter, coor) {

    //TODO: выпилить хардкод координат
    let xCor = coor.x,
        yCor = coor.y;

    let bodyFL = {
        'controller': 'cache',
        'action': 'get',
        'params': {
            'names': []
        },
        'session': playerFarmList.session
    };

    playerFarmList.params.listIds.forEach((item) => {
        bodyFL.params.names.push(`Collection:FarmListEntry:${item}`)
    });

    let optionsFL = {
        method: 'POST',
        json: true,
        body: bodyFL,
        serverDomain: serverDomain
    };


    httpRequest(optionsFL)
        .then(
            (farmListEntry) => {
                console.log(playerFarmList.session)
                console.log(farmListEntry)
                asyncLoop(
                    farmListEntry.cache && farmListEntry.cache.length || 0,
                    (loop) => {
                        let i = loop.iteration();
                        asyncLoop(
                            farmListEntry.cache[i].data.cache.length,
                            (loopCollection) => {
                                let j = loopCollection.iteration();
                                let sumTroops = 0;

                                for (let unit in farmListEntry.cache[i].data.cache[j].data.units) {
                                    sumTroops += parseInt(farmListEntry.cache[i].data.cache[j].data.units[unit]);
                                }

                                if (!sumTroops) {

                                    let toggleBody = {
                                        'controller': 'farmList',
                                        'action': 'toggleEntry',
                                        'params': {
                                            'villageId': farmListEntry.cache[i].data.cache[j].data.villageId,
                                            'listId': farmListEntry.cache[i].name.split(':')[2]
                                        },
                                        'session': playerFarmList.session
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

                                    httpRequest(options)
                                        .then(
                                            (body) => {
                                                let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);
                                                setTimeout(() => {
                                                    loopCollection.next();
                                                }, rand);
                                            },
                                            (error) => {
                                                console.log('toggleEntry');
                                                console.log(error);
                                            }
                                        )
                                } else {
                                    loopCollection.next();
                                }
                            },
                            () => {
                                console.log('Отчищение из фармлиста закончено')
                                loop.next();
                            }
                        );
                    },
                    () => {
                        console.log(`Все фармлисты отчищены ${playerFarmList.session}`);
                        // autoFarmList(fixedTime, randomTime, playerFarmList, server, true);
                        return httpRequest(optionsFL)
                            .then(
                                (farmListEntry) => {
                                    if (farmListEntry && farmListEntry.error) {
                                        console.log(farmListEntry.error.message);
                                        return false;
                                    }
                                    let villagesFromLists = [];

                                    farmListEntry.cache.forEach((collection) => {
                                        collection.data.cache.forEach((farmListEntryId) => {
                                            villagesFromLists.push(farmListEntryId.data);
                                        })
                                    });

                                    searchEnemy((villages) => {
                                        let listLength = Math.ceil(villages.length / 100);
                                        let listMassive = [];

                                        // let diff = _.difference(_.pluck(villages, "villageId"), _.pluck(villagesFromLists, "villageId"));
                                        // let diffCapturingVillageInList = _.difference(_.pluck(villagesFromLists, "villageId"), _.pluck(villages, "villageId"));
                                        // let capturingVillageInList = _.filter(villages, (obj) => { return diffCapturingVillageInList.indexOf(obj.villageId) >= 0; });

                                        // //TODO: добавить авто удаление с помощью второго прогона диф списков.
                                        // console.log(capturingVillageInList);
                                        // console.log(capturingVillageInList.length);

                                        //TODO: ЗАТЕСТИТЬ
                                        // capturingVillageInList.forEach(item =>{
                                        //
                                        //     let farmListEntryId;
                                        //
                                        //     villagesFromLists.forEach(village=>{
                                        //         if (village.villageId == item.villageId){
                                        //             farmListEntryId = village.indexOf(item.villageId);
                                        //         }
                                        //     });
                                        //
                                        //     if (!farmListEntryId){
                                        //         console.log(`${item.villageId} деревня не найдена`.error);
                                        //     } else {
                                        //         let toggleBody = {
                                        //             "controller":"farmList",
                                        //             "action":"toggleEntry",
                                        //             "params":{
                                        //                 "villageId":item.villageId,
                                        //                 "listId":   farmListEntryId
                                        //             },
                                        //             "session":listPayload.session
                                        //         };
                                        //
                                        //         let options = {
                                        //             method: 'POST',
                                        //             headers: {
                                        //                 'content-type' : 'application/x-www-form-urlencoded'
                                        //             },
                                        //             json: true,
                                        //             body: toggleBody,
                                        //             serverDomain: serverDomain
                                        //         };
                                        //
                                        //         console.log(toggleBody)
                                        //
                                        //
                                        //         httpRequest(options)
                                        //             .then(
                                        //                 (body) => {
                                        //                     console.log(body);
                                        //                 },
                                        //                 (error) => {
                                        //                     console.log(error);
                                        //                 }
                                        //             )
                                        //     }
                                        // });

                                        let grayIteration = 0;
                                        let lengthOfFL = 0;

                                        let diff = _.difference(_.pluck(villages, 'villageId'), _.pluck(villagesFromLists, 'villageId'));
                                        let grayDiffVillage = _.filter(villages, (village) => {
                                            return diff.indexOf(village.villageId) >= 0;
                                        });

                                        console.log(villages.length)

                                        //TODO: улушчить эту часть
                                        asyncLoop(
                                            farmListEntry.cache.length,
                                            (loop) => {
                                                let i = loop.iteration();
                                                asyncLoop(
                                                    grayDiffVillage.length,
                                                    (loopCollection) => {
                                                        let j = loopCollection.iteration();

                                                        console.log(farmListEntry.cache[i].data.cache.length);
                                                        // console.log(grayDiffVillage.length);

                                                        if (farmListEntry.cache[i].data.cache.length + lengthOfFL < 100 && grayDiffVillage[grayIteration]) {

                                                            let bodyReq = {
                                                                'action': 'toggleEntry',
                                                                'controller': 'farmList',
                                                                'params': {
                                                                    'villageId': grayDiffVillage[grayIteration].villageId,
                                                                    'listId': farmListEntry.cache[i].name.split(':')[2]
                                                                },
                                                                'session': playerFarmList.session
                                                            };

                                                            let options = {
                                                                method: 'POST',
                                                                headers: {
                                                                    'content-type': 'application/x-www-form-urlencoded'
                                                                },
                                                                serverDomain: serverDomain,
                                                                json: true,
                                                                body: bodyReq
                                                            };

                                                            httpRequest(options)
                                                                .then(
                                                                    (body) => {
                                                                        let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);
                                                                        setTimeout(() => {
                                                                            // console.log('Рандомное время ' + i + ': ' + rand);
                                                                            grayIteration++;
                                                                            lengthOfFL++;
                                                                            loopCollection.next();
                                                                        }, rand);
                                                                    },
                                                                    (error) => {
                                                                        grayIteration++;
                                                                        lengthOfFL++;
                                                                        loopCollection.next();
                                                                    }
                                                                );

                                                        }
                                                        else if (farmListEntry.cache[i].data.cache.length + lengthOfFL >= 100) {
                                                            console.log('Добавление в фармлист закончен');
                                                            lengthOfFL = 0;
                                                            loop.next();
                                                        }
                                                        else {
                                                            lengthOfFL = 0;
                                                            loop.next();
                                                        }
                                                    },
                                                    () => {
                                                        console.log('Добавление в фармлист закончен')
                                                    }
                                                )
                                            },
                                            () => {
                                                console.log(`Все фармлисты заполнены ${playerFarmList.session}`);

                                                // autoFarmList(fixedTime, randomTime, playerFarmList, server, true);
                                            }
                                        );

                                        // let sortedAllGreyVillages
                                    }, xCor, yCor, filter)
                                }
                            );
                    }
                );

            },
            (err) => {
                console.error('Произошла ошибка autoExtendLists');
                console.log(err);
            }
        )
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
        (token) => {
            let options = {
                method: 'GET',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                uri: `http://${serverDomain}.kingdoms.com/api/external.php?action=getMapData&privateApiKey=${token.response.privateApiKey}`,
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
                session: token
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
        }, (error, response, body) => {

            apiKey = JSON.parse(body);
            //console.log('Получили токен');
            //console.log(apiKey);

            request
                .get({
                    headers: {'content-type': 'application/x-www-form-urlencoded'},
                    url: 'http://' + serverDomain + '.kingdoms.com/api/external.php?action=getMapData&privateApiKey=' + apiKey.response.privateApiKey
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
                                url: 'http://' + serverDomain + '.kingdoms.com/api/?c=cache&a=get&' + timeForGame,
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
                                if (map.length>0 && (+map[0].avgAllDpsInfantry > 150 || +map[0].avgAllDpsMounted > 150)) {
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
                                                    'ownerId': 1060,
                                                    'targetId': obj.id
                                                }
                                            ],
                                            'fieldMessage': {
                                                'text': '',
                                                'type': 5,
                                                'duration': 12,
                                                'cellId': obj.id,
                                                'targetId': 1060
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
                                                    'ownerId': 1060,
                                                    'targetId': obj.id
                                                }
                                            ],
                                            'fieldMessage': {
                                                'text': '',
                                                'type': 5,
                                                'duration': 12,
                                                'cellId': obj.id,
                                                'targetId': 1060
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

var UnitTypes = {
    1: 'Legioner',
    2: 'Pretorian',
    3: 'Imperian',
    4: 'Scouts',
    5: 'Imperator',
    6: 'Ceserian',
    // Germany
    11: 'Clubswinger',
    12: 'Spearfighter',
    13: 'Axefighter',
    14: 'Scout',
    15: 'Paladin',
    16: 'Teutons',
    // Gauls
    21: 'Phalanx',
    22: 'Swordsman',
    23: 'Scout',
    24: 'Thunder',
    25: 'Druids',
    26: 'Eduins'
};

var Unit = {
    Rome: {
        Legioner: 1,
        Pretorian: 2,
        Imperian: 3,
        Scout: 4,
        Imperator: 5,
        Ceserian: 6
    },
    German: {
        Clubswinger: 11,
        Spearfighter: 12,
        Axefighter: 13,
        Scout: 14,
        Paladin: 15,
        Teutons: 16,
    },
    Gauls: {
        Phalanx: 21,
        Swordsman: 22,
        Scout: 23,
        Thunder: 24,
        Druids: 25,
        Eduins: 26
    }
};



function autoUnitsBuild(villageId, unitsBarack, unitsStable, fixedTime, randomTime, session) {
    let rand = fixedTimeGenerator(fixedTime) + randomTimeGenerator(randomTime);

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

    httpRequest(getAllOptions)
        .then(
            (body) => {
                let location = {};
                body.cache.forEach((item, i, arr) => {
                    if (item.name === `Collection:Building:${villageId}`) {
                        item.data.cache.forEach((building, i, arr) => {
                            //Конюшня
                            if (building.data.buildingType == '20') {
                                location.stable = building.data.locationId;
                            }
                            //Казарма
                            if (building.data.buildingType == '19') {
                                location.barack = building.data.locationId;
                            }
                        })
                    }
                });

                // console.log('Buildings placed: ', location)

                function getRecruitUnitsRequest(building, units) {
                    var locationId = location.barack;
                    var buildingType = 19;
                    if (building === 'stables') {
                        locationId = location.stable;
                        buildingType = 20;
                    }
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

                function buildUnits(building, units) {
                    if (building === 'barracks' && location.barack ||
                        building === 'stables' && location.stable) {

                        httpRequest(getRecruitUnitsRequest(building, units))
                            .then(
                                (body) => {

                                    let log = `${(new Date()).toLocaleString()} ${Users.getUserNameBySession(session)} ${building}: ${printUnits(units)} `;

                                    if (body.response && body.response.errors) {
                                        if (body.response.errors instanceof Array &&
                                            body.response.errors.some((error) => error.message === 'NotEnoughRes')) {

                                            let newAmount =
                                                units[Object.getOwnPropertyNames(units)[0]] - (1 + Math.round(Math.random() * 5));

                                            if (newAmount > 0) {
                                                let newUnits = {};
                                                newUnits[Object.getOwnPropertyNames(units)[0]] = newAmount;
                                                let timeout = 9000 + Math.round(Math.random() * 5000);
                                                log += `NER: Building ${printUnits(newUnits)} in ${printTime(timeout / 1000)} ...`;
                                                setTimeout(() => {
                                                    buildUnits(building, newUnits);
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

                function build() {
                    buildUnits('barracks', unitsBarack);
                    buildUnits('stables', unitsStable);
                }

                console.log(`${Users.getUserNameBySession(session)} Starting to build ${printUnits(unitsBarack)} ${printUnits(unitsStable)} each ${printTime(rand / 1000)}`);

                if (process.env.npm_config_initial !== undefined) {
                    console.log('Initial Build Requested');
                    build();
                }

                setInterval(build, rand);
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

/**
 * Функция для добавление в фарм лист. Передаём массив ID с листами и список деревень
 * @param listMassive
 * @param villages
 */
function addToFarmList(listMassive, villages) {
    if (debug === 3) {
        console.log(listMassive);
        console.log(villages);
    }

    let listIndex = 0;

    asyncLoop(
        villages.length,
        (loop) => {

            let i = loop.iteration();
            if (i % 100 == 0 && i != 0) {
                listIndex++
            }

            let villageId = villages[i].villageId;
            // console.log(listIndex);
            // console.log(listMassive[listIndex]);

            let bodyReq = {
                'action': 'toggleEntry',
                'controller': 'farmList',
                'params': {
                    'villageId': villageId,
                    'listId': listMassive[listIndex]
                },
                'session': token
            };

            let options = {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                serverDomain: serverDomain,
                json: true,
                body: bodyReq
            };

            httpRequest(options)
                .then(
                    (body) => {
                        // console.log(body);
                        let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);
                        setTimeout(() => {
                            // console.log('Рандомное время ' + i + ': ' + rand);
                            loop.next();
                        }, rand);
                    },
                    () => {

                    }
                );
        },
        () => {
            // console.log('cycle addToFarmList ended')
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
    getPlayers((players) => {


        let allPlayers = players;
        let sortedPlayers;
        let sortedVillages;


        console.log(players);
        //Условия
        for (let filter in filtersParam.players) {
            sortedPlayers = {
                cache: []
            };

            if (filtersParam.players[filter].different === 'equal') {
                allPlayers.cache.forEach((item, i, arr) => {
                    if (item.data[filter] == filtersParam.players[filter].value) {
                        sortedPlayers.cache.push(item);
                    }
                });
            }

            else if (filtersParam.players[filter].different === 'less') {
                allPlayers.cache.forEach((item, i, arr) => {
                    if (parseInt(item.data[filter]) <= parseInt(filtersParam.players[filter].value)) {
                        sortedPlayers.cache.push(item);
                    }
                });
            }

            else if (filtersParam.players[filter].different === 'more') {
                allPlayers.cache.forEach((item, i, arr) => {
                    if (parseInt(item.data[filter]) > parseInt(filtersParam.players[filter].value)) {
                        //     console.log(`
                        //     item.data[filter]: ${item.data[filter]}
                        //     filtersParam.players[filter].value: ${filtersParam.players[filter].value}
                        //     boolean: ${item.data[filter] > filtersParam.players[filter].value}
                        // `);
                        sortedPlayers.cache.push(item);
                    }
                });
            }
            else if (filtersParam.players[filter].different === 'between') {
                allPlayers.cache.forEach((item, i, arr) => {
                    if (
                        parseInt(item.data[filter]) > parseInt(filtersParam.players[filter].valueBottom) &&
                        parseInt(item.data[filter]) <= parseInt(filtersParam.players[filter].valueTop)
                    ) {
                        //     console.log(`
                        //     item.data[filter]: ${item.data[filter]}
                        //     filtersParam.players[filter].value: ${filtersParam.players[filter].value}
                        //     boolean: ${item.data[filter] > filtersParam.players[filter].value}
                        // `);
                        sortedPlayers.cache.push(item);
                    }
                });
            }

            allPlayers = Object.assign({}, sortedPlayers);
        }

        console.log(allPlayers);

        sortedPlayers = allPlayers;

        if (debug === 2) {
            console.log('Подготовили список игроков подходящим условиям')
        }

        let hackPlayer = {
            cache: [
                {
                    data: {
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
                sortedPlayers.cache.forEach((item, i, arr) => {
                    for (let j = 0; j < item.data.villages.length; j++) {
                        let obj = item.data.villages[j];
                        if (obj[filter] == filtersParam.villages[filter].value) {
                            sortedVillages.cache.push(obj);
                        }
                    }
                });
            }

            else if (filtersParam.villages[filter].different === 'less') {
                sortedPlayers.cache.forEach((item, i, arr) => {
                    for (let j = 0; j < item.data.villages.length; j++) {
                        let obj = item.data.villages[j];
                        if (parseInt(obj[filter]) < parseInt(filtersParam.villages[filter].value)) {
                            sortedVillages.cache.push(obj);
                        }
                    }
                });
            }

            else if (filtersParam.villages[filter].different === 'more') {
                sortedPlayers.cache.forEach((item, i, arr) => {
                    for (let j = 0; j < item.data.villages.length; j++) {
                        let obj = item.data.villages[j];
                        if (parseInt(obj[filter]) > parseInt(filtersParam.villages[filter].value)) {
                            sortedVillages.cache.push(obj);
                        }
                    }
                });
            }

            else if (filtersParam.villages[filter].different === 'between') {
                sortedPlayers.cache.forEach((item, i, arr) => {
                    for (let j = 0; j < item.data.villages.length; j++) {
                        let obj = item.data.villages[j];
                        console.log(
                            parseInt(obj[filter]) > parseInt(filtersParam.villages[filter].valueBottom) &&
                            parseInt(obj[filter]) <= parseInt(filtersParam.villages[filter].valueTop)
                        )

                        if (
                            parseInt(obj[filter]) > parseInt(filtersParam.villages[filter].valueBottom) &&
                            parseInt(obj[filter]) <= parseInt(filtersParam.villages[filter].valueTop)
                        ) {
                            sortedVillages.cache.push(obj);
                        }
                    }
                });
            }

            hackPlayer.cache[0].data.villages = sortedVillages;
            sortedPlayers = Object.assign({}, hackPlayer);
        }

        // console.log(hackPlayer.cache[0].data.villages[0])

        let villages = hackPlayer.cache[0].data.villages.cache;
        let sortedVillagesByCoor = _.sortBy(villages, (villages) => {
            let len = Math.sqrt(Math.pow(villages.coordinates.x - xCor, 2) + Math.pow(villages.coordinates.y - yCor, 2));
            return len;
        });

        console.log(`Количество ${sortedVillagesByCoor.length}`);
        fn(sortedVillagesByCoor);

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
    searchEnemy((villages) => {

        console.log('farmListCreator')
        let listLength = Math.ceil(villages.length / 100);
        let listMassive = [];

        // Если нужен только первые 100 целей
        // listLength = 3;
        asyncLoop(
            listLength,
            (loop) => {
                let i = loop.iteration();

                let listObj = {
                    'controller': 'farmList',
                    'action': 'createList',
                    'params': {'name': `${name} ${i}`},
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

                console.log(options);

                httpRequest(options)
                    .then(
                        (body) => {
                            if (body && body.error) {
                                console.log(body.error);
                            }

                            // console.log(options)
                            // console.log(body)
                            //Добавляем полученный массив в лист массивов
                            listMassive.push(body.cache[0].data.cache[0].data.listId);

                            if (listMassive.length == listLength) {
                                addToFarmList(listMassive, villages);
                            }

                            loop.next();

                        },
                        (error) => {
                            // console.log(error)
                        }
                    );
            },
            () => {
                // console.log('cycle farmListCreator ended')
            }
        );


        // let sortedAllGreyVillages
    }, xCor, yCor, filter);
}


/**
 *
 * @param villages - список айди деревень
 * @param count - кол-во раз сколько послать
 * @param session - ключ, с акка котороого будут слать
 * @param villageId - айди деревни, с которого идёт отсыл
 */
function heroChecker(villages, count, session, villageId) {

    asyncLoop(
        count,
        (loopHero) => {
            asyncLoop(
                villages.length,
                (loop) => {
                    let i = loop.iteration();

                    /*
                    * проверить
                    * 3: 1 - для галлов или немцев
                    * 4: 1 - для римлян
                    * */
                    let requestPayload = {
                        'controller': 'troops',
                        'action': 'send',
                        'params':
                            {
                                'destVillageId': villages[i],
                                'villageId': villageId,
                                'movementType': 6,
                                'redeployHero': false,
                                'units': {
                                    '1': 0,
                                    '2': 0,
                                    '3': 0,
                                    '4': 1,
                                    '5': 0,
                                    '6': 0,
                                    '7': 0,
                                    '8': 0,
                                    '9': 0,
                                    '10': 0,
                                    '11': 0
                                },
                                'spyMission': 'resources'
                            },
                        'session': session
                    };

                    let options = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json;charset=UTF-8'
                        },
                        serverDomain: serverDomain,
                        json: true,
                        body: requestPayload
                    };

                    // http://rux3.kingdoms.com/api/?c=troops&a=send&t1486071488668

                    let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);

                    httpRequest(options).then(
                        (body) => {
                            if (body && body.response && body.response.errors) {
                                console.log(body.response.errors);
                            }

                            setTimeout(loop.next, rand);
                            //console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] отправлен');
                        },
                        (err) => {
                            console.error('Произошла ошибка');
                            // console.log(err);
                            setTimeout(loop.next, rand);
                            //console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] отправлен');
                        }
                    );
                },
                () => {
                    // console.log('cycle heroChecker is end')
                    let rand = fixedTimeGenerator(60) + randomTimeGenerator(60);
                    setTimeout(loopHero.next, rand)
                }
            )
        },
        () => {
            console.log('heroChecker is end')
        }
    )

}

/**
 * Отправить отчёты в секретные сообщества
 * Reports
 * session: string
 * maxCount: number
 * filters: string[]
 */
function shareReports(obj) {
    let bodyReports = {
        'controller': 'reports',
        'action': 'getLastReports',
        'params': {
            'collection': 'own',
            'start': obj.start,
            'count': obj.maxCount,
            'filters': obj.filters,
            'alsoGetTotalNumber': true
        },
        'session': obj.session
    };

    let bodyReportsPayload = {
        method: 'POST',
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        },
        serverDomain: serverDomain,
        json: true,
        body: bodyReports
    };

    httpRequest(bodyReportsPayload).then(
        (body) => {
            asyncLoop(
                body.response.reports.length,
                (loop) => {
                    let i = loop.iteration();
                    let report = body.response.reports[i];

                    let bodyReport = {
                        'controller': 'reports',
                        'action': 'shareReport',
                        'params': {
                            'id': report._id.$id,
                            'shareWith': 'secretSociety',
                            'shareParam': 0,
                            'shareMessage': '',
                            'collection': 'own'
                        },
                        'session': obj.session
                    };

                    let bodyReportPayload = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json;charset=UTF-8'
                        },
                        serverDomain: serverDomain,
                        json: true,
                        body: bodyReport
                    };


                    httpRequest(bodyReportPayload).then(
                        (body) => {
                            console.log(body)

                            let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);

                            setTimeout(function () {
                                console.log('Рандомное время ' + i + ': ' + rand);
                                loop.next();
                            }, rand);
                        });
                },
                () => {
                    console.log('finally shared reports')
                }
            );
        }
    )
}

/**
 * Рассыл атак по условиям.
 * @param name - имя листа
 * @param xCor
 * @param yCor
 * @param filter - фильтр, интерфейс к фильтрам находится над сёрч энеми
 */

function attackList(filter, xCor, yCor, paramsAttack) {
    //'>100', '33', '-28', deathsFilter
    searchEnemy((villages) => {
        asyncLoop(
            villages.length,
            (loop) => {
                let i = loop.iteration();

                let requestPayload = {
                    'controller': 'troops',
                    'action': 'send',
                    'params':
                        {
                            'destVillageId': villages[i].villageId,
                            'villageId': 537837575,
                            'movementType': 6,
                            'redeployHero': false,
                            'units': {
                                '1': 0,
                                '2': 0,
                                '3': 1,
                                '4': 0,
                                '5': 0,
                                '6': 0,
                                '7': 0,
                                '8': 0,
                                '9': 0,
                                '10': 0,
                                '11': 0
                            },
                            'spyMission': 'resources'
                        },
                    'session': token
                }

                let options = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json;charset=UTF-8'
                    },
                    serverDomain: serverDomain,
                    json: true,
                    body: requestPayload
                };

                // http://rux3.kingdoms.com/api/?c=troops&a=send&t1486071488668

                let lastReportPayload = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json;charset=UTF-8'
                    },
                    serverDomain: serverDomain,
                    json: true,
                    body: {
                        'controller': 'reports',
                        'action': 'getLastReports',
                        'params': {
                            'collection': 'search',
                            'start': 0,
                            'count': 10,
                            'filters': [
                                '15', '16', '17',
                                {'villageId': villages[i].villageId}
                            ],
                            'alsoGetTotalNumber': true
                        },
                        'session': token
                    }
                };

                httpRequest(lastReportPayload).then(
                    (body) => {
                        console.log(body);
                        let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);

                        //15 - чистый лог
                        //16 - с потерями
                        //17 - всё проёбано блеать :(
                        if (body.response && body.response.reports && body.response.reports.length > 0 && body.response.reports[0].notificationType === 15) {
                            httpRequest(options).then(
                                (log) => {
                                    setTimeout(function () {
                                        console.log('Рандомное время ' + i + ': ' + rand);
                                        loop.next();
                                    }, rand);
                                },
                                (err) => {
                                    console.log(err)
                                }
                            );
                            console.log('body.response.reports > 0');
                            console.log(body.response.reports[0]);
                        } else if (body.response && body.response.reports && body.response.reports.length === 0) {
                            console.log('body.response.reports === 0')
                            httpRequest(options).then(
                                (log) => {
                                    setTimeout(function () {
                                        console.log('Рандомное время ' + i + ': ' + rand);
                                        loop.next();
                                    }, rand);
                                },
                                (err) => {
                                    console.log(err)
                                }
                            )
                        } else {
                            // if (body.response && body.response.reports){
                            //     console.log(body.response.reports[0].notificationType);
                            // } else {
                            //     console.log(body.response)
                            // }
                            setTimeout(loop.next, rand)
                        }

                        //console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] отправлен');
                    },
                    function (err) {
                        console.error('Произошла ошибка');
                        console.log(err);
                        //console.info('Фарм лист listIds[' + listPayload.params.listIds + '], villageId[' + listPayload.params.villageId + '], session[' + listPayload.session +'] отправлен');

                    }
                );
            },
            function () {
                console.log('Search ended')
            }
        );
        // let sortedAllGreyVillages
    }, xCor, yCor, filter);
}

// let repeatFn = function(fn){
//   getMapInfo('crop', token, serverDomain, timeForGame);
//   setTimeout(fn, 600000);
// };
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
//             "11": 0l
//         },
//         "spyMission": "resources"
//     },
//     "session": token
// };

/**
 * Скан по условию
 */

// attackList(deathsFilter, 29, 10);
// setInterval(() => {
//   attackList(neutrals, 28, 10);
// }, 4 * 3600 * 1000);
// attackList(neutrals, 28, 10);

// attackList(Ducheeze, 4, 27);
// setTimeout(() => {
//
// attackList(Aero, 29, 10);
// attackList(BS, 29, 10);
// attackList(GoD, 29, 10);
// attackList(High5Inc, 29, 10);
// attackList(Bandits, 29, 10);
// attackList(Kelt, 29, 10);
// attackList(GF, 29, 10);
//
// }, 3600 * 2000)
//
// setInterval(() => {
//   attackList(withoutKingdomsFilter2, 28, 10);
//   setTimeout(() => {
//     shareReports(
//       {
//         session: "54c5abf05693542908fc",
//         start: 0,
//         maxCount: 50,
//         filters: ["15"]
//       }
//     );
//   }, 3600 * 1000);
//
//   setTimeout(() => {
//     shareReports(
//       {
//         session: "54c5abf05693542908fc",
//         start: 50,
//         maxCount: 50,
//         filters: ["15"]
//       }
//     );
//   }, 7200 * 1000);
//
//   setTimeout(() => {
//
//     shareReports(
//       {
//         session: "54c5abf05693542908fc",
//         start: 0,
//         maxCount: 50,
//         filters: ["15"]
//       }
//     );
//
//     shareReports(
//       {
//         session: "54c5abf05693542908fc",
//         start: 50,
//         maxCount: 50,
//         filters: ["15"]
//       }
//     );
//
//   }, 1100 * 3000);
// }, 4 * 3600 * 1000);
// attackList(withoutKingdomsFilter2, 28, 10);

const Tasks = {
    heroChecker: process.env.npm_config_check !== undefined,
    build: process.env.npm_config_build !== undefined,
    animals: process.env.npm_config_animals !== undefined,
    farm: process.env.npm_config_farm !== undefined
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
        var bu2_Coss_Main = {};
        bu2_Coss_Main[Unit.Rome.Legioner] = 0;
        var su2_Coss_Main = {};
        su2_Coss_Main[Unit.Rome.Scout] = 0;
        //autoUnitsBuild(Users.Coss.village, bu2_Coss_Main, su2_Coss_Main, buildInterval, 100, Users.Coss.session);

        initResourcesGatheringStrategy(Users.Coss.session, 5000, [4, 1, 1, 0]);
    }

}

/**
 * Крокодилы
 */
if (Tasks.animals) {
    setInterval(function() {
        getMapInfo('animal', token, serverDomain, timeForGame);
    }, 635000);
    getMapInfo('animal', token, serverDomain, timeForGame);
}


/**
 * Добавления юнитов по улсовиям
 */
// farmListCreator('Aero', '17', '9', Aero2);
// setTimeout(() => {
//   farmListCreator('#wkf-199/', '17', '9', withoutKingdomsFilter);
//   farmListCreator('#60-149/ ', '19', '-23', deathsFilterFrom60To150);
//   farmListCreator('#150+/ '  , '19', '-23', deathsFilterFrom150);
//   farmListCreator('#wkf-200+/ '  , '56', '-13', withoutKingdomsFilter2);
// }, 3600 * 1000);
// farmListCreator('FF', '53', '-25', kingdomsFilters);
/**
 * Фармлисты
 */
if (Tasks.farm) {
    autoFarmList(1000, 200, listPayload.alex322, 'ru2x3', true);
}
//
// autoFarmList(1500, 600, listPayload.lolko ,      'com2x3', true);
//autoFarmList(3000, 600, listPayload.ann , 'ru1', true);
//autoFarmList(3000, 600, listPayload.ann2, 'ru1', true);
// autoFarmList(1500, 600, listPayload.serega2 ,      'com2x3', true);
// autoFarmList(1500, 600, listPayload.julia3 ,      'com2x3', true);
//
// setTimeout(() => {
//   autoFarmList(900, 600, listPayload.wahlbergExp ,      'com2x3', true);
//
// //   setTimeout(() => {
//     autoFarmList(900, 600, listPayload.wahlbergScript ,   'com2x3', true);
//     autoFarmList(900, 600, listPayload.wahlbergKop1 ,     'com2x3', true);
//     autoFarmList(900, 600, listPayload.wahlbergKop2 ,     'com2x3', true);
//     autoFarmList(900, 600, listPayload.wahlbergKop3 ,     'com2x3', true);
//     autoFarmList(900, 600, listPayload.wahlbergKop4 ,     'com2x3', true);
//     autoFarmList(900, 600, listPayload.wahlbergKop5 ,     'com2x3', true);
//     autoFarmList(900, 600, listPayload.wahlbergFig ,      'com2x3', true);
//     autoFarmList(900, 600, listPayload.wahlbergTulpia ,      'com2x3', true);
//   }, 1200 * 1000)
//
// }, 3600 * 2000)
// autoFarmList(1500, 600, listPayload.wahlbergFeed ,     'com2x3', true);
//
// autoFarmList(1500, 600, listPayload.krolik,                'com2x3', true);
// autoFarmList(1500, 600, listPayload.hysteria,              'com1x3', true);
// autoFarmList(1500, 600, listPayload.hysteria2,             'com2x3', true);
// autoFarmList(1800, 600, listPayload.malaoban1 ,      'com2', true);
// autoFarmList(1800, 600, listPayload.malaoban2 ,      'com2', true);
// autoFarmList(1800, 600, listPayload.malaoban3 ,      'com2', true);
// autoFarmList(1800, 600, listPayload.malaoban4 ,      'com2', true);
// autoFarmList(1800, 600, listPayload.malaoban6 ,      'com2', true);
// autoFarmList(1800, 600, listPayload.malaoban7 ,      'com2', true);
// );
// autoExtendLists(listPayload.wahlbergExp ,      deathsFilter, {x: 17, y: 9});
// setTimeout(() => {
//   autoExtendLists(listPayload.wahlbergScript ,   deathsFilterFrom150, {x: 17, y: 9});
//   autoExtendLists(listPayload.hysteria,         deathsFilterFrom150, {x: 16, y: 11});
// }, 3600 * 1000);
// autoExtendLists(listPayload.wahlbergKop1 ,     deathsFilter, {x: 17, y: 9});
// autoExtendLists(listPayload.wahlbergKop2 ,     deathsFilter, {x: 17, y: 9});
// autoExtendLists(listPayload.wahlbergKop2 ,     deathsFilter, {x: 17, y: 9});
// autoExtendLists(listPayload.malaoban1, deathsFilterFrom60To150, {x: 4, y: 27});
// autoExtendLists(listPayload.malaoban3, deathsFilterFrom150, {x: 4, y: 27});
// autoExtendLists(listPayload.malaoban3 ,      'com2', deathsFilter);
// autoExtendLists(listPayload.Wahlberg ,       deathsFilter);
// autoExtendLists(listPayload.Wahlberg2 ,       deathsFilter);
// autoExtendLists(listPayload.krolik ,         deathsFilter);
// autoExtendLists(listPayload.King ,         deathsFilter);
// autoExtendLists(listPayload.julia,         deathsFilterFrom150, {x: 16, y: 11});
// autoExtendLists(listPayload.krolik,         deathsFilterFrom150, {x: 56, y: -13});
// playerFarmList, filter, fixedTime, randomTime, server
// heroChecker([537444369, 536952841, 537280520, 537444388, 537280521, 537575434, 537575439], 50, "cc00e59d239bf2fa21ed", 537247743);
// heroChecker([537444360], 65, "8494ba670668ae064aa5", 537247743);
// heroChecker([536920052], 50, "3eb49d638573be727f86", 537247743);
// heroChecker([537214982], 30, "f192292c4346c1fead7a", 537247743);


/**
 * Автобот
 */

// new Autobot();



/**
 * Кроп
 */
// getMapInfo('crop', token, serverDomain, timeForGame);
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