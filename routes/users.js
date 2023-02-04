function Users() {

    this.Coss = {
        session: '57414462fac5be33985b',
        clientId: '63dd7c7e21f77',
        cookie: '__cmpconsentx17155=CPmPa7APmPa7AAfSDBENC1CgAP_AAH_AAAigJLNf_X__b3_v-_7___t0eY1f9_7__-0zjhfdt-8N3f_X_L8X_2M7vF36tr4KuR4ku3bBIUdtHOncTUmx6olVrzPsb02cr7NKJ_Pkmnsbe2dYGH9_n9_z-ZKZ7______7__________________________________________________________________9___BJZr_6__7e_9_3_f__9ujzGr_v_f__2mccL7tv3hu7_6_5fi_-xnd4u_VtfBVyPEl27YJCjto507iak2PVEqteZ9jemzlfZpRP58k09jb2zrAw_v8_v-fzJTPf______f__________________________________________________________________v__4AA; __cmpcccx17155=aBPmR99-gAwAzADcDuAAIABgAHgAUABYADoALgAwABqADoAPQAgACKAEgASgAoABcADEAGgAPIAgACCAEkAJoAVwAvQB7AHwAQ4AxACCgEaAI6ATgA0IByQG-gOCAcSA5IB5YD0QIOAQ2AiSBEwCKAFgQLMgWiAt6BcEC4YGagM8AahA68CHQERAI3wSMAkoBMECY4E3gKFAUaAIBdVC72F8WL-4v9BkujKsMr4cig6ZiAjF2KUFEqa1tvG3Ctw63EFuIm4jtyU3JYA; _ga=GA1.2.564880542.1674837212; _gid=GA1.2.479764944.1675458996; gl5SessionKey=%7B%22key%22%3A%2233601cff0e15db5abbfa%22%2C%22id%22%3A%221142177%22%7D; gl5PlayerId=1142177; msid=13nmg9hnmonusel1phtkbc4421; t5SessionKey=%7B%22key%22%3A%2257414462fac5be33985b%22%2C%22id%22%3A%22249%22%7D; t5mu=5RmxXKsJ5vaI; village=538394616',
        village: '538394616',
        coords: { x: -8, y: 46 },
        village2: '538427383',
        //village3: '536789008',
        //village4: '536723475',
        // village5: '536592403',
        // village6: '536854537',
        // village7: '536952836',
        // village8: '536821765',
        // village9: '536920074',
        // village10: '536461333',
        // village11: '53695283722',
        // village12: '537051161',
        // village13: '536625187',
        serverDomain: 'testx5'
    };

    this.AlexCoss = {
        session: 'bed92f4f147b4430fd49',
        clientId: '63dd7e0726b74',
        cookie: '__cmpcc=1; __cmpconsentx17155=CPmmffAPmmffAAfSDBENC2CgAAAAAAAAAAigAAAAAAAA; __cmpcccx17155=aBPmpsrwgAAAAAA; gl5SessionKey=%7B%22key%22%3A%22a2e027af3bab09f7843a%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; msid=ibeo2njvd1evn7qsr459952t00; t5SessionKey=%7B%22key%22%3A%22bed92f4f147b4430fd49%22%2C%22id%22%3A%22833%22%7D; t5mu=iM5A4LBeHbrs; village=536625141',
        village: '536625141',
        coords: { x: -11, y: -8 },
        serverDomain: 'es2x3'
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
