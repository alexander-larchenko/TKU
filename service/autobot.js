/**
 * Created by allin_000 on 15.04.2017.
 */

const Tick = require("./tick.js");
const Api = require("./api.js");
const colors = require('colors');

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

class AutoBot{

    get iteration() {
      return this._iteration;
    }

    set iteration(value) {
      this._iteration = value;
    }

    get tick() {
      return this._tick;
    }

    set tick(value) {
      this._tick = value;
    }

    get auth() {
      return this._auth;
    }

    set auth(value) {
      this._auth = value;
    }

    get api() {
      return this._api;
    }

    set api(value) {
      this._api = value;
    }

    get gameObject() {
      return this._gameObject;
    }

    set gameObject(value) {
      this._gameObject = value;
    }

    constructor(timeOfTick, authObject, gameObject){
        this.tick = new Tick(timeOfTick);
        this.iteration = 0;
        this.auth = authObject;
        this.api = new Api(authObject);
        this.gameObject = gameObject;

        let iterationBot = ()=>{
            this.tick.newRand(timeOfTick);
            this.tick.newNextStepTime(timeOfTick);
            this.bot();
        };

        iterationBot();
        setInterval(iterationBot, this.tick.rand)
    }


    /**
     * Все ниже гетерсы и сетеры относят к аутоЮнитсБилд
     */
    get getAllObject() {
      return this._getAllObject;
    }

    set getAllObject(value) {
      this._getAllObject = value;
    }

    get location() {
      return this._location;
    }
    
    set location(value) {
      this._location = value;
    }

    get player() {
      return this._player;
    }

    set player(value) {
      this._player = value;
    }

    get unitQueue() {
      return this._unitQueue;
    }

    set unitQueue(value) {
      this._unitQueue = value;
    }

    getAll(){
        let getAllOptions = {
            method: 'POST',
            body: {"controller":"player","action":"getAll","params":{deviceDimension: "1920:1080"},"session":this.auth.session},
        };

        return this.api
            .httpRequest(getAllOptions)
            .then(
                (body) => {
                    this.getAllObject = body;

                    this.location = {};
                    this.getAllObject.cache.forEach((item) => {
                        if (item.name === `Collection:Building:${this.gameObject.villageId}`){
                            item.data.cache.forEach((building) => {
                                //Конюшня
                                if(building.data.buildingType == "20"){
                                    this.location.stable = building.data.locationId;
                                }
                                //Казарма
                                if(building.data.buildingType == "19"){
                                    this.location.barack = building.data.locationId;
                                }
                            })
                        }

                        if (item.name === `UnitQueue:${this.gameObject.villageId}`){
                            this.unitQueue = item.data
                        }

                        if (item.name.split(':')[0] === 'Player'){
                            this.player = item.data;
                        }

                    });
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    autoUnitsBuild(villageId){

        // this.

        /**
         * Rome
         * 1 - Legioner
         * 2 - Pretorian
         * 3 - Imperian
         * 4 - Scouts
         * 5 - Imperator
         * 6 - Ceserian
         *
         * Germany
         * 11 - Clubswinger
         * 12 - Spearfighter
         * 13 - Axefighter
         * 14 - Scout
         * 15 - Paladin
         * 16 - Teutonic knight
         *
         * Gauls
         * 21 - Phalanx
         * 22 - Swordsman
         * 23 - Scout
         * 24 - Thunder T
         * 25 - Druids
         * 26 - Eduins
         */

        let tactics = this.gameObject.strategy.split(':');
        let warriors;

        if (tactics[1] === 'warrior' && tactics[2] === 'defence'){

            if (this.player.tribeId == 1) {
                warriors = [2, 4];
            } else
            if (this.player.tribeId == 2){
                warriors = [12, 14]
            } else
            if (this.player.tribeId == 3){
                warriors = [21, 25]
            } else {
                console.error('NEW RACE HAS BEEN ADD')
            }
        }


        let timeOfBuild = {};
        for (let location in this.unitQueue.buildingTypes) {
            let buildUnitQueue = this.unitQueue.buildingTypes[location];
            timeOfBuild[location] = buildUnitQueue[buildUnitQueue.length-1].timeFinishedLast - Date.now()/1000;
        }

        console.log(timeOfBuild);

        if (this.location.barack){
            let barackOptions = {
                body: {
                    "controller":"building",
                    "action":"recruitUnits",
                    "params":{
                        "villageId":villageId,
                        "locationId":this.location.barack,
                        "buildingType":19,
                        "units":unitsBarack
                    },
                    "session":this.auth.session
                },
            };

            this.api
                .httpRequest(barackOptions)
                .then(
                    (body) => {
                        console.log('barack');
                        // console.log(body)
                    },
                    (error) => {
                        console.log(error);
                    }
                );
        }

        if (this.location.stable) {
            let stableOptions = {
                method: 'POST',
                body: {"controller":"building","action":"recruitUnits","params":{"villageId":villageId,"locationId":this.location.stable,"buildingType":20,"units":unitsStable},"session":this.auth.session},
            };

            this.api
                .httpRequest(stableOptions)
                .then(
                    (body) => {

                        console.log('stable')
                        // console.log(body)
                    },
                    (error) => {
                        console.log(error);
                    }
                );
        }
    }


    bot(){
        this.iteration++;

        if (!this.getAllObject){
            this.getAll()
                .then(()=>{
                    this.autoUnitsBuild(this.gameObject.villageId);
                });
        } else {
            this.autoUnitsBuild(this.gameObject.villageId);
        }
        console.log('next Interation'.info);
    }
}

new AutoBot(
    1000,
    {
        session: '2c33691dd2aa4de0e791',
        server:  'com3',
        cookie:  'gl5SessionKey=%7B%22key%22%3A%22149fb3a50a16ed530d8a%22%2C%22id%22%3A%2221176%22%7D; gl5PlayerId=21176; t5mu=iFWVXtUTyI0VX5EM; t5SessionKey=%7B%22key%22%3A%222c33691dd2aa4de0e791%22%2C%22id%22%3A%222692%22%7D; t5socket=%22client58f33d1d485ae%22; msid=9osobm64oc4qdp8uutgti5pte0; village=535576592'
    },
    {
        villageId: 536035362,
        strategy: 'build:warrior:defence'
    }
);



