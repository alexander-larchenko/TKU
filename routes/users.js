function Users() {

    this.Coss = {
        session: '4acd123b8825c06a0dd6',
        village: '536559629',
        serverDomain: 'ru3x3',
        cookie: '_ga=GA1.2.1010753338.1603161017; _fbp=fb.1.1603161016745.937629505; gl5SessionKey=%7B%22key%22%3A%22bc12fd37bd22a4b245bf%22%2C%22id%22%3A%221140788%22%7D; gl5PlayerId=1140788; _gid=GA1.2.255776107.1603670972; t5SessionKey=%7B%22key%22%3A%224acd123b8825c06a0dd6%22%2C%22id%22%3A%221880%22%7D; t5mu=HJWM1YTTKZjcLdFM; CookieConsent={stamp:%27oyu8X/qe3/KfCz+Ow3za8DxMH2p4RYtXEu4vYdMEnCaBMAKcu3pmBg==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cver:1%2Cutc:1603671008647%2Cregion:%27ua%27}; msid=q4sug0cju0h6a9m2oh4k7vnpl0; village=536559629; t5socket=%22client5f97460b9c041%22; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1603749710190%7D'
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
