import { SymbolObj } from "./SymbolObj.js";
import CandleData from "./CandleData.js";

export const utilities = {
    getIntervalMSfromIntervalString(intervalString) {
        if (intervalString === "1m") {
            return 60000;
        }

        if (intervalString === "5m") {
            return 5 * 60000;
        }

        if (intervalString === "15m") {
            return 15 * 60000;
        }

        if (intervalString === "30m") {
            return 30 * 60000;
        }

        if (intervalString === "1h") {
            return 60 * 60000;
        }

        if (intervalString === "4h") {
            return 4 * 60 * 60000;
        }

        if (intervalString === "1d") {
            return 24 * 60 * 60000;
        }

        if (intervalString === "1w") {
            return 7 * 24 * 60 * 60000;
        }

        if (intervalString === "1M") {
            return 4 * 7 * 24 * 60 * 60000;
        }

        throw new Error("Invalid interval string : " + intervalString);
    },


    createSymbol(pair1, pair2, exchange, market) {
        if (!pair1 || !pair2 || !exchange || !market) {
            throw new Error("symbol cannot be created, invalid parameters");
        }

        return new SymbolObj(pair1, pair2, exchange, market);
    },

    toNonStringObjMap(array) {
        if (!(array instanceof Array)) {
            throw new Error("the object to parse needs to be arrray.");
        }
        let newArr = new Map();

        array.forEach(element => {
            var cls = new CandleData(element);
            newArr.set(cls.time, cls);
        });

        return newArr;
    }
}

