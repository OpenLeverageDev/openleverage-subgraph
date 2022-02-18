import {BigDecimal, log, BigInt, ValueKind} from "@graphprotocol/graph-ts"
import {
  Lever,
  Liquidation,
  MarginTrade,
  TradeClosed
} from "../../generated/Lever/Lever"
import {Bundle, Factory, Market, Pair, Token, TradeRecord} from "../../generated/schema";
import {convertTokenToDecimal, FACTORY_ID} from "./common";
import {findTokenUSDCPrice} from "./pricing";

export function handleLiquidation(event: Liquidation): void {}

export function handleMarginTrade(event: MarginTrade): void {
  log.info("start handleMarginTrade ", [event.block.number.toString()])
  let id = event.transaction.hash.toHexString() + "_" + "marginTrade"
  let tradeRecord = TradeRecord.load(id)
  let market = Market.load(event.params.marketId.toString())
  if (!market) {
    log.error("handle marginTrade event error, market is null" , [event.params.marketId.toString()])
    return;
  }
  let pairId = market.pair
  if (!tradeRecord) {
    tradeRecord = new TradeRecord(id)
    tradeRecord.pair = pairId
    tradeRecord.longToken = event.params.longToken
    tradeRecord.trader = event.params.trader
    tradeRecord.isOpen = true
    tradeRecord.transaction = event.transaction.hash.toHexString()
    tradeRecord.timestamp = event.block.timestamp
  }
  let pair = Pair.load(pairId)
  if (!pair){
    log.error("handle marginTrade event error, pair is null", [pairId])
    return;
  }
  let tokenId = event.params.longToken ? pair.token1 : pair.token0
  let token = Token.load(tokenId)
  let quoteToken = Token.load(tokenId == pair.token0 ? pair.token1 : pair.token0)
  if (!token || !quoteToken){
    return;
  }
  tradeRecord.amount = convertTokenToDecimal(event.params.held, token.decimals)
  tradeRecord.amountUSD = tradeRecord.amount.times(findTokenUSDCPrice(token, quoteToken , pair.dexName))
  tradeRecord.save()
  // let factory = Factory.load(FACTORY_ID)
  // if (factory != null && factory.totalVolumeUSD != null && tradeRecord != null && tradeRecord.amountUSD != null){
  //   factory.totalVolumeUSD = factory.totalVolumeUSD.plus(tradeRecord.amountUSD)
  //   factory.save()
  // }
}

export function handleTradeClosed(event: TradeClosed): void {
  let id = event.transaction.hash.toHexString() + "_" + "tradeClosed"
  let tradeRecord = TradeRecord.load(id)
  let market = Market.load(event.params.marketId.toString())
  if (!market) {
    log.error("handle TradeClosed event error, market is null", [event.params.marketId.toString()])
    return;
  }
  let pairId = market.pair
  if (!tradeRecord) {
    tradeRecord = new TradeRecord(id)
    tradeRecord.pair = pairId
    tradeRecord.longToken = event.params.longToken
    tradeRecord.trader = event.params.owner
    tradeRecord.isOpen = false
    tradeRecord.transaction = event.transaction.hash.toHexString()
    tradeRecord.timestamp = event.block.timestamp
  }
  let pair = Pair.load(pairId)
  if (!pair){
    log.error("handle TradeClosed event error, pair is null", [pairId])
    return;
  }
  let tokenId = event.params.longToken ? pair.token1 : pair.token0
  let token = Token.load(tokenId)
  let quoteToken = Token.load(tokenId == pair.token0 ? pair.token1 : pair.token0)
  if (!token || !quoteToken){
    return;
  }
  tradeRecord.amount = convertTokenToDecimal(event.params.closeAmount, token.decimals)
  tradeRecord.amountUSD = tradeRecord.amount.times(findTokenUSDCPrice(token, quoteToken , pair.dexName))
  tradeRecord.save()
  // let factory = Factory.load(FACTORY_ID)
  // if (factory != null && factory.totalVolumeUSD != null && tradeRecord != null && tradeRecord.amountUSD != null){
  //   factory.totalVolumeUSD = factory.totalVolumeUSD.plus(tradeRecord.amountUSD)
  //   factory.save()
  // }
}
