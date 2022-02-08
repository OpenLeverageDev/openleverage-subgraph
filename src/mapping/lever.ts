import {BigDecimal, log, BigInt, ValueKind} from "@graphprotocol/graph-ts"
import {
  Lever,
  Liquidation,
  MarginTrade,
  TradeClosed
} from "../../generated/Lever/Lever"
import {Bundle, Market, Pair, Token, TradeRecord} from "../../generated/schema";
import {convertTokenToDecimal} from "./common";

export function handleLiquidation(event: Liquidation): void {}

export function handleMarginTrade(event: MarginTrade): void {
  log.info("start handleMarginTrade ", [event.block.number.toString()])
  let id = event.transaction.hash.toHexString() + "marginTrade"
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
  if (!token){
    return;
  }
  tradeRecord.amount = convertTokenToDecimal(event.params.held, token.decimals)
  let bundle = Bundle.load('1')
  tradeRecord.amountUSD = tradeRecord.amount.times(BigDecimal.zero())
  tradeRecord.save()
}

export function handleTradeClosed(event: TradeClosed): void {
  let id = event.transaction.hash.toHexString() + "tradeClosed"
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
    log.error("handle marginTrade event error, pair is null", [pairId])
    return;
  }
  let tokenId = event.params.longToken ? pair.token1 : pair.token0
  let token = Token.load(tokenId)
  if (!token){
    return;
  }
  tradeRecord.amount = convertTokenToDecimal(event.params.closeAmount, token.decimals)
  let bundle = Bundle.load('1')
  tradeRecord.amountUSD = tradeRecord.amount.times(BigDecimal.zero())

  // if (bundle && token.derivedETH){
  //   tradeRecord.amountUSD = tradeRecord.amount.times(bundle.ethPrice.times(token.derivedETH == null ? BigDecimal.zero() : token.derivedETH))
  // }
  tradeRecord.save()
}
