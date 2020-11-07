function Utils() {

    /**
     * Асинх луп, служит для итераций после колбека. Важно для эмуляции действий пользователя - так как есть возможность добавить 400 деревней за 2 секунду, но это немного палевно
     * @param iterations
     * @param func
     * @param callback
     * @returns {{next: loop.next, iteration: loop.iteration, break: loop.break}}
     */
    this.asyncLoop = function(iterations, func, callback) {
        let index = 0;
        let done = false;
        let loop = {
            next: () => {
                if (done) {
                    return;
                }

                if (index < iterations) {
                    index++;
                    func(loop);

                } else {
                    done = true;
                    callback();
                }
            },

            iteration: () => {
                return index - 1;
            },

            break: () => {
                done = true;
                callback();
            }
        };
        loop.next();
        return loop;
    }

}

module.exports = new Utils();
