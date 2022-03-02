import {Address, BigInt, Value} from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  Controller,
  LPoolPairCreated,
} from "../../generated/Controller/Controller"
import { Factory, Market, Pair, Token, Pool} from "../../generated/schema"

import {
  FACTORY_ID,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  ZERO_BD,
  ZERO_BI
} from "./common";


export function handleLPoolPairCreated(event: LPoolPairCreated): void {
  let factory = Factory.load(FACTORY_ID)
  if (factory === null) {
    factory = new Factory(FACTORY_ID)
    factory.pairCount = 0
    factory.totalVolumeETH = ZERO_BD
    factory.totalLiquidityETH = ZERO_BD
    factory.totalVolumeUSD = ZERO_BD
    factory.untrackedVolumeUSD = ZERO_BD
    factory.totalLiquidityUSD = ZERO_BD
    factory.txCount = ZERO_BI
  }
  factory.pairCount = factory.pairCount + 1

  // v2 or v3
  const dex = parseInt(event.params.dexData.toHexString())
  const isV2 = dex < 255
  log.info("handleLPoolPairCreated dexData = {}, dex = {}, isV2 = {}", [event.params.dexData.toHexString(), dex.toString(), isV2.toString()])

  // create the tokens
  let token0 = Token.load(event.params.token0.toHexString())
  let token1 = Token.load(event.params.token1.toHexString())

  // fetch info if null
  if (token0 === null) {
    token0 = new Token(event.params.token0.toHexString())
    token0.symbol = fetchTokenSymbol(event.params.token0)
    token0.name = fetchTokenName(event.params.token0)
    token0.totalSupply = fetchTokenTotalSupply(event.params.token0)
    const decimals = fetchTokenDecimals(event.params.token0)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('decimal on token {} was null', [token0.id])
      return
    }

    token0.decimals = decimals
    token0.derivedETH = ZERO_BD
    token0.tradeVolume = ZERO_BD
    token0.tradeVolumeUSD = ZERO_BD
    token0.untrackedVolumeUSD = ZERO_BD
    token0.totalLiquidity = ZERO_BD
    token0.txCount = ZERO_BI
  }

  // fetch info if null
  if (token1 === null) {
    token1 = new Token(event.params.token1.toHexString())
    token1.symbol = fetchTokenSymbol(event.params.token1)
    token1.name = fetchTokenName(event.params.token1)
    token1.totalSupply = fetchTokenTotalSupply(event.params.token1)
    const decimals = fetchTokenDecimals(event.params.token1)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('decimal on token {} was null', [token0.id])
      return
    }
    token1.decimals = decimals
    token1.derivedETH = ZERO_BD
    token1.tradeVolume = ZERO_BD
    token1.tradeVolumeUSD = ZERO_BD
    token1.untrackedVolumeUSD = ZERO_BD
    token1.totalLiquidity = ZERO_BD
    token1.txCount = ZERO_BI
  }

  const dexStr = dex.toString()
  const dexName = BigInt.fromString(dexStr.indexOf(".") > 0 ? dexStr.substr(0, dexStr.length -2) : dexStr)
  log.info("dexData to dexName, dexData={}, dexName={}", [dex.toString(), dexName.toString()])
  const pair = new Pair(BigInt.fromI32(event.params.marketId).toString()) as Pair
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.isV2 = isV2
  pair.dexName = dexName
  pair.pool0 = event.params.pool0.toHexString()
  pair.pool1 = event.params.pool1.toHexString()
  pair.liquidityProviderCount = ZERO_BI
  pair.createdAtTimestamp = event.block.timestamp
  pair.createdAtBlockNumber = event.block.number
  pair.txCount = ZERO_BI
  pair.reserve0 = ZERO_BD
  pair.reserve1 = ZERO_BD
  pair.trackedReserveETH = ZERO_BD
  pair.reserveETH = ZERO_BD
  pair.reserveUSD = ZERO_BD
  pair.totalSupply = ZERO_BD
  pair.volumeToken0 = ZERO_BD
  pair.volumeToken1 = ZERO_BD
  pair.volumeUSD = ZERO_BD
  pair.untrackedVolumeUSD = ZERO_BD
  pair.token0Price = ZERO_BD
  pair.token1Price = ZERO_BD

  const market = new Market(BigInt.fromI32(event.params.marketId).toString()) as Market
  market.pair = pair.id
  market.isV2 = isV2

  const pool0 = new Pool(event.params.pool0.toHexString());
  pool0.marketId = BigInt.fromI32(event.params.marketId).toString();
  pool0.token0 = token0.id;
  pool0.token1 = token1.id;
  pool0.totalLiquidity = ZERO_BD;

  const pool1 = new Pool(event.params.pool1.toHexString());
  pool1.marketId = BigInt.fromI32(event.params.marketId).toString();
  pool1.token0 = token0.id;
  pool1.token1 = token1.id;
  pool1.totalLiquidity = ZERO_BD;


  // save updated values
  token0.save()
  token1.save()
  pair.save()
  market.save()
  factory.save()

  pool0.save();
  pool1.save();

}