function Users() {

    this.Coss = {
        session: 'a4c8415945b8b3d69f28',
        village: '536723478',
        village2: '536690708',
        village3: '536789008',
        village4: '536723475',
        village5: '536592403',
        village6: '536854537',
        serverDomain: 'ru3x3',
        cookie: 't5mu=HJWM1YTTKZjcLdFM; CookieConsent={stamp:%27oyu8X/qe3/KfCz+Ow3za8DxMH2p4RYtXEu4vYdMEnCaBMAKcu3pmBg==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603671008647%2Cregion:%27ua%27}; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603749710190%7D; _ga=GA1.2.1713705520.1604534467; _fbp=fb.1.1604534466767.1715183015; __cmpconsent10995=CO9CdzxO9CdzxAfSDBRUBACgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcu10995=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcu10995=__51__; __cmpconsentx17155=CO9Gjc9O9Gjc9AfSDBRUBACgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcx17155=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcx17155=__51__; msid=53tgen8uik4mvf0pkqcam3ei92; gl5SessionKey=%7B%22key%22%3A%22d4af0ae6d389a0fcc665%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; t5SessionKey=%7B%22key%22%3A%22a4c8415945b8b3d69f28%22%2C%22id%22%3A%221880%22%7D; t5socket=%22client5fba9e42613f3%22'
    };

    this.Fanta = {
        session: 'd55d3e4c8b707223c350',
        village: '536690709',
        village2: '536657940',
        serverDomain: 'ru3x3',
        cookie: 't5mu=HJWM1YTTKZjcLdFM; CookieConsent={stamp:%27oyu8X/qe3/KfCz+Ow3za8DxMH2p4RYtXEu4vYdMEnCaBMAKcu3pmBg==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603671008647%2Cregion:%27ua%27}; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603749710190%7D; _ga=GA1.2.1713705520.1604534467; _fbp=fb.1.1604534466767.1715183015; __cmpconsent10995=CO9CdzxO9CdzxAfSDBRUBACgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcu10995=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcu10995=__51__; __cmpconsentx17155=CO9Gjc9O9Gjc9AfSDBRUBACgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcx17155=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcx17155=__51__; _gid=GA1.2.1724952473.1605847287; gl5SessionKey=%7B%22key%22%3A%22c05f9f30ea65349b5a21%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; msid=77aompfm22ipkhagv589crj041; t5SessionKey=%7B%22key%22%3A%22d55d3e4c8b707223c350%22%2C%22id%22%3A%221160%22%7D; t5socket=%22client5fb77cd8e5042%22'
    };


    this.CossTest = {
        session: 'daa25217cafd5186d479',
        village: '536559629',
        serverDomain: 'test',
        cookie: '_ga=GA1.2.1713705520.1604534467; _fbp=fb.1.1604534466767.1715183015; t5mu=mRiYHl3YyVUdTpWR; desktopNotifications=%7B%22action%22%3A%22cancel%22%2C%22timestamp%22%3A1605826038235%7D; msid=53tgen8uik4mvf0pkqcam3ei92; gl5SessionKey=%7B%22key%22%3A%22d4af0ae6d389a0fcc665%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; village=536559629; t5SessionKey=%7B%22key%22%3A%22daa25217cafd5186d479%22%2C%22id%22%3A%22390%22%7D; t5socket=%22client5fba9d64c160d%22'
    }

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
