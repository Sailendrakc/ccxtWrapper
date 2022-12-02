import { olhcData } from "./olhcData.js";
import { SymbolObj } from "./SymbolObj.js";
import { utilities } from "./utility.js";

export default class Market {
    constructor() {
        window.ccxtpro = window.ccxt.pro;
        console.log(ccxt.exchanges);
        this.exchanges = new Map();
        //this.GetAllPairsAcrossSelectedExchanges();
    }

    async getOlhcData(symbolObj, intervalStr, fromMSIncl) {
        //now check if symbolobj is symbolobj type

        if (!(symbolObj instanceof SymbolObj)) {
            throw new Error("Invalid Symbol Object");
        }

        let intervalMs = utilities.getIntervalMSfromIntervalString(intervalStr);

        //now get the exchange name and check if the exchange exists 
        let exName = symbolObj.getExchangeString();
        let ex = await this.getExchange(exName);

        //also maybe verify the asset pair and market exists in the exchagne.

        //now check formMSincl and get the data.
        let toDateMs = new Date().getTime();
        toDateMs -= toDateMs % intervalMs;

        if (!fromMSIncl) {
            fromMSIncl = toDateMs - (100 * intervalMs);
        }
        fromMSIncl += (intervalMs - (fromMSIncl % intervalMs));
        let symbol = symbolObj.getPairString();
        let key = symbol + ":" + intervalStr;
        let amountPerRequest = 100;

        //see if the data or portion of data already exist.
        //then prepare to be fetched data parameters accordingly. ---------------------
        if (!ex.fetchedData) {
            ex.fetchedData = {};
        }
        if (ex.fetchedData[key]) {
            if (fromMSIncl >= ex.fetchedData[key].oldestDate) {
                return ex.fetchedData[key];
            }
            else {
                toDateMs = ex.fetchedData[key].oldestDate - intervalMs;
            }
        }

        let dataHolder = [];
        while (fromMSIncl <= toDateMs) {
            //request 100 candlestick datas.
            if (!ex.has['fetchOHLCV']) {
                console.log("The exchange does not supports fething ohlcv");
                return null;
            }

            let remainingDataCount = (toDateMs - fromMSIncl) / intervalMs + 1;
            if (remainingDataCount < amountPerRequest) {
                amountPerRequest = remainingDataCount;
            }

            let candles;
            try {
                candles = await ex.fetchOHLCV(symbol, intervalStr, fromMSIncl, amountPerRequest, null);
            }
            catch (e) {
                console.log("Error:");
                console.log(e);
            }
            if (!candles) {
                console.log("candle data is null returning");
                return null;
            }
            dataHolder = dataHolder.concat(candles);

            if (parseInt(dataHolder[0][0]) > fromMSIncl) {
                console.log("fromdate Parm too old:" + fromMSIncl.toString() + " repaced with: " + candles[0][0]);
                fromMSIncl = parseInt(candles[0][0]);
            }

            fromMSIncl += (amountPerRequest * intervalMs);

            if (fromMSIncl > toDateMs) {
                break;
            }

        }

        if (dataHolder.length == 0) {
            return null;
        }
        console.log("Len of candles in this request is: " + dataHolder.length);
        let tempOldestDate = parseInt(dataHolder[0][0]);

        //add it to data structure
        if (!ex.fetchedData[key]) {
            ex.fetchedData[key] = new olhcData(tempOldestDate, new Map(), intervalMs);
        }

        var requestedDataMap = utilities.toNonStringObjMap(dataHolder);
        ex.fetchedData[key].dataMap = new Map([...ex.fetchedData[key].dataMap, ...requestedDataMap]);
        ex.fetchedData[key].oldestDate = tempOldestDate < ex.fetchedData[key].oldestDate ? tempOldestDate : ex.fetchedData[key].oldestDate;

        //console.log(ex.fetchedData[key]);
        return new olhcData(ex.fetchedData[key].oldestDate, requestedDataMap, intervalMs);

    }

    //this function will load 200 more older data than that is in the dataset already.
    async getMoreOlderOlhcData(symbolObj, intervalStr, moreAmount) {
        if (!(symbolObj instanceof SymbolObj)) {
            throw new Error("Invalid Symbol Object");
        }

        //now get the exchange name and check if the exchange exists 
        let exName = symbolObj.getExchangeString();
        let ex = await this.getExchange(exName);

        let intervalMs = utilities.getIntervalMSfromIntervalString(intervalStr);
        let key = symbolObj.getPairString() + ":" + intervalStr;
        let amountForRequest = 200;
        if (moreAmount && moreAmount > 0) {
            amountForRequest = moreAmount;
        }
        amountForRequest += 1; //adjusted 
        let validFromMs = new Date().getTime();

        //now check if we have similar data in dataset.
        if (!ex.fetchedData) { ex.fetchedData = {} }
        if (!ex.fetchedData[key]) {
            validFromMs = validFromMs - (amountForRequest * intervalMs);
        }
        else {
            validFromMs = ex.fetchedData[key].oldestDate - (amountForRequest * intervalMs);
        }

        try {
            let candleDataObj = await this.getOlhcData(symbolObj, intervalStr, validFromMs);
            return candleDataObj;
        }
        catch (e) {
            console.log("Error:");
            console.log(e);
        }

    }

    async watchTicker(symbolObj, callback, params) {
        //now check if symbolobj is symbolobj type

        if (!(symbolObj instanceof SymbolObj)) {
            throw new Error("Invalid Symbol Object");
        }

        //now get the exchange name and check if the exchange exists 
        let exName = symbolObj.getExchangeString();
        let ex = await this.getExchange(exName);

        if (ex.has['watchTicker']) {
            while (true) {
                try {
                    const ticker = await ex.watchTicker(symbolObj.getPairString(), params)
                    callback(ticker);
                } catch (e) {
                    console.log(e)
                    // stop the loop on exception or leave it commented to retry
                    // throw e
                }
            }
        }
    }

    async getExchange(exString) {
        var exchange = this.exchanges.get(exString);
        if (!exchange) {
            if (!ccxt.exchanges.includes(exString)) {
                throw new Error("Exchange not supported: " + exString);
            }

            exchange = new ccxtpro[exString]();
            this.exchanges.set(exString, exchange);
            exchange.fetchedData = {};
            await exchange.loadMarkets();
        }
        //console.log(exchange);
        return exchange;
    }

    //future experimental features for easy UI
    async GetAllPairsAcrossSelectedExchanges() {
        //selected exchanges - okx, kraken, kucoin, binance
        //get only okx atm

        this.allPairs = [];

        var okxEx = new ccxtpro.okx();
        this.exchanges.set("okx", okxEx);

        for (var pairName in okxEx.ids) {
            this.allPairs.push(pairName + "#okx");
        }

        await okxEx.loadMarkets();

        //okxEx.ids is what we want.
        console.log(okxEx);
    }

    //future experimental features for UI easy
    SearchAssetPair(searchTxt) {
        //search across all ids of loaded markets.
        var searchResult = [];
        var re = "/" + searchTxt + "/";
        for (var pairName in this.allPairs) {
            //check if the regx matches
            if (pairName.test(re)) {
                searchResult.push(pairName);
            }
        }

        return searchResult;
    }

}

