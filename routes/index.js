const express = require('express');
const router = express.Router();
const _ = require('underscore');
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

const RequestHelper = require('./requestHelper');
const FarmListController = require('./farmListController');
const MapHelper = require('./mapHelper');
const TimeHelper = require('./timeHelper');
const Utils = require('./utils');

//user data
const Users = require('./users');
const UnitsHelper = require('./units');
const UnitTypes = UnitsHelper.UnitTypes;
const Unit = UnitsHelper.Unit;
const UnitsBuildSetup = UnitsHelper.UnitsBuildSetup;

const defaultUser = Users.Coss;
let serverDomain = defaultUser.serverDomain;


const delay = process.env.npm_config_delay !== undefined ? +process.env.npm_config_delay : 0;


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

        Utils.asyncLoop(
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

function autoUnitsBuild(villageId, UnitsSetup, fixedTime, randomTime, session) {
    let rand = TimeHelper.fixedTimeGenerator(fixedTime) + TimeHelper.randomTimeGenerator(randomTime);
    let stillHaveResources = true;
    let buildUntilNoResourcesLeft = process.env.npm_config_ner !== undefined;
    const withCropControl = process.env.npm_config_withcrop !== undefined;
    const buildLessOnIteration = process.env.npm_config_less !== undefined;


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

        // console.log('Buildings placed: ', JSON.stringify(Buildings));
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

                                if (buildLessOnIteration) {

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
                                    console.log('Not enough resources. Skipping...')
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

                        if (currentCropAmount / cropCapacity > 0.95 &&
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
    Coss_1: process.env.npm_config_build == '1',
    Coss_2: process.env.npm_config_build == '2',
    Coss_3: process.env.npm_config_build == '3',
};

//=============================================================

function main() {
    if (Tasks.heroChecker) {
        heroChecker([535838712], 100, Users.DOGMA.session, Users.DOGMA.village1);
    }

    if (Tasks.build) {
        const buildInterval = 1743;
        resourceIteration = 655;

        if (BuildForVillage.Coss_1) {
            var unitsCoss1 = new UnitsBuildSetup();
            unitsCoss1.Barracks[Unit.Gauls.Swordsman] = 20;
            unitsCoss1.Stables[Unit.Gauls.Thunder] = 15;
            //unitsCoss1.Workshop[Unit.Gauls.Catapult] = 6;
            // unitsCossMain.GreatBarracks[Unit.Rome.Imperian] = 25;
            // unitsCossMain.GreatStables[Unit.Rome.Ceserian] = 5;

            autoUnitsBuild(Users.Coss.village, unitsCoss1, buildInterval, 10, Users.Coss.session);

            //initResourcesGatheringStrategy(Users.Coss.session, 5000, [1, 1, 1, 0]);
        }

        if (BuildForVillage.Coss_2) {
            var unitsCoss2 = new UnitsBuildSetup();
            unitsCoss2.Barracks[Unit.Gauls.Phalanx] = 22;
            unitsCoss2.Stables[Unit.Gauls.Druids] = 8;

            autoUnitsBuild(Users.Coss.village2, unitsCoss2, buildInterval, 10, Users.Coss.session);
        }

        if (BuildForVillage.Coss_3) {
            var unitsCoss3 = new UnitsBuildSetup();
            unitsCoss3.Barracks[Unit.Gauls.Phalanx] = 22;
            unitsCoss3.Stables[Unit.Gauls.Scout] = 16;

            autoUnitsBuild(Users.Coss.village3, unitsCoss3, buildInterval, 10, Users.Coss.session);
        }
    }

    if (Tasks.heroResources) {
        initResourcesGatheringStrategy(Users.Coss.session, 1440, [1, 1, 1, 0]);
    }

    if (Tasks.cropControl) {
        cropControl(Users.Coss.session, Users.Coss.village);
    }

    /**
     * Животные в оазисах
     */
    if (Tasks.animals) {
        setInterval(function () {
            MapHelper.getAnimalsData(defaultUser);
        }, 635000);
        MapHelper.getAnimalsData(defaultUser);
    }

    /** Пометить Девятки Пятнашки */
    if (Tasks.cropMap9_15) {
        // getMapInfo('crop', defaultUser.session, serverDomain);
    }

    /**
     * Фармлисты
     */
    if (Tasks.farm) {

        function farm0() {
            FarmListController.autoFarmList(1229, [780], defaultUser);
        }

        switch (process.env.npm_config_farm) {
            case '0' : { farm0(); break; }
            case 'all':
            default: {
                farm0();
            }
        }
    }
}

if (delay > 0) {
    console.log(`Delaying ${delay} min until ${TimeHelper.logDate((new Date()).valueOf() + delay * 1000 * 60)}`);
}
setTimeout(main, delay);

module.exports = router;
