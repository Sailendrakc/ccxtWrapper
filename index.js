import Market from "./Market.js";
import { utilities } from "./utility.js";

var MarketObj;
var exchange;

async function GetTickerFromOkx() {
    console.log("Listening tickers of okex");
    while (true) {
        var data = await exchange.watchTicker("BTC/USDT:USDT");
        console.log(data);
    }
}

async function init1() {

    window.ccxtpro = ccxt.pro;
    exchange = new ccxtpro.okx();

    while (true) {
        var data = await exchange.watchTicker("BTC/USDT:USDT");
        console.log("Got ticker data");
        console.log(data);
    }
}

function init2(tickerdata) {

    console.log(tickerdata);
}

async function init3() {

    MarketObj = new Market();
    let sym = utilities.createSymbol("BTC", "USDT", "okx", "SWAP");
    console.log("pair string is:" + sym.getPairString());
    let recData = await MarketObj.getMoreOlderOlhcData(sym, "15m");
    console.log("Printing receivved olhc data");
    console.log(recData);
    console.log("Printed");

    let recData1 = await MarketObj.getMoreOlderOlhcData(sym, "15m");
    console.log("Printing receivved olhc data");
    console.log(recData1);
    console.log("Printed");

    let recData2 = await MarketObj.getMoreOlderOlhcData(sym, "15m", 50);
    console.log("Printing receivved olhc data");
    console.log(recData2);
    console.log("Printed");

    //let recData1 = await MarketObj.watchTicker(sym, init2);

}


init3();
