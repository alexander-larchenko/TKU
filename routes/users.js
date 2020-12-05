function Users() {

    this.Coss = {
        session: '4f5d3f47c89c7e407c6f',
        village: '536723478',
        village2: '536690708',
        village3: '536789008',
        village4: '536723475',
        village5: '536592403',
        village6: '536854537',
        village7: '536952836',
        village8: '536821765',
        village9: '536920074',
        village10: '536461333',
        village11: '536952837',
        village12: '537051161',
        village13: '536625187',
        serverDomain: 'ru3x3',
        cookie: 't5mu=HJWM1YTTKZjcLdFM; CookieConsent={stamp:%27oyu8X/qe3/KfCz+Ow3za8DxMH2p4RYtXEu4vYdMEnCaBMAKcu3pmBg==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603671008647%2Cregion:%27ua%27}; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603749710190%7D; _ga=GA1.2.1713705520.1604534467; _fbp=fb.1.1604534466767.1715183015; msid=6dimqoui9pmvi48u4mimlvsic0; gl5SessionKey=%7B%22key%22%3A%22d0bdca310a6bb1aa788b%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; __cmpconsentx17155=CO90wgOO90wgOAfSDBRUBCCgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcx17155=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcx17155=__51__; t5SessionKey=%7B%22key%22%3A%224f5d3f47c89c7e407c6f%22%2C%22id%22%3A%221880%22%7D; t5socket=%22client5fc8dfd8dff0e%22'
    };

    this.Fanta = {
        session: 'a96c83830a56c886ac26',
        village: '536690709',
        village2: '536657940',
        serverDomain: 'ru3x3',
        cookie: '__cmpconsentx17155=CO92Nt5O92Nt5AfSDBRUBCCgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcx17155=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcx17155=__51__; gl5SessionKey=%7B%22key%22%3A%2212007476e33605c68acb%22%2C%22id%22%3A%221168898%22%7D; gl5PlayerId=1168898; msid=4cc9c00vrro713uegetbmkqnu5; t5mu=HNHTvVGMtlEcGZTM; t5SessionKey=%7B%22key%22%3A%22a96c83830a56c886ac26%22%2C%22id%22%3A%221160%22%7D; t5socket=%22client5fc8e2d8eecf6%22; village=536690709; desktopNotifications=%7B%22action%22%3A%22cancel%22%2C%22timestamp%22%3A1607000953327%7D'
    };

    this.Acrom = {
        session: '04ae6f45ca2acd1cb200',
        villageWonder: '536887296',
        serverDomain: 'ru3x3',
        cookie: '__cmpconsentx17155=CO92Nt5O92Nt5AfSDBRUBCCgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcx17155=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcx17155=__51__; gl5SessionKey=%7B%22key%22%3A%2212007476e33605c68acb%22%2C%22id%22%3A%221168898%22%7D; gl5PlayerId=1168898; msid=4cc9c00vrro713uegetbmkqnu5; t5mu=HNHTvVGMtlEcGZTM; t5SessionKey=%7B%22key%22%3A%22a96c83830a56c886ac26%22%2C%22id%22%3A%221160%22%7D; t5socket=%22client5fc8e2d8eecf6%22; desktopNotifications=%7B%22action%22%3A%22cancel%22%2C%22timestamp%22%3A1607000953327%7D'
    }


    this.CossTest = {
        session: 'c071a20070ebc3dafe46',
        village: '536559629',
        serverDomain: 'test',
        cookie: '_ga=GA1.2.1713705520.1604534467; _fbp=fb.1.1604534466767.1715183015; t5mu=mRiYHl3YyVUdTpWR; msid=6dimqoui9pmvi48u4mimlvsic0; desktopNotifications=%7B%22action%22%3A%22cancel%22%2C%22timestamp%22%3A1606767427877%7D; gl5SessionKey=%7B%22key%22%3A%22d0bdca310a6bb1aa788b%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; t5SessionKey=%7B%22key%22%3A%22c071a20070ebc3dafe46%22%2C%22id%22%3A%22390%22%7D; __cmpconsentx17155=CO90wgOO90wgOAfSDBRUBCCgAAAAAAAAAAigAAANzgAgNzAA; __cmpcvcx17155=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcx17155=__51__; t5socket=%22client5fc8dfdd48d1f%22'
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
