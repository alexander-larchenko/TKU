const rp = require('request-promise');
const Users = require('./users');
const defaultUser = Users.Coss;

function RequestHelper() {

    // Get Last Reports for village

    this.getLastReportsForVillage = function (villageId, user) {

        let toggleBody = {
            'controller': 'reports',
            'action': 'getLastReports',
            'params': {
                'collection': 'search',
                'start': 0,
                'count': 10,
                'filters': ['124', {'villageId': villageId}],
                'alsoGetTotalNumber': true
            },
            'session': user.session
        };

        let options = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true,
            body: toggleBody,
            serverDomain: user.serverDomain
        };

        return httpRequest(options);
    }

    // Edit Farm List Entry Troops

    this.editFarmListEntryTroops = function (entryId, units, user) {
        let editTroopsBody = {
            'controller': 'farmList',
            'action': 'editTroops',
            'params': {
                'entryIds': [parseInt(entryId)],
                'units': units
            },
            'session': user.session
        };

        let editTroopsOptions = {
            method: 'POST',
            json: true,
            body: editTroopsBody,
            serverDomain: user.serverDomain
        };

        return httpRequest(editTroopsOptions);
    }

    // Toggle Farm List Village

    this.toggleFarmListVillage = function (villageId, farmListId, user) {
        let toggleVillageBody = {
            'controller': 'farmList',
            'action': 'toggleEntry',
            'params': {
                'villageId': villageId,
                'listId': farmListId
            },
            'session': user.session
        };

        let toggleVillageOption = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true,
            body: toggleVillageBody,
            serverDomain: user.serverDomain
        };

        return httpRequest(toggleVillageOption);
    }

    // Start Farm List

    this.startFarmList = function (listPayload, user) {
        let startFarmListOptions = {
            serverDomain: user.serverDomain,
            body: listPayload
        };

        return httpRequest(startFarmListOptions);
    }

    // Get Farm List Details Response

    this.getFarmListDetails = function (listPayload, user) {
        let getFarmListCacheBody = {
            'controller': 'cache',
            'action': 'get',
            'params': {
                names: listPayload.params.listIds.map(id => `Collection:FarmListEntry:${id}`)
            },
            'session': user.session
        };

        let getFarmListCacheOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true,
            body: getFarmListCacheBody,
            serverDomain: user.serverDomain
        };

        return httpRequest(getFarmListCacheOptions);
    }

    /**
     * http request для травиан кингдомса, возвращает promise
     * @param opt: request options
     */
    function httpRequest (opt) {
        let timeForGame = 't' + Date.now();

        let options = {
            headers: setHttpHeaders(opt.serverDomain, opt.cookie || defaultUser.cookie, JSON.stringify(opt.body).length),
            method: opt.method || 'GET',
            uri: `https://${opt.serverDomain}.kingdoms.com/api/?c=${opt.body.controller}&a=${opt.body.action}&${timeForGame}`,
            body: opt.body,
            json: true
        };

        return rp(options);
    }

    /**
     * Проставляет заголовки из конфига, требуется для защиты
     * @returns {{content-type: string, Cookie: *, Host: string, Origin: string, Pragma: string, Referer: string, User-Agent: string}}
     */
    function setHttpHeaders (serverDomain, cookie, contentLength) {

        return {
            'accept': 'application/json, text/plain, */*',
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

    this.httpRequest = httpRequest;
}

module.exports = new RequestHelper();
