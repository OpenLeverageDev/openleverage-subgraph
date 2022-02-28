import {BigDecimal, log, Address} from "@graphprotocol/graph-ts"
import {
  Liquidation,
  MarginTrade,
  TradeClosed
} from "../../generated/Lever/Lever";

import { Market, Pair, Token, TradeRecord} from "../../generated/schema";
import {convertTokenToDecimal, fetchLiquidityOnPool} from "./common";
import {findTokenUSDCPrice} from "./pricing";

function getLiquidityOnPool(pair: Pair){
  try {
    const pool0Liquidity = fetchLiquidityOnPool(Address.fromString(pair.pool0));
    log.info('balance of pool0 == ', [pool0Liquidity.toString()]);
    pair.reserve0 = new BigDecimal(pool0Liquidity);

    const pool1Liquidity = fetchLiquidityOnPool(Address.fromString(pair.pool1));
    log.info('balance of pool1 == ', [pool1Liquidity.toString()]);
    pair.reserve1 = new BigDecimal(pool1Liquidity);

    pair.save();

  } catch(error:any){
    log.error('get liquidity err', error.message);
  }
}

// export function handleLiquidation(event: Liquidation): void {}

export function handleMarginTrade(event: MarginTrade): void {
  log.info("start handleMarginTrade ", [event.block.number.toString()])
  const id = event.transaction.hash.toHexString() + "_" + "marginTrade"
  let tradeRecord = TradeRecord.load(id)
  const market = Market.load(event.params.marketId.toString())
  if (!market) {
    log.error("handle marginTrade event error, market is null" , [event.params.marketId.toString()])
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
  tradeRecord.amountUSD = tradeRecord.amount.times(findTokenUSDCPrice(token, quoteToken , pair.dexName))
  tradeRecord.save()
  getLiquidityOnPool(pair);
  // let factory = Factory.load(FACTORY_ID)
  // if (factory != null && factory.totalVolumeUSD != null && tradeRecord != null && tradeRecord.amountUSD != null){
  //   factory.totalVolumeUSD = factory.totalVolumeUSD.plus(tradeRecord.amountUSD)
  //   factory.save()
  // }
}

export function handleTradeClosed(event: TradeClosed): void {
  const id = event.transaction.hash.toHexString() + "_" + "tradeClosed"
  let tradeRecord = TradeRecord.load(id)
  const market = Market.load(event.params.marketId.toString())
  if (!market) {
    log.error("handle TradeClosed event error, market is null", [event.params.marketId.toString()])
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
  tradeRecord.amountUSD = tradeRecord.amount.times(findTokenUSDCPrice(token, quoteToken , pair.dexName))
  tradeRecord.save();
  getLiquidityOnPool(pair);
  // let factory = Factory.load(FACTORY_ID)
  // if (factory != null && factory.totalVolumeUSD != null && tradeRecord != null && tradeRecord.amountUSD != null){
  //   factory.totalVolumeUSD = factory.totalVolumeUSD.plus(tradeRecord.amountUSD)
  //   factory.save()
  // }
}
