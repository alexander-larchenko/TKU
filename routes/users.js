function Users() {

    this.Coss = {
        session: 'f28c1dcf5e4441f4887b',
        village: '536723478',
        village2: '536690708',
        village3: '536789008',
        serverDomain: 'ru3x3',
        cookie: 'gl5SessionKey=%7B%22key%22%3A%22d7f25f38dc4f850ab82f%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; t5mu=5gUSttEN6RmaSxkd; CookieConsent={stamp:%27UrfNRUgeRbL4SFjZWM32B1ZPTxqQokVxLMc4eaS50+EEdaR3BBLXuw==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603720498934%2Cregion:%27ua%27}; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603794496484%7D; _fbp=fb.1.1604320012595.165006896; _ga=GA1.2.1576029194.1604397409; _gid=GA1.2.553461372.1604397409; msid=fjre9fs7pk3hgdcgodnsrim8j3; t5SessionKey=%7B%22key%22%3A%22f28c1dcf5e4441f4887b%22%2C%22id%22%3A%221880%22%7D; village=536789008; _gat=1; t5socket=%22client5fa1b3a8ee850%22'
    };

    this.getUserNameBySession = (session) => {
        let userKeys = Object.keys(this);
        let userName = 'UnknownUser';
        userKeys.forEach((userKey) => {
            let user = this[userKey];
            if (user.hasOwnProperty('session') && user['session'] == session) {
                userName = userKey;
            }
        });
        return userName;
    }
}

module.exports = Users;
