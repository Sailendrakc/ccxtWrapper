export class olhcData {
    constructor(_oldestDate, _dataMap, _intervalMS) {

        this.oldestDate = _oldestDate instanceof Number ? _oldestDate && _oldestDate > 0 : new Date().getTime();
        this.dataMap = _dataMap instanceof Map ? _dataMap : new Map();
        this.intervalMS = _intervalMS instanceof Number && _intervalMS > 0 ? _intervalMS : 15 * 60 * 1000; //15m
    }
}