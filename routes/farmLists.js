const Users = new (require('./users'))();

function FarmLists() {

    this.Coss_0 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [1043], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    };
}

module.exports = FarmLists;
