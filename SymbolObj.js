export class SymbolObj {

    constructor(asset1, asset2, exchange, market) {

        //maybe do input validation, TODO later

        this.exchange = exchange.trim();
        this.asset1 = asset1.trim();
        this.asset2 = asset2.trim();
        this.market = market.trim();
    }

    getPairString() {
        //return string form of the pair like 
        //BTC-USDT:SWAP
        return this.asset1 + "-" + this.asset2 + "-" + this.market;
    }

    getExchangeString() {
        return this.exchange;
    }
}