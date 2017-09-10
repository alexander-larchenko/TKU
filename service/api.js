const rp = require('request-promise');
const colors = require('colors');

module.exports = class Api {
    get authSession() {
      return this._authSession;
    }

    set authSession(value) {
      this._authSession = value;
    }

    constructor(authObject){
        this.authSession = authObject;
    }

    /**
     * Проставляет заголовки из конфига, требуется для защиты
     * @param serverDomain
     * @param cookie
     * @returns {{content-type: string, Cookie: *, Host: string, Origin: string, Pragma: string, Referer: string, User-Agent: string}}
     */
    setHttpHeaders(opt){
        return {
            'Content-Type' : (opt.method == 'GET')?'application/x-www-form-urlencoded':'application/x-www-form-urlencoded',
            'Cookie' : this.authSession.cookie,
            'Host': this.authSession.server+'.kingdoms.com',
            'Origin': 'http://'+this.authSession.server+'.kingdoms.com',
            'Content-Length':JSON.stringify(opt.body).length,
            'Pragma':'no-cache',
            'Referer': 'http://'+this.authSession.server+'.kingdoms.com',
            'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
        }
    }

    /**
     * http request для травиан кингдомса, возвращает колбек ответа
     * @param opt
     */
    httpRequest(opt){
        let bodyStr = JSON.stringify(opt.body);

        let options = {
            headers: this.setHttpHeaders(opt),
            method: opt.method || 'POST',
            uri: `http://${this.authSession.server}.kingdoms.com/api/?c=${opt.body.controller}&a=${opt.body.action}&t${Date.now()}`,
            body: JSON.stringify(opt.body),
            json: true
        };

        //RP - request promise, return deffered object.
        return rp(options);
    }
};