import {BigDecimal, log, BigInt, Address} from "@graphprotocol/graph-ts"
import {
  Liquidation,
  MarginTrade,
  TradeClosed
} from "../../generated/Lever/Lever";

import { Market, Pair, Token, TradeRecord} from "../../generated/schema";
import {convertTokenToDecimal, fetchLiquidityOnPool} from "./common";
import {findTokenUSDCPrice} from "./pricing";

function getLiquidityOnPool(pair: Pair): void{
    const pool0Liquidity = fetchLiquidityOnPool(Address.fromString(pair.token0),Address.fromString(pair.pool0));
    const token0 = Token.load(pair.token0);
    if(!token0){
      return;
    }
    pair.reserve0 = convertTokenToDecimal(pool0Liquidity,token0.decimals);

    const pool1Liquidity = fetchLiquidityOnPool(Address.fromString(pair.token1),Address.fromString(pair.pool1));
    const token1 = Token.load(pair.token1);
    if(!token1){
      return;
    }
    pair.reserve1 = convertTokenToDecimal(pool1Liquidity,token1.decimals);

    pair.save();
}

export function handleLiquidation(event: Liquidation): void {}

export function handleMarginTrade(event: MarginTrade): void {
  log.info("start handleMarginTrade {}", [event.block.number.toString()])
  const id = event.transaction.hash.toHexString() + "_" + "marginTrade"
  let tradeRecord = TradeRecord.load(id)
  const market = Market.load(BigInt.fromI32(event.params.marketId).toString())
  if (!market) {
    log.error("handle marginTrade event error, market is null" , [BigInt.fromI32(event.params.marketId).toString()])
    return;
  }
  const pairId = market.pair
  if (!tradeRecord) {
    tradeRecord = new TradeRecord(id)
    tradeRecord.pair = pairId
    tradeRecord.longToken = event.params.longToken
    tradeRecord.trader = event.params.trader
    tradeRecord.isOpen = true
    tradeRecord.transaction = event.transaction.hash.toHexString()
    tradeRecord.timestamp = event.block.timestamp
  }
  const pair = Pair.load(pairId)
  if (!pair){
    log.error("handle marginTrade event error, pair is null", [pairId])
    return;
  }
  const tokenId = event.params.longToken ? pair.token1 : pair.token0
  const token = Token.load(tokenId)
  const quoteToken = Token.load(tokenId == pair.token0 ? pair.token1 : pair.token0)
  if (!token || !quoteToken){
    return;
  }
  tradeRecord.amount = convertTokenToDecimal(event.params.held, token.decimals)
  tradeRecord.amountUSD = tradeRecord.amount.times(findTokenUSDCPrice(<Token>token, <Token>quoteToken , pair.dexName))
  tradeRecord.save()
  getLiquidityOnPool(<Pair>pair);
  if((event.params.token0Price).isZero()){
    return;
  }
  pair.token0Price = convertTokenToDecimal(event.params.token0Price,token.decimals);
  log.debug('handleTradeClosed token0Price: {} ',[(pair.token0Price).toString()])
  pair.token1Price = (BigDecimal.fromString("1").div(pair.token0Price));
  pair.save();
  // let factory = Factory.load(FACTORY_ID)
  // if (factory != null && factory.totalVolumeUSD != null && tradeRecord != null && tradeRecord.amountUSD != null){
  //   factory.totalVolumeUSD = factory.totalVolumeUSD.plus(tradeRecord.amountUSD)
  //   factory.save()
  // }
}

export function handleTradeClosed(event: TradeClosed): void {
  const id = event.transaction.hash.toHexString() + "_" + "tradeClosed"
  let tradeRecord = TradeRecord.load(id)
  const market = Market.load(BigInt.fromI32(event.params.marketId).toString())
  if (!market) {
    log.error("handle TradeClosed event error, market is null", [BigInt.fromI32(event.params.marketId).toString()])
    return;
  }
  const pairId = market.pair
  if (!tradeRecord) {
    tradeRecord = new TradeRecord(id)
    tradeRecord.pair = pairId
    tradeRecord.longToken = event.params.longToken
    tradeRecord.trader = event.params.owner
    tradeRecord.isOpen = false
    tradeRecord.transaction = event.transaction.hash.toHexString()
    tradeRecord.timestamp = event.block.timestamp
  }
  const pair = Pair.load(pairId)
  if (!pair){
    log.error("handle TradeClosed event error, pair is null", [pairId])
    return;
  }
  const tokenId = event.params.longToken ? pair.token1 : pair.token0
  const token = Token.load(tokenId)
  const quoteToken = Token.load(tokenId == pair.token0 ? pair.token1 : pair.token0)
  if (!token || !quoteToken){
    return;
  }
  tradeRecord.amount = convertTokenToDecimal(event.params.closeAmount, token.decimals)
  tradeRecord.amountUSD = tradeRecord.amount.times(findTokenUSDCPrice(<Token>token, <Token>quoteToken , pair.dexName))
  tradeRecord.save();
  getLiquidityOnPool(<Pair>pair);
  
  if((event.params.token0Price).isZero()){
    return;
  }
  pair.token0Price = convertTokenToDecimal(event.params.token0Price,token.decimals);
  log.debug('handleTradeClosed token0Price: {} ',[(pair.token0Price).toString()])
  pair.token1Price = (BigDecimal.fromString("1").div(pair.token0Price));
  pair.save();
  // let factory = Factory.load(FACTORY_ID)
  // if (factory != null && factory.totalVolumeUSD != null && tradeRecord != null && tradeRecord.amountUSD != null){
  //   factory.totalVolumeUSD = factory.totalVolumeUSD.plus(tradeRecord.amountUSD)
  //   factory.save()
  // }
}
