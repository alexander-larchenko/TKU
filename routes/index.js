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
const userDate = require('./../config.json');

const debug = 1;
// debug - 1, идут только необходимые логи, которые показывают процессы запуска.
// debug - 2, идут логи из основных функций
// debug - 3, идут полные логи

let listPayload = {
  wahlbergScript:   {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6876, 6879, 6881, 6882],"villageId":537051121},"session":"3e447835236eee46842b", "server": "com2"},
  wahlbergExploit:  {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6876, 6879, 6881, 6882],"villageId":536756212},"session":"3e447835236eee46842b", "server": "com2"},
  wahlbergCheats:   {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6876],"villageId":537116670},"session":"3e447835236eee46842b", "server": "com2"},
  Rin:          {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6824, 6823, 6826, 6827],"villageId":536821756},"session":"0b7317514d6ddbd49fe3", "server": "com2"},
  Pashgun:      {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6813, 6814, 6815, 6816, 6817, 6812],"villageId":537313259},"session":"fc72068edad847816372", "server": "com2"},
  Pashgun2:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6813, 6814, 6815, 6816, 6817, 6812],"villageId":537083889},"session":"fc72068edad847816372", "server": "com2"},
  Pashgun3:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6813, 6814, 6815, 6816, 6817, 6812],"villageId":537444336},"session":"fc72068edad847816372", "server": "com2"},
  Diuse:        {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6848, 6849, 6851],"villageId":537640952},"session":"94a1ee4ec48d626da0d7", "server": "com2"},
  Starlord:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6846, 6847, 6850, 6856],"villageId":537378807},"session":"78995e8127da01897f80", "server": "com2"},
  Starlord2:    {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6861, 6864, 6866, 6870],"villageId":537280506},"session":"78995e8127da01897f80", "server": "com2"},
  quasi:        {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6643, 6644, 6645, 6646],"villageId":536887294},"session":"ca16e3a1650e2e38e04f", "server": "com2"},
  YourPapa:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6875, 6877, 6878, 6880],"villageId":536854523},"session":"10b528d85e32b79851fc", "server": "com2"},
  hysteria:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6841, 6843, 6852, 6853],"villageId":537313250},"session":"a55d404474419cd7d838", "server": "com2"},
  engal:        {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6634, 6635, 6636, 6637],"villageId":537444343},"session":"baf82b2030dde4f64dca", "server": "com2"},
  abaddon:      {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6830, 6833, 6838, 6844],"villageId":537214965},"session":"dbc3011f5513533e423d", "server": "com2"},
  astaroth:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[6832, 6839, 6840, 6842],"villageId":536952818},"session":"43c9cd2a3ca42688a57d", "server": "com2"},

  wahlbergSpeed: {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[1321,1322],"villageId":536297449},"session":"9276a0724afd93d38349", "server": "ru1x3"},
  desertir:      {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[1345,1346],"villageId":537542616},"session":"2bba04071c3fc36ce41d", "server": "ru1x3"},
  desertir2:     {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[1345,1346],"villageId":536690641},"session":"2bba04071c3fc36ce41d", "server": "ru1x3"},

  ann:          {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[4024, 4025, 4026],"villageId":536133651},"session":"a6e493f79fcc81075200", "server": "ru1"},//
  ann2:         {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[4024, 4025, 4026],"villageId":536068116},"session":"a6e493f79fcc81075200", "server": "ru1"},//
  ann3:         {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[4024, 4025, 4026],"villageId":535478325},"session":"a6e493f79fcc81075200", "server": "ru1"},//
  ann4:         {"controller":"troops","action":"startFarmListRaid","params":{"listIds":[4024, 4025, 4026],"villageId":535412789},"session":"a6e493f79fcc81075200", "server": "ru1"},//
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
      different: "equal",
      value: false,
    },
    kingdomId: {
      different: "equal",
      value: "0"
    },
    active: {
      different: "equal",
      value: "0"
    },
    population: {
      different: "between",
      valueTop: "149",
      valueBottom: "40",
    }
  },
  villages: {
    population: {
      different: "between",
      valueTop: "149",
      valueBottom: "60",
    }
  }
};
let deathsFilterFrom150 = {
  players: {
    active: {
      different: "equal",
      value: "0"
    },
    hasNoobProtection: {
      different: "equal",
      value: false,
    },
    kingdomId: {
      different: "equal",
      value: "0"
    },
  },
  villages: {
    population: {
      different: "more",
      value: "150"
    }
  }
};
let deathsFilter = {
  players: {
    active: {
      different: "equal",
      value: "0"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};
let lowVillage = {
  players: {
    active: {
      different: "equal",
      value: "1"
    },
    hasNoobProtection: {
      different: "equal",
      value: false,
    },
    tribeId: {
      different: "equal",
      value: "2"
    },
  },
  villages: {
    population: {
      different: "less",
      value: "200"
    }
  },

};
let withoutKingdomsFilter = {
  players: {
    hasNoobProtection: {
      different: "equal",
      value: false,
    },
    kingdomId: {
      different: "equal",
      value: "0"
    },
    active: {
      different: "equal",
      value: "1"
    },
    population: {
      different: "between",
      valueTop: "199",
      valueBottom: "40",
    }
  },
  villages: {
    population: {
      different: "between",
      valueTop: "199",
      valueBottom: "40",
    }
  }
};

let withoutKingdomsFilter2 = {
  players: {
    hasNoobProtection: {
      different: "equal",
      value: false,
    },
    kingdomId: {
      different: "equal",
      value: "0"
    },
    active: {
      different: "equal",
      value: "1"
    },
  },
  villages: {
    population: {
      different: "less",
      value: "1200",
    }
  }
};

let checkAll = {
  players: {
    hasNoobProtection: {
      different: "equal",
      value: false,
    },
    kingdomId: {
      different: "notEqual",
      value: "189"
    },
    active: {
      different: "equal",
      value: "1"
    },
  },
  villages: {
    population: {
      different: "less",
      value: "400",
    }
  }
};

let kingdomsFilters = {
  players: {
    kingdomId: {
      different: "equal",
      value: "503"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "100"
    }
  }
};
let neutrals = {
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
    population: {
      different: "more",
      value: "1"
    }
  }
};

let WiC = {
  players: {
    kingdomId: {
      different: "equal",
      value: "48"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};


let BS = {
  players: {
    kingdomId: {
      different: "equal",
      value: "30"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};
let GoD = {
  players: {
    kingdomId: {
      different: "equal",
      value: "42"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};
let High5Inc = {
  players: {
    kingdomId: {
      different: "equal",
      value: "167"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};
let BSBS = {
  players: {
    kingdomId: {
      different: "equal",
      value: "269"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};
let Kelt = {
  players: {
    kingdomId: {
      different: "equal",
      value: "179"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};

let Bandits = {
  players: {
    kingdomId: {
      different: "equal",
      value: "27"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "120"
    }
  }
};

let SNGFilter = {
  players: {
    kingdomId: {
      different: "equal",
      value: "117"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};

let Aero2 = {
  players: {
    kingdomId: {
      different: "equal",
      value: "28"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    },
    isMainVillage: {
      different: "equal",
      value: false
    },
    isTown: {
      different: "equal",
      value: false
    },
  }
};

let Resolute = {
  players: {
    kingdomId: {
      different: "equal",
      value: "211"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};


let GF = {
  players: {
    kingdomId: {
      different: "equal",
      value: "6"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};


let USNC = {
  players: {
    kingdomId: {
      different: "equal",
      value: "20"
    },
    active: {
      different: "equal",
      value: "1"
    }
  },
  villages: {
    population: {
      different: "more",
      value: "1"
    }
  }
};

let FingertipAlbino = {
  players: {
    playerId: {
      different: "equal",
      value: "3201"
    }
  },
  villages: {
    name: {
      different: "equal",
      value: "Albino"
    }
  }
};
let FingertipBravisimo = {
  players: {
    playerId: {
      different: "equal",
      value: "3201"
    }
  },
  villages: {
    name: {
      different: "equal",
      value: "Albino"
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
    "controller": "cache",
    "action": "get",
    "params": {
      "names": []
    },
    "session": playerFarmList.session
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
          (loop)  => {
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
                    "controller": "farmList",
                    "action": "toggleEntry",
                    "params": {
                      "villageId": farmListEntry.cache[i].data.cache[j].data.villageId,
                      "listId": farmListEntry.cache[i].name.split(':')[2]
                    },
                    "session": playerFarmList.session
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

                    let diff = _.difference(_.pluck(villages, "villageId"), _.pluck(villagesFromLists, "villageId"));
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
                                "action": "toggleEntry",
                                "controller": "farmList",
                                "params": {
                                  "villageId": grayDiffVillage[grayIteration].villageId,
                                  "listId": farmListEntry.cache[i].name.split(':')[2]
                                },
                                "session": playerFarmList.session
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
      let FarmListEntry = farmListsResponse.cache[i].name.split(":")[2];
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
              "controller": "reports",
              "action": "getLastReports",
              "params": {
                "collection": "search",
                "start": 0,
                "count": 10,
                "filters": ["124", {"villageId": villageLog.data.villageId}],
                "alsoGetTotalNumber": true
              },
              "session": listPayload.session
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
                  if (body && body.response && body.response.reports){

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
                        } else if (unit < 15) {
                          villageLog.data.units[unitKey] = parseInt(villageLog.data.units[unitKey]) + 1;
                        } else {
                          //nothing?
                        }
                      }

                      let unitBody = {
                        "controller": "farmList",
                        "action": "editTroops",
                        "params": {
                          "entryIds": [parseInt(villageLog.data.entryId)],
                          "units": villageLog.data.units
                        },
                        "session": listPayload.session
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
                        "controller": "farmList",
                        "action": "editTroops",
                        "params": {
                          "entryIds": [parseInt(villageLog.data.entryId)],
                          "units": villageLog.data.units
                        },
                        "session": listPayload.session
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
              "controller": "farmList",
              "action": "toggleEntry",
              "params": {
                "villageId": villageLog.data.villageId,
                "listId": FarmListEntry
              },
              "session": listPayload.session
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
              "controller": "farmList",
              "action": "toggleEntry",
              "params": {
                "villageId": villageLog.data.villageId,
                "listId": FarmListEntry
              },
              "session": listPayload.session
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

  let startFarmListRaid = (listPayload) => {
    //console.log(listPayload);

    let options = {
      serverDomain: serverDomain,
      body: listPayload
    };

    return httpRequest(options).then(
      (body) => {
        console.info('Фарм лист listIds[' + listPayload.params.listIds + '], ' +
          'villageId[' + listPayload.params.villageId + '], ' +
          'session[' + listPayload.session +'] отправлен');

        if (body && body.response && body.response.errors){
          /**
           * Возможные баги
           * 1) деревня перенесена
           * 2) список удалён
           * 3) отправлено больше 1000
           */
          console.log('ОШИБКА'.error);
          console.log(options.body);
          console.log(body.response.errors);
        }

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
          "controller": "cache",
          "action": "get",
          "params": {
            names: []
          },
          "session": listPayload.session
        };


        console.log(listPayload.params.listIds)
        for (let i = 0; i < listPayload.params.listIds.length; i++) {
          let list = listPayload.params.listIds[i];
          checkBodyObj.params.names.push("Collection:FarmListEntry:" + list);
        };

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

      console.log('Фарм лист listIds[' + listPayload.params.listIds + '], ' +
        'villageId[' + listPayload.params.villageId + '], ' +
        'session[' + listPayload.session + '] ' +
        'следующий запуск: [' + dateNext.toString() + ']');
      init = true;
      

    };

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


            const file = `./json/getMap/data${+Date.now()}.json` ;

            fs.writeFile(file, `${JSON.stringify(body)}`, function (err) {
              if(err) {
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
    let playersRequestLength = parseInt(players.length/divineI);
    let payloadArray = [];
    // console.log(players.length);

    for (let i = 0; i <= playersRequestLength; i++) {

      let playersBody = [];

      for (let j = 0; j < divineI; j++) {
        playersBody[j] = 'Player:' + players[i*divineI+j];
      }

      let payload = {
        controller: "cache",
        action: "get",
        params: {names: playersBody},
        session: token
      };

      let options = {
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'Accept':'application/json, text/plain, */*',
          'Accept-Encoding':'gzip, deflate',
          'Accept-Language':'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4'
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
      (loop)=>{
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
      ()=>{
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
function getMapInfo(type, token, serverDomain, timeForGame, ownerId) {
  type = type || 'animal';
  request
    .get({
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      url: 'http://' + serverDomain + '.kingdoms.com/api/external.php?action=requestApiKey&email=allin.nikita@yandex.ru&siteName=borsch&siteUrl=http://borsch-label.com&public=true'
    }, (error, response, body) => {

      apiKey = JSON.parse(body);
      console.log('Получили токен');
      //console.log(apiKey);

      request
        .get({
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          url: 'http://' + serverDomain + '.kingdoms.com/api/external.php?action=getMapData&privateApiKey=' + apiKey.response.privateApiKey
        },  (error, response, body) => {
          //TODO: холишит блять
          //Переделай, стыдно же людям такое показывать. 
          console.log('получили данные с опенапи')
          apiData = JSON.parse(body);

          console.log(JSON.parse(body));

          function oasis() {

            let oasisArr = [];
            let oasisObj = apiData.response.map.cells;
            let j = 0;
            for (let i = 0; i < oasisObj.length; i++) {
              if (oasisObj[i].oasis != 0) {
                oasisArr[j] = 'MapDetails:' + oasisObj[i].id;
                j++;
              }
            }

            console.log(apiData.response.map);

            console.log('Сформировали массив');

            let session = {"controller": "cache", "action": "get", "params": {"names": oasisArr}, "session": token};

            request
              .post({
                headers: {
                  'Content-Type': 'application/json'
                },
                url: 'http://' + serverDomain + '.kingdoms.com/api/?c=cache&a=get&' + timeForGame,
                body: JSON.stringify(session)
              },  (error, response, body) => {
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



                for (let m = 0; m < jsonBody.cache.length; m++) {
                  for (let k = 0; k < apiData.response.map.cells.length; k++) {

                    // console.log(jsonBody.cache[m].data);
                    if (apiData.response.map.cells[k].id == jsonBody.cache[m].data.troops.villageId) {

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
                        x: apiData.response.map.cells[k].x,
                        y: apiData.response.map.cells[k].y,
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
                //console.log(apiData.map.cells);
                console.log('Создали объект');

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
                    "controller": "map",
                    "action": "editMapMarkers",
                    "params": {
                      "markers": [
                        {
                          "owner": 1,
                          "type": 3,
                          "color": 3,
                          "editType": 3,
                          "ownerId": ownerId,
                          "targetId": obj.id
                        }
                      ],
                      "fieldMessage": {
                        "text": "",
                        "type": 5,
                        "duration": 12,
                        "cellId": obj.id,
                        "targetId": ownerId
                      }
                    },
                    "session": token
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
                    "controller": "map",
                    "action": "editMapMarkers",
                    "params": {
                      "markers": [
                        {
                          "owner": 1,
                          "type": 3,
                          "color": 10,
                          "editType": 3,
                          "ownerId": ownerId,
                          "targetId": obj.id
                        }
                      ],
                      "fieldMessage": {
                        "text": "",
                        "type": 5,
                        "duration": 12,
                        "cellId": obj.id,
                        "targetId": ownerId
                      }
                    },
                    "session": token
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
              crop(apiData.response.map.cells);
              break;
          }
        });
    });
};

/**
 * Rome
 * 1 - Legioner
 * 2 - Pretorian
 * 3 - Imperian
 * 4 - Scouts
 * 5 - Imperator
 * 6 - Ceserian
 *
 * Germany
 * 11 - Clubswinger
 * 12 - Spearfighter
 * 13 - Axefighter
 * 14 - Scout
 * 15 - Paladin
 * 16 - Teutonic knight
 *
 * Gauls
 * 21 - Phalanx
 * 22 - Swordsman
 * 23 - Scout
 * 24 - Thunder T
 * 25 - Druids
 * 26 - Eduins
 */


//TODO: rewrite to cred
function autoUnitsBuild(villageId, unitsBarack, unitsStable, fixedTime, randomTime, session) {
  let rand = fixedTimeGenerator(fixedTime) + randomTimeGenerator(randomTime);

  let getAllOptions = {
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8'
    },
    json: true,
    body: {"controller": "player", "action": "getAll", "params": {deviceDimension: "1920:1080"}, "session": session},
    serverDomain: serverDomain
  };

  httpRequest(getAllOptions)
    .then(
      (body) => {
        let location = {};
        body.cache.forEach((item, i, arr) => {
          if (item.name === `Collection:Building:${villageId}`) {
            item.data.cache.forEach( (building, i, arr) => {
              //Конюшня
              if (building.data.buildingType == "20") {
                location.stable = building.data.locationId;
              }
              //Казарма
              if (building.data.buildingType == "19") {
                location.barack = building.data.locationId;
              }
            })
          }
        });

        console.log(location)

        let barackOptions = {
          method: 'POST',
          headers: {
            'content-type': 'application/json;charset=UTF-8'
          },
          json: true,
          body: {
            "controller": "building",
            "action": "recruitUnits",
            "params": {"villageId": villageId, "locationId": location.barack, "buildingType": 19, "units": unitsBarack},
            "session": session
          },
          serverDomain: serverDomain
        };

        let stableOptions = {
          method: 'POST',
          headers: {
            'content-type': 'application/json;charset=UTF-8'
          },
          json: true,
          body: {
            "controller": "building",
            "action": "recruitUnits",
            "params": {"villageId": villageId, "locationId": location.stable, "buildingType": 20, "units": unitsStable},
            "session": session
          },
          serverDomain: serverDomain
        };

        function build() {
          if (location.barack) {
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
    next:  () => {
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

    iteration:  () => {
      return index - 1;
    },

    break:  () => {
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
            setTimeout( () => {
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
  getPlayers( (players) => {


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
        allPlayers.cache.forEach( (item, i, arr) => {
          if (item.data[filter] == filtersParam.players[filter].value) {
            sortedPlayers.cache.push(item);
          }
        });
      }


      else if (filtersParam.players[filter].different === 'notEqual') {
        allPlayers.cache.forEach( (item, i, arr) => {
          if (item.data[filter] != filtersParam.players[filter].value) {
            sortedPlayers.cache.push(item);
          }
        });
      }

      else if (filtersParam.players[filter].different === 'less') {
        allPlayers.cache.forEach( (item, i, arr) => {
          if (parseInt(item.data[filter]) <= parseInt(filtersParam.players[filter].value)) {
            sortedPlayers.cache.push(item);
          }
        });
      }

      else if (filtersParam.players[filter].different === 'more') {
        allPlayers.cache.forEach( (item, i, arr) => {
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
        allPlayers.cache.forEach( (item, i, arr) => {
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
      console.log("Подготовили список игроков подходящим условиям")
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
        sortedPlayers.cache.forEach( (item, i, arr) => {
          for (let j = 0; j < item.data.villages.length; j++) {
            let obj = item.data.villages[j];
            if (obj[filter] == filtersParam.villages[filter].value) {
              sortedVillages.cache.push(obj);
            }
          }
        });
      }

      else if (filtersParam.villages[filter].different === 'notEqual') {
        sortedPlayers.cache.forEach( (item, i, arr) => {
          for (let j = 0; j < item.data.villages.length; j++) {
            let obj = item.data.villages[j];
            if (obj[filter] != filtersParam.villages[filter].value) {
              sortedVillages.cache.push(obj);
            }
          }
        });
      }

      else if (filtersParam.villages[filter].different === 'less') {
        sortedPlayers.cache.forEach( (item, i, arr) => {
          for (let j = 0; j < item.data.villages.length; j++) {
            let obj = item.data.villages[j];
            if (parseInt(obj[filter]) < parseInt(filtersParam.villages[filter].value)) {
              sortedVillages.cache.push(obj);
            }
          }
        });
      }

      else if (filtersParam.villages[filter].different === 'more') {
        sortedPlayers.cache.forEach( (item, i, arr) => {
          for (let j = 0; j < item.data.villages.length; j++) {
            let obj = item.data.villages[j];
            if (parseInt(obj[filter]) > parseInt(filtersParam.villages[filter].value)) {
              sortedVillages.cache.push(obj);
            }
          }
        });
      }

      else if (filtersParam.villages[filter].different === 'between') {
        sortedPlayers.cache.forEach( (item, i, arr) => {
          for (let j = 0; j < item.data.villages.length; j++) {
            let obj = item.data.villages[j];
            console.log(
              parseInt(obj[filter]) >  parseInt(filtersParam.villages[filter].valueBottom) &&
              parseInt(obj[filter]) <= parseInt(filtersParam.villages[filter].valueTop)
            )

            if (
              parseInt(obj[filter]) >  parseInt(filtersParam.villages[filter].valueBottom) &&
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
    let sortedVillagesByCoor = _.sortBy(villages,  (villages) => {
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
  searchEnemy( (villages) => {

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
          "controller": "farmList",
          "action": "createList",
          "params": {"name": `${name} ${i}`},
          "session": token
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



               let listObjEdit = {
                 "controller":"farmList",
                 "action":"editList",
                 "params": {"name": name+body.cache[0].data.cache[0].data.listId,"listId":body.cache[0].data.cache[0].data.listId},
                 "session":token
               };


               let optionsEdit = {
                 method: 'POST',
                 headers: {
                   'content-type': 'application/json;charset=UTF-8'
                 },
                 serverDomain: serverDomain,
                 json: true,
                 body: listObjEdit
               };


               httpRequest(optionsEdit)
               .then(
                   (body) => {}
               );

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
function heroChecker(villages, count, session, villageId, troops) {

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
            "controller": "troops",
            "action": "send",
            "params":
              {
                "destVillageId": villages[i],
                "villageId": villageId,
                "movementType": 6,
                "redeployHero": false,
                "units": troops,
                "spyMission": "resources"
              },
            "session": session
          };

          console.log(requestPayload)

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
              if (body && body.response && body.response.errors || body && body.error && body.error.message) {
                console.log(body.response.errors || body.error.message);
              }

              console.log(body)

              console.log('scaner sent')

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
function shareReports(obj){
  let bodyReports = {
    "controller":"reports",
    "action":"getLastReports",
    "params":{
      "collection":"own",
      "start":obj.start,
      "count":obj.maxCount,
      "filters":obj.filters,
      "alsoGetTotalNumber":true
    },
    "session": obj.session
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
            "controller":"reports",
            "action":"shareReport",
            "params":{
              "id": report._id.$id,
              "shareWith":"secretSociety",
              "shareParam":0,
              "shareMessage":"",
              "collection":"own"
            },
            "session":obj.session
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
  searchEnemy( (villages) => {
    asyncLoop(
      villages.length,
      (loop) => {
        let i = loop.iteration();

        let requestPayload = {
          "controller": "troops",
          "action": "send",
          "params":
            {
              "destVillageId": villages[i].villageId,
              "villageId": paramsAttack.villageId,
              "movementType": 6,
              "redeployHero": false,
              "units": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 1,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 0,
                "9": 0,
                "10": 0,
                "11": 0
              },
              "spyMission": "resources"
            },
          "session": paramsAttack.session
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
            "controller": "reports",
            "action": "getLastReports",
            "params": {
              "collection": "search",
              "start": 0,
              "count": 10,
              "filters": [
                "15", "16", "17",
                {"villageId": villages[i].villageId}
              ],
              "alsoGetTotalNumber": true
            },
            "session": paramsAttack.session
          }
        };

        httpRequest(lastReportPayload).then(
          (body) => {
            console.log(body);
            let rand = fixedTimeGenerator(6) + randomTimeGenerator(3);

            if (body.response && body.response.errors){
              console.log("Выход так как закончилась разведка".warn);
              loop.break();
            }

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

/**
 *
 * @param object
 * attackList object
 *
 */

function scanAndShareInSS(object){

  setInterval(() => {
    attackList(object.attackList.filter, object.attackList.x, object.attackList.y, object.attackList.paramsAttack);
    setTimeout(() => {
      shareReports(
        {
          session: "9c3e553cacf981fe633b",
          start: 0,
          maxCount: 50,
          filters: ["15"]
        }
      );
    }, 3600 * 1000);

    setTimeout(() => {
      shareReports(
        {
          session: "9c3e553cacf981fe633b",
          start: 0,
          maxCount: 50,
          filters: ["15"]
        }
      );
    }, 3600 * 2000);

    setTimeout(() => {
      shareReports(
        {
          session: "9c3e553cacf981fe633b",
          start: 0,
          maxCount: 50,
          filters: ["15"]
        }
      );
    }, 3600 * 3000);

    setTimeout(() => {
      shareReports(
        {
          session: "fb19e77c6732b2fa5bda",
          start: 0,
          maxCount: 50,
          filters: ["15"]
        }
      );
    }, 3600 * 4000);
  }, 4 * 3600 * 1000);
  attackList(withoutKingdomsFilter2, 20, -32, {
    villageId: 535871508
  });

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
//
// attackList(neutrals, -17, 7, {villageId: 537116655, session: '98fdfe0adc4a55be5b8c'});
// setInterval(() => {
//   attackList(neutrals, -17, 7, {villageId: 537116655, session: '98fdfe0adc4a55be5b8c'});
// }, 4 * 3600 * 1000);

// attackList(Ducheeze, 4, 27);
// setTimeout(() => {
//
// attackList(Aero, 29, 10);
// attackList(BS, -17, 7, {villageId: 537116655});
// attackList(GoD, 29, 10);
// attackList(High5Inc, 29, 10);
// attackList(Bandits, 29, 10);
// attackList(Kelt, 29, 10);
// attackList(GF, 29, 10);
//
// }, 3600 * 2000)
//

// TODO: Вынести в отдельную функцию.
// attackList(WiC, -11, -31, {villageId: 535871477});
// setInterval(() => {
//   attackList(neutrals, -17, -7, {villageId: 537116655});
// }, 3600 * 2000)
// attackList(SNGFilter, -11, -31, {villageId: 535871477});



// shareReports(n

/**
 * Автобилд войнов
 */
// autoUnitsBuild('537444343', {11: 30}, {16: 3}, 2400, 1200, '320fc3a8c39d4edd7bdb');
autoUnitsBuild('537051121', {3: 14}, {5: 12}, 3600, 200, 'd8efc425263d11d0f4a3');
autoUnitsBuild('536756212', {3: 14}, {5: 12}, 3600, 200, 'd8efc425263d11d0f4a3');
autoUnitsBuild('536821756', {3: 14}, {5: 12}, 3600, 200, 'ef403b0afd590accf790');

/**
 * Добавления юнитов по улсовиям
 */
//
// farmListCreator('60-149/', '0', '0', deathsFilterFrom60To150);
// setTimeout(() => {
//   farmListCreator('150/'  , '0', '0', deathsFilterFrom150);
// }, 100 * 1000);

/**
 * Фармлисты
 */
//
// setTimeout(() => {
//   autoFarmList(2200, 600, listPayload.Starlord ,         'com2', true);
//   autoFarmList(2200, 600, listPayload.Starlord2 ,         'com2', true);
// }, 300 * 1000);
//
// setTimeout(() => {
//   autoFarmList(3000, 600, listPayload.ann , 'ru1', true);
//   autoFarmList(3000, 600, listPayload.ann2, 'ru1', true);
//   autoFarmList(3000, 600, listPayload.ann3, 'ru1', true);
//   autoFarmList(3000, 600, listPayload.ann4, 'ru1', true);
// }, 200 * 1000)
//
// setTimeout(() => {
//   autoFarmList(2200, 600, listPayload.Pashgun ,          'com2', true);
// }, 100 * 1000);
// setTimeout(() => {
//   autoFarmList(2200, 600, listPayload.Pashgun2 ,          'com2', true);
// }, 200 * 1000);
// setTimeout(() => {
//   autoFarmList(2200, 600, listPayload.Pashgun3 ,          'com2', true);
// }, 300 * 1000);
//
// setTimeout(()=>{
//   autoFarmList(1800, 600, listPayload.Rin ,              'com2', true);
// }, 500 * 1000);
//
// setTimeout(()=>{
//   autoFarmList(1800, 600, listPayload.wahlbergScript ,      'com2', true);
//   autoFarmList(1800, 600, listPayload.wahlbergExploit ,      'com2', true);
//   autoFarmList(1800, 600, listPayload.wahlbergCheats ,      'com2', true);
// }, 400 * 1000);
//
// setTimeout(()=>{
//   autoFarmList(2200, 600, listPayload.YourPapa, 'com2', true);
//   autoFarmList(2200, 600, listPayload.abaddon, 'com2', true);
//   autoFarmList(2200, 600, listPayload.astaroth, 'com2', true);
// autoFarmList(1800, 600, listPayload.Diuse ,            'com2', true);
// }, 200 * 1000);
//
// setTimeout(()=>{
//   autoFarmList(2200, 600, listPayload.quasi, 'com2', true);
//   autoFarmList(2200, 600, listPayload.hysteria, 'com2', true);
// }, 700 * 1000);
//
// autoFarmList(2200, 600, listPayload.engal, 'com2', true);
//
//
//
// setTimeout(()=> {
//   autoFarmList(1000, 300, listPayload.wahlbergSpeed, 'ru1x3', true);
//   autoFarmList(1000, 300, listPayload.desertir, 'ru1x3', true);
//   autoFarmList(1000, 300, listPayload.desertir2, 'ru1x3', true);
// }, 600);

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
// heroChecker([536920052, 536920054], 13, "75f543b65fa424807b92", 537051127,{
//   "1": 0,
//   "2": 0,
//   "3": 1,
//   "4": 0,
//   "5": 0,
//   "6": 0,
//   "7": 0,
//   "8": 0,
//   "9": 0,
//   "10": 0,
//   "11": 0
// });
// heroChecker([536920052], 20, "fc72068edad847816372", 537083889, {
//   "1": 0,
//   "2": 0,
//   "3": 1,
//   "4": 0,
//   "5": 0,
//   "6": 0,
//   "7": 0,
//   "8": 0,
//   "9": 0,
//   "10": 0,
//   "11": 0
// });
// heroChecker([535838712], 100, "f192292c4346c1fead7a", 537247743);


/**
 * Автобот
 */

// new Autobot();

/**
 * Крокодилы
 */
// setInterval(function() {
//   getMapInfo('animal', token, serverDomain, timeForGame);
// }, 600000);
// getMapInfo('animal', token, serverDomain, timeForGame);

/**
 * Кроп
 */
// getMapInfo('crop', token, serverDomain, timeForGame, 1556);
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
