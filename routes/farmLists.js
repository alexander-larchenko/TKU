const Users = new (require('./users'))();

function FarmLists() {

    this.Coss_0 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [1043], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    };

    this.Coss_Kiril1 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2139], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    };

    this.Coss_Kiril2 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2140], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    };

    this.Coss_Alice1 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2141], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    };

    this.Coss_Alice2 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2142], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    };

    this.Coss_Petka1 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2143], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    };

    this.Coss_Petka2 = {
        'controller': 'troops',
        'action': 'startFarmListRaid',
        'params': {'listIds': [2144], 'villageId': Users.Coss.village},
        'session': Users.Coss.session,
        'server': 'ru1x3'
    }
}

module.exports = FarmLists;
