function Users() {

    this.Coss = {
        session: 'e4c0dfed8ca8eeda2074',
        village: '536723478',
        serverDomain: 'ru3x3',
        cookie: 'gl5SessionKey=%7B%22key%22%3A%22bc12fd37bd22a4b245bf%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; t5mu=HJWM1YTTKZjcLdFM; CookieConsent={stamp:%27oyu8X/qe3/KfCz+Ow3za8DxMH2p4RYtXEu4vYdMEnCaBMAKcu3pmBg==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603671008647%2Cregion:%27ua%27}; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603749710190%7D; village=536723478; _fbp=fb.1.1604228082013.824762430; msid=q4sug0cju0h6a9m2oh4k7vnpl0; t5SessionKey=%7B%22key%22%3A%22e4c0dfed8ca8eeda2074%22%2C%22id%22%3A%221880%22%7D; _ga=GA1.2.592890789.1604228172; _gid=GA1.2.37321234.1604228172; _gat=1; t5socket=%22client5f9e944c9a149%22'
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
