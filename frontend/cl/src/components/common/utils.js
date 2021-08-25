class Utils {
    constructor() {}

    _debounce(cb, timeout) {
        if (this.timeId) {
            //some event happened within timeout
            clearTimeout(this.timeId);
        }
        this.timeId = setTimeout(() => {
            cb();
        }, timeout);
    }
}

let util = null;

function getUtil() {
    if (util == null) {
        util = new Utils();
    }
    return util;
}
export default getUtil();
