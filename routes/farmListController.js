const TimeHelper = require('./timeHelper');
const Utils = require('./utils');
const RequestHelper = require('./requestHelper');

function FarmListController () {

    function getFarmListsPayload (farmListIds, user, village) {
        return {
            'controller': 'troops',
            'action': 'startFarmListRaid',
            'params': {'listIds': farmListIds, 'villageId': + (village || user.village)},
            'session': user.session,
            'serverDomain': user.serverDomain
        };
    }

    const FarmListReportNotificationType = {
        Green: 1,
        Yellow: 2,
        Red: 3
    }

    function getMinUnitsAmountByPopulation(population) {
        return Math.max(1, Math.round(population / 50) * 3);
    }

    function checkOnStatus(farmListsResponse, listPayload, user, fn) {

        Utils.asyncLoop(
            farmListsResponse.cache.length,
            (loopList) => {

                let i = loopList.iteration();

                let farmListId = farmListsResponse.cache[i].name.split(':')[2];

                Utils.asyncLoop(
                    farmListsResponse.cache[i].data.cache.length,
                    (loop) => {

                        let j = loop.iteration();

                        let villageLog = farmListsResponse.cache[i].data.cache[j];
                        const entryId = villageLog.data.entryId;
                        const villageUnits = villageLog.data.units;
                        const villageId = villageLog.data.villageId;

                        // console.log('Checking log for village: ', villageLog.data.villageName);

                        if (!villageLog || !villageLog.data || !villageLog.data.lastReport) {

                            loop.next();

                        } else if (villageLog.data.lastReport.notificationType == FarmListReportNotificationType.Green) {

                            // console.log('Green Log')

                            const lastReportData = villageLog.data.lastReport;
                            const rate = +lastReportData.raidedResSum / +lastReportData.capacity;

                            // console.log(`Bounty ${lastReportData.raidedResSum} Capacity ${lastReportData.capacity} Rate ${rate}`);

                            if (rate >= 1) {
                                const maxUnits = 1000;
                                let needUpdateUnits = false;
                                for (let unitKey in villageUnits) {
                                    let unitsAmount = +villageUnits[unitKey];
                                    if (unitsAmount === 0) {
                                        //nothing?
                                    } else if (unitsAmount < maxUnits) {
                                        // console.log(`Increasing units +1 (${unitsAmount}) > (${unitsAmount + 1})`)
                                        villageUnits[unitKey] = unitsAmount + 1;
                                        needUpdateUnits = true;
                                    } else {
                                        // console.log(`Already max units on this ride (${maxUnits})`);
                                    }
                                }

                                if (needUpdateUnits) {
                                    RequestHelper.editFarmListEntryTroops(entryId, villageUnits, user)
                                        .finally(() => loop.next());
                                } else {
                                    loop.next();
                                }

                            } else if (rate < 0.7) {

                                const minUnitAmount = getMinUnitsAmountByPopulation(+villageLog.data.population);
                                // console.log(`Minimal (${minUnitAmount}) for this population (${villageLog.data.population})`);
                                let needUpdateUnits = false;
                                for (let unitKey in villageUnits) {
                                    let unitsAmount = +villageUnits[unitKey];
                                    if (unitsAmount > 1) {
                                        if (unitsAmount > minUnitAmount) {
                                            // console.log(`Decreasing units -1 (${unitsAmount}) > (${unitsAmount - 1})`)
                                            villageUnits[unitKey]--;
                                            needUpdateUnits = true;
                                        } else if (unitsAmount < minUnitAmount) {
                                            // console.log(`Got less units (${unitsAmount}) than minimal (${minUnitAmount}). Updating.`)
                                            villageUnits[unitKey] = minUnitAmount;
                                            needUpdateUnits = true;
                                        }
                                    }
                                }

                                if (needUpdateUnits) {
                                    RequestHelper.editFarmListEntryTroops(entryId, villageUnits, user)
                                        .finally(() => loop.next());
                                } else {
                                    loop.next();
                                }

                            } else {
                                loop.next();
                            }

                            // Эта логика вызывала последние 10 отчетов и анализировала их

                            // RequestHelper.getLastReportsForVillage(villageLog.data.villageId,  user)
                            //     .then(body => {
                            //
                            //         let capacity = 0, bounty = 0;
                            //
                            //         if (body.errors) {
                            //             console.log(body)
                            //         }
                            //
                            //         if (body && body.response && body.response.reports) {
                            //
                            //             console.log('Report Data:\n', body.response.reports);
                            //
                            //             body.response.reports.forEach((item) => {
                            //                 bounty += item.bounty;
                            //                 capacity += item.capacity;
                            //             });
                            //
                            //             let rel = bounty / capacity;
                            //
                            //             console.log(`Bounty ${bounty} Capacity ${capacity} Rate ${rel}`);
                            //
                            //             // TODO handling was here
                            //         } else {
                            //             loop.next();
                            //         }
                            //
                            //     })
                            //     .catch(error => {
                            //         console.log('Failed to get last reports for village\n', error);
                            //     })

                        } else if (villageLog.data.lastReport.notificationType == FarmListReportNotificationType.Yellow) {

                            console.log('Yellow Log')

                            console.log(JSON.stringify(villageLog.data.lastReport));

                            // todo analyze report and mark cell as Farm -1/2/3

                            RequestHelper.toggleFarmListVillage(villageId, farmListId, user)
                                .then(() => {
                                    RequestHelper.toggleFarmListVillage(villageId, farmListId, user)
                                        .then(()=> {
                                            console.log('Re-added village to reset units');
                                        })
                                        .finally(() => loop.next())
                                }).catch(()=> loop.next());

                        } else if (villageLog.data.lastReport.notificationType == FarmListReportNotificationType.Red) {

                            console.log('Red Log')

                            RequestHelper.toggleFarmListVillage(villageId, farmListId, user)
                                .then(() => {
                                    RequestHelper.toggleFarmListVillage(villageId, farmListId, user)
                                        .then(()=> {
                                            console.log('Re-added village to reset units');
                                        })
                                        .finally(() => loop.next())
                                }).catch(()=> loop.next());

                        } else {
                            console.log(`Странный лог`, villageLog.data.lastReport);
                        }
                    },
                    () => {
                        loopList.next();
                    }
                );

            },
            () => {
                console.log(TimeHelper.logDate() + ' Фармлист запуcк: listIds[' + listPayload.params.listIds + ']');
                fn(listPayload);
            }
        )
    }

    /**
     * Требуется рефакторинг и доработка
     */
    function autoFarmList(fixedTime, farmListIds, user, specificVillage) {

        const randomTime = 10;
        const village = specificVillage || user.village;
        const listPayload = getFarmListsPayload(farmListIds, user, village)

        let startFarmListRaid = (listPayload) => {

            RequestHelper.startFarmList(listPayload, user).then(
                () => {
                    console.log(TimeHelper.logDate() + ' Фармлист отправлен listIds[' + listPayload.params.listIds + ']');
                },
                (err) => {
                    console.log('Произошла ошибка при отправке фармлиста');
                    console.log(err);
                }
            );
        };

        let checkList = (listPayload) => {

            console.log(TimeHelper.logDate() + ' Фармлист проверка listIds[' + listPayload.params.listIds + ']');

            function start() {

                let now = new Date();
                let rand = TimeHelper.fixedTimeGenerator(fixedTime) + TimeHelper.randomTimeGenerator(randomTime);
                let dateNext = new Date(now.valueOf() + rand);

                RequestHelper.getFarmListDetails(listPayload, user)
                    .then(
                        (farmListDetailsResponse) => {

                            if (!farmListDetailsResponse.cache) {
                                console.log(farmListDetailsResponse);
                            } else {

                                checkOnStatus(farmListDetailsResponse, listPayload, user, startFarmListRaid.bind(null, listPayload));

                                setTimeout(start, rand);
                            }

                        },
                        (error) => {
                            console.log('Failed to get Farm List Details\n', error);
                        }
                    )

                console.log(TimeHelper.logDate() + ` Фармлист ${listPayload.params.listIds} следующий запуск: ` + TimeHelper.logDate(dateNext));
            }
            start();
        };

        checkList(listPayload);
    }

    this.autoFarmList = autoFarmList;
}

module.exports = new FarmListController();
