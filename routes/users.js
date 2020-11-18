function Users() {

    this.Coss = {
        session: 'aa4b444badce6b2ea630',
        village: '536723478',
        village2: '536690708',
        village3: '536789008',
        village4: '536723475',
        village5: '536592403',
        village6: '536854537',
        serverDomain: 'ru3x3',
        cookie: 't5mu=HJWM1YTTKZjcLdFM; CookieConsent={stamp:%27oyu8X/qe3/KfCz+Ow3za8DxMH2p4RYtXEu4vYdMEnCaBMAKcu3pmBg==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603671008647%2Cregion:%27ua%27}; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603749710190%7D; _ga=GA1.2.1713705520.1604534467; _fbp=fb.1.1604534466767.1715183015; gl5SessionKey=%7B%22key%22%3A%22d8fa68cde36134d8a7f1%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; msid=rmcpjn807qfepd7340qf6a95c1; __cmpconsent10995=CO9CdzxO9CdzxAfSDBRUBACgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcu10995=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcu10995=__51__; t5SessionKey=%7B%22key%22%3A%22aa4b444badce6b2ea630%22%2C%22id%22%3A%221880%22%7D; t5socket=%22client5fb510aebe07b%22'
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

module.exports = new Users();
