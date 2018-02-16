export class TimeInterval {
    constructor(interval, func) {
        this.__interval = interval;
        this.__func = func;
        this.__canCall = true;
    }

    get func() {
        return (data) => {
            if (this.__canCall) {
                this.__canCall = false;
                this.__func(data);
                setTimeout(function() {
                    this.__canCall = true;
                }.bind(this), this.__interval * 1000);
            }
        }
    }
}