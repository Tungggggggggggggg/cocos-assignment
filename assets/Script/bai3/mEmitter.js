import EventEmitter from "events";
class mEmitter {
    constructor() {
        this._emitter = new EventEmitter();
        this._emitter.setMaxListeners(100);
    }

    emit(...args) {
        this._emitter.emit(...args);
    }

    registerEvent(event, listener) {
        this._emitter.on(event, listener);
    }

    removeEvent(event, listener) {
        this._emitter.removeListener(event, listener);
    }
}

mEmitter.instance = new mEmitter();
export default mEmitter;
