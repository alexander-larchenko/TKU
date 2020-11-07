const Users = require('./users');

function FarmLists() {

    this.Coss_NightFarm = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [780], 'villageId': +Users.Coss.village},
        'session': Users.Coss.session,
        'server': Users.Coss.serverDomain
    };
}

module.exports = new FarmLists();
