const UnitTypes = {
    1: 'Legioner',
    2: 'Pretorian',
    3: 'Imperian',
    4: 'Scouts',
    5: 'Imperator',
    6: 'Ceserian',
    7: 'TapaH',
    8: 'Catapult',
    // Germany
    11: 'Clubswinger',
    12: 'Spearfighter',
    13: 'Axefighter',
    14: 'Scout',
    15: 'Paladin',
    16: 'Teutons',
    17: 'TapaH',
    18: 'Catapult',
    // Gauls
    21: 'Phalanx',
    22: 'Swordsman',
    23: 'Scout',
    24: 'Thunder',
    25: 'Druids',
    26: 'Eduins',
    27: 'TapaH',
    28: 'Catapult'
};

const Unit = {
    Rome: {
        Legioner: 1,
        Pretorian: 2,
        Imperian: 3,
        Scout: 4,
        Imperator: 5,
        Ceserian: 6,
        TapaH: 7,
        Catapult: 8
    },
    German: {
        Clubswinger: 11,
        Spearfighter: 12,
        Axefighter: 13,
        Scout: 14,
        Paladin: 15,
        Teutons: 16,
        TapaH: 17,
        Catapult: 18
    },
    Gauls: {
        Phalanx: 21,
        Swordsman: 22,
        Scout: 23,
        Thunder: 24,
        Druids: 25,
        Eduins: 26,
        TapaH: 27,
        Catapult: 28
    }
};

class UnitsBuildSetup {
    constructor() {
        this.Barracks = {};
        this.Stables = {};
        this.Workshop = {};
        this.GreatBarracks = {};
        this.GreatStables = {};
    }
}

module.exports = {
    UnitTypes: UnitTypes,
    Unit: Unit,
    UnitsBuildSetup: UnitsBuildSetup
};

