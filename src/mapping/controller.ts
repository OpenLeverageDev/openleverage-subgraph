import {Address, BigInt, Value} from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  Controller,
  LPoolPairCreated,
} from "../../generated/Controller/Controller"
import {Bundle, Factory, Market, Pair, Token} from "../../generated/schema"
import { Factory as FactoryContract } from "../../generated/Controller/Factory"

import {
  FACTORY_ADDRESS_V2, FACTORY_ADDRESS_V3,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  ZERO_BD,
  ZERO_BI
} from "./common";
import {Bytes} from "@graphprotocol/graph-ts/index";

export let factoryContractV2 = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS_V2))
export let factoryContractV3 = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS_V3))

export function handleLPoolPairCreated(event: LPoolPairCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS_V2)
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS_V2)
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
  let dex = parseInt(event.params.dexData.toHexString())
  let isV2 = dex < 255
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
    let decimals = fetchTokenDecimals(event.params.token0)

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
    let decimals = fetchTokenDecimals(event.params.token1)

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

  // log.info("getPair start, token0={}, token1={}", [Address.fromString(token0.id).toHexString(), Address.fromString(token1.id).toHexString()])
  // let pairId = ""
  // if (isV2){
  //   pairId = factoryContractV2.getPair(Address.fromString(token0.id), Address.fromString(token1.id)).toHexString()
  // }else{
  //   pairId = factoryContractV3.g(Address.fromString(token0.id), Address.fromString(token1.id)).toHexString()
  // }
  // log.info("getPair finish, token0={}, token1={}, pair address={}", [Address.fromString(token0.id).toHexString(), Address.fromString(token1.id).toHexString(), pairId])

  let dexStr = dex.toString()
  let dexName = BigInt.fromString(dexStr.indexOf(".") > 0 ? dexStr.substr(0, dexStr.length -2) : dexStr)
  log.info("dexData to dexName, dexData={}, dexName={}", [dex.toString(), dexName.toString()])
  let pair = new Pair(event.params.marketId.toString()) as Pair
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

  let market = new Market(event.params.marketId.toString()) as Market
  market.pair = pair.id
  market.isV2 = isV2

  // save updated values
  token0.save()
  token1.save()
  pair.save()
  market.save()
  factory.save()
}