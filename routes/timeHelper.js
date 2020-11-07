function TimeHelper() {

    this.getTravianTimeParam = function() {
        return 't' + Date.now();
    }

    this.logDate = function (dateIn) {
        const date = dateIn || new Date();
        return `${date.toLocaleDateString()} ${date.toTimeString().substring(0, 8)}`;
    }

    this.fixedTimeGenerator = function(seconds) {
        //Точное кол-во seconds секунд
        return parseInt(1000 * seconds);
    }

    this.randomTimeGenerator = function(seconds) {
        //Рандом число в пределах seconds секунд
        return parseInt(getRandomInt(-1000, 1000) * seconds);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = new TimeHelper();
