module.exports = class Tick{

    constructor(time){
        this.newRand(time);
        this.newNextStepTime();
    }

    get rand() {
        return this._rand;
    }

    set rand(value) {
        this._rand = value;
    }

    get NextStepTime() {
        return this._NextStepTime;
    }

    set NextStepTime(value) {
        this._NextStepTime = value;
    }

    /** Генераторы времени
     * @param seconds
     * @returns {Number}
     */
    newRand(time){
        this.rand = this.fixedTimeGenerator(time) + this.randomTimeGenerator(time/3);
    }

    newNextStepTime(time){
        this.NextStepTime = new Date(new Date().valueOf() + new Date() + this.rand);
    }

    fixedTimeGenerator(seconds) {
        //Точное кол-во seconds секунд
        return parseInt(1000 * seconds);
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomTimeGenerator(seconds) {
        //Рандом число в пределах seconds секунд
        return parseInt(this.getRandomInt(-1000, 1000) * seconds);
    }
};