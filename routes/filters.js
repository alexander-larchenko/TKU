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
