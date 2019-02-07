function Users() {

    this.Coss = {
        session: '774e6c9c7ab71d5c8bc0',
        village: '535707618'
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
