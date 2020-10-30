function Users() {

    this.Coss = {
        session: '89aa471eadfe548c8259',
        village: '536723478',
        serverDomain: 'ru3x3',
        cookie: '_ga=GA1.2.1937481018.1603714734; _gid=GA1.2.2139920815.1603714734; gl5SessionKey=%7B%22key%22%3A%22d7f25f38dc4f850ab82f%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; t5mu=5gUSttEN6RmaSxkd; _fbp=fb.1.1603720345645.1751764459; t5SessionKey=%7B%22key%22%3A%2289aa471eadfe548c8259%22%2C%22id%22%3A%221880%22%7D; CookieConsent={stamp:%27UrfNRUgeRbL4SFjZWM32B1ZPTxqQokVxLMc4eaS50+EEdaR3BBLXuw==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603720498934%2Cregion:%27ua%27}; msid=fjre9fs7pk3hgdcgodnsrim8j3; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603794496484%7D; t5socket=%22client5f9c758a0db73%22; village=536723478'
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
