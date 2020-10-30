const Users = new (require('./users'))();

function FarmLists() {

    this.Coss_5_10 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [721], 'villageId': +Users.Coss.village},
        'session': Users.Coss.session,
        'server': Users.Coss.serverDomain
    };

    this.Coss_17_26 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [723], 'villageId': +Users.Coss.village},
        'session': Users.Coss.session,
        'server': Users.Coss.serverDomain
    };
}

module.exports = FarmLists;
