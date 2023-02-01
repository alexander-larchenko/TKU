const request = require('request');
const TimeHelper = require('./timeHelper');
const Utils = require('./utils');
const Users = require('./users');
const RequestHelper = require('./requestHelper');
const _ = require('underscore');

function MapHelper() {

    function getApiKey(user) {

        const userName = Users.getUserNameBySession(user.session).toLowerCase();
        const email = `${userName}@gmail.com`;
        const siteName = `the${userName}`;
        const siteUrl = `https://the${userName}.com`;
        const getApiKeyURL = `https://${user.serverDomain}.kingdoms.com/api/external.php?action=requestApiKey&email=${email}&siteName=${siteName}&siteUrl=${siteUrl}&public=true`;

        return new Promise((resolve, reject) => {
            request.get({
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                url: getApiKeyURL
            }, (error, response, body) => {

                if (error) {
                    console.log('Failed to get api key:\n', JSON.stringify(error));
                    reject(error);
                }

                const bodyParsed = JSON.parse(body);

                if (bodyParsed && bodyParsed.response && bodyParsed.response.privateApiKey) {

                    resolve(bodyParsed.response.privateApiKey)

                } else {

                    console.log('Not Fount private API KEY in response (body.response.privateApiKey)\n', bodyParsed);
                    reject('Not Found Api Key In Response')

                }
            })
        });
    }

    // apiData = {
    //     gameworld: null,
    //     players: null,
    //     alliances: null,
    //     map: null,
    //     fromGame: null,
    //     crop: null
    // };
    function getOpenAPIData(user) {

        return new Promise((resolve, reject) => {

            getApiKey(user).then((apiKey) => {

                request.get({
                    headers: {'content-type': 'application/x-www-form-urlencoded'},
                    url: 'https://' + user.serverDomain + '.kingdoms.com/api/external.php?action=getMapData&privateApiKey=' + apiKey
                }, (error, response, body) => {

                    if (error) {
                        console.log('Failed to get OPEN API data:\n', JSON.stringify(error));
                        reject(error);
                    }

                    resolve(JSON.parse(body));
                })

            }).catch(reject)
        })
    }

    function getMapInfo (user) {

        return new Promise((resolve, reject) => {

            if (!user || !user.session || !user.serverDomain) {
                console.log('Missing User/session/server params!')
                reject('Missing User/session/server params!')
            }

            getOpenAPIData(user).then((openApiData) => {

                resolve(openApiData);

            }).catch(reject)
        })
    }

    // Анализ животных в оазисах
    this.getAnimalsData = function (user) {

        function oasisDetailsRequest(oasisIdsArray) {

            let oasisDetailsRequestParams = {
                'controller': 'cache',
                'action': 'get',
                'params': {'names': oasisIdsArray},
                'session': user.session
            };

            return new Promise((resolve, reject) => {

                request.post({
                    headers: {'Content-Type': 'application/json'},
                    url: 'https://' + user.serverDomain + '.kingdoms.com/api/?c=cache&a=get&' + TimeHelper.getTravianTimeParam(),
                    body: JSON.stringify(oasisDetailsRequestParams)
                }, (error, response, body) => {

                    if (error) {
                        console.log('Failed to get Oasis Detailed data from cache\n', JSON.stringify(error));
                        reject(error);
                    }

                    resolve(JSON.parse(body))
                })

            })

        }

        getMapInfo(user).then(openApiData => {

            // Get Details About Oasis
            const mapCells = openApiData.response.map.cells;
            let oasisIdsArray = [];
            mapCells.forEach((mapCell) => {
                if (mapCell.oasis.toString() !== '0') {
                    oasisIdsArray.push(mapCell.id)
                }
            })
            oasisIdsArray = oasisIdsArray.map(id => `MapDetails:${id}`);

            oasisDetailsRequest(oasisIdsArray).then(oasisDetailsBody => {
                const oasisDetailsCache = oasisDetailsBody.cache;

                let oasisDetailsData = [];
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

                oasisDetailsCache.forEach((oasisCache) => {

                    const oasisTroops = oasisCache.data.troops;

                    let avgAllDpsInfantry = 0;
                    let avgAllDpsMounted = 0;
                    let troopsCounter = 0;
                    let minTroopsCounter = 1000000;
                    let toIntUnits = 0;
                    let counterAnimalType = 0;

                    for (let counterUnits in oasisTroops.units) {
                        if (oasisTroops.units.hasOwnProperty(counterUnits)) {
                            toIntUnits = parseInt(oasisTroops.units[counterUnits], 10);
                            if (toIntUnits !== 0 &&
                                minTroopsCounter > toIntUnits) {
                                minTroopsCounter = toIntUnits;
                            }
                            if (toIntUnits) {
                                counterAnimalType++
                            }
                            troopsCounter += toIntUnits;
                            avgAllDpsInfantry += oasisTroops.units[counterUnits] * defenseTable[counterUnits - 1].Infantry;
                            avgAllDpsMounted += oasisTroops.units[counterUnits] * defenseTable[counterUnits - 1].Mounted;
                        }
                    }

                    avgAllDpsInfantry = (avgAllDpsInfantry / troopsCounter).toFixed(1);
                    avgAllDpsMounted = (avgAllDpsMounted / troopsCounter).toFixed(1);

                    // if (avgAllDpsInfantry < 100 || avgAllDpsMounted < 100) {
                    //     return;
                    // }

                    if (avgAllDpsInfantry.length < 5) {
                        avgAllDpsInfantry = '0' + avgAllDpsInfantry
                    }

                    if (avgAllDpsMounted.length < 5) {
                        avgAllDpsMounted = '0' + avgAllDpsMounted
                    }

                    if (troopsCounter === 0) {
                        return;
                    }

                    const oasisMapCell = mapCells.find((cell) => cell.id === oasisCache.data.troops.villageId);

                    const oasisData = {
                        x: oasisMapCell.x,
                        y: oasisMapCell.y,
                        animal: oasisTroops.units,
                        counterAnimalType: counterAnimalType,
                        avgAllDps: avgAllDpsInfantry + '/' + avgAllDpsMounted,
                        avgAllDpsInfantry: avgAllDpsInfantry,
                        avgAllDpsMounted: avgAllDpsMounted,
                        distance: 0
                    }

                    if (user.coords) {
                        oasisData.distance = Math.sqrt(
                            Math.pow(Math.abs(oasisMapCell.x - user.coords.x), 2) + Math.pow(Math.abs(oasisMapCell.y - user.coords.y), 2)
                        ).toFixed(1);
                    }

                    oasisDetailsData.push(oasisData);
                })

                oasisDetailsData = _.sortBy(oasisDetailsData, 'avgAllDpsInfantry').reverse();

                const AnimalsById = {
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

                console.log(TimeHelper.logDate(), ' Animal Data Updated');

                // Rich oasis to capture
                const averageMinDps = 150;
                const filteredOasisDetailsData = oasisDetailsData.filter(oasisData => oasisData.avgAllDpsInfantry >= averageMinDps || oasisData.avgAllDpsMounted >= averageMinDps);
                if (filteredOasisDetailsData.length) {

                    console.log('\x1b[31m%s\x1b[0m', `We Have ${averageMinDps}+ Animals to capture`);

                    filteredOasisDetailsData.forEach(richOasisData => {

                        let log = `[${richOasisData.avgAllDpsInfantry}|${richOasisData.avgAllDpsMounted}](${richOasisData.counterAnimalType}) on  (${richOasisData.x}|${richOasisData.y}), distance:${richOasisData.distance}`;

                        Object.keys(richOasisData.animal).forEach((key) => {
                            let name = AnimalsById[+key];
                            log += `{${name}: ${richOasisData.animal[key]}} `;
                        });

                        console.log(log);
                    })

                } else {
                    console.log(TimeHelper.logDate(), `No Rich Oasis with ${averageMinDps}+ animals`);
                }

                // Low oasis to farm
                const maxAvgDpsForFarm = 30;
                const oasisForFarmData = oasisDetailsData.filter(oasisData => oasisData.avgAllDpsInfantry < maxAvgDpsForFarm && oasisData.distance < 25);
                if (oasisForFarmData.length) {

                    console.log('\x1b[31m%s\x1b[0m', `We Have ${maxAvgDpsForFarm}+ Animals to farm`);

                    if (oasisForFarmData.distance < 10) {
                        oasisForFarmData.distance = '0' + oasisForFarmData.distance;
                    }

                    const sortedOasisForFarmData = _.sortBy(oasisForFarmData, 'distance');

                    sortedOasisForFarmData.forEach(oasisData => {
                        let log = `[${oasisData.avgAllDpsInfantry}|${oasisData.avgAllDpsMounted}](${oasisData.counterAnimalType}) on  (${oasisData.x}|${oasisData.y}), distance:${oasisData.distance}`;

                        Object.keys(oasisData.animal).forEach((key) => {
                            let name = AnimalsById[+key];
                            log += `{${name}: ${oasisData.animal[key]}} `;
                        });

                        console.log(log);
                    })
                }

            }).catch(console.log)
        })
    }

    // Пометить кроповые клетки 9 15
    this.markCropCells = function (user) {
        // before run - make this call in browser and save ownerId/targetId
        // from payload.params.

        function crop(mapCellsData) {

            Utils.asyncLoop(
                mapCellsData.length,
                (loop) => {

                    let i = loop.iteration();

                    let obj = mapCellsData[i];

                    if (obj.resType == '3339' && obj.oasis == 0 && obj.kingdomId == 0) {

                        //9ka добавлена
                        console.log('9ka')

                        //TODO: owner ID make is variable
                        let listObj = {
                            'controller': 'map',
                            'action': 'editMapMarkers',
                            'clientId': user.clientId,
                            'params': {
                                'markers': [
                                    {
                                        'owner': 1,
                                        'type': 3,
                                        'color': 3,
                                        'editType': 3,
                                        'ownerId': 833,
                                        'targetId': obj.id
                                    }
                                ],
                                'fieldMessage': {
                                    'text': '',
                                    'type': 5,
                                    'duration': 12,
                                    'cellId': obj.id,
                                    'targetId': 833
                                }
                            },
                            'session': user.session
                        };

                        let options = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json;charset=UTF-8'
                            },
                            serverDomain: user.serverDomain,
                            json: true,
                            body: listObj
                        };

                        RequestHelper.httpRequest(options)
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
                            'clientId': user.clientId,
                            'params': {
                                'markers': [
                                    {
                                        'owner': 1,
                                        'type': 3,
                                        'color': 10,
                                        'editType': 3,
                                        'ownerId': 833,
                                        'targetId': obj.id
                                    }
                                ],
                                'fieldMessage': {
                                    'text': '',
                                    'type': 5,
                                    'duration': 12,
                                    'cellId': obj.id,
                                    'targetId': 833
                                }
                            },
                            'session': user.session
                        };

                        let options = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json;charset=UTF-8'
                            },
                            serverDomain: user.serverDomain,
                            json: true,
                            body: listObj
                        };

                        RequestHelper.httpRequest(options)
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

        getMapInfo(user).then(openApiData => {
            const mapCells = openApiData.response.map.cells;
            crop(mapCells)
        });
    }

}

module.exports = new MapHelper();
