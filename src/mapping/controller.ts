import {Address, BigInt, Value} from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  Controller,
  LPoolPairCreated,
} from "../../generated/Controller/Controller"
import {Bundle, Factory, Market, Pair, Token} from "../../generated/schema"
import { Factory as FactoryContract } from "../../generated/Factory/Factory"
import { Controller as ControllerContract } from "../../generated/Controller/Controller"

import {
  FACTORY_ADDRESS_V2,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  ZERO_BD,
  ZERO_BI
} from "./common";


export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS_V2))
export let controllerContract = ControllerContract.bind(Address.fromString("0x0eabe8e34a1fae4601953667f811acb9ff808e78"))


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

    // create new bundle
    let bundle = new Bundle('1')
    bundle.ethPrice = ZERO_BD
    bundle.save()
  }
  factory.pairCount = factory.pairCount + 1

  // v2 or v3
  let dex = event.params.dexData.toI32()
  let isV2 = dex < 255
  log.info("handleLPoolPairCreated dex = {}, isV2 = {}", [dex.toString(), isV2.toString()])

  // create the tokens
  let token0 = Token.load(event.params.token0.toHexString())
  let token1 = Token.load(event.params.token1.toHexString())

  // fetch info if null
  if (token0 === null) {
    token0 = new Token(event.params.token0.toHexString())
    log.info("start query token0={}, {} ", [event.params.token0.toHexString(), event.params.token0.toString()])
    token0.symbol = fetchTokenSymbol(event.params.token0)
    token0.name = fetchTokenName(event.params.token0)
    token0.totalSupply = fetchTokenTotalSupply(event.params.token0)
    let decimals = fetchTokenDecimals(event.params.token0)
    log.info("end query token0 ", [])

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    token0.decimals = decimals
    token0.derivedETH = ZERO_BD
    token0.tradeVolume = ZERO_BD
    token0.tradeVolumeUSD = ZERO_BD
    token0.untrackedVolumeUSD = ZERO_BD
    token0.totalLiquidity = ZERO_BD
    // token0.allPairs = []
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
      return
    }
    token1.decimals = decimals
    token1.derivedETH = ZERO_BD
    token1.tradeVolume = ZERO_BD
    token1.tradeVolumeUSD = ZERO_BD
    token1.untrackedVolumeUSD = ZERO_BD
    token1.totalLiquidity = ZERO_BD
    // token1.allPairs = []
    token1.txCount = ZERO_BI
  }

  // log.info("test contract start, pool0={}, pool1={}", [Address.fromString(token0.id).toHexString(), Address.fromString(token1.id).toHexString()])
  // controllerContract

  log.info("getPair start, token0={}, token1={}", [Address.fromString(token0.id).toHexString(), Address.fromString(token1.id).toHexString()])
  let pairId = factoryContract.getPair(Address.fromString(token0.id), Address.fromString(token1.id)).toHexString()
  log.info("getPair end, token0={}, token1={}, pair address={}", [Address.fromString(token0.id).toHexString(), Address.fromString(token1.id).toHexString(), pairId])

  let pair = new Pair(pairId) as Pair
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.isV2 = isV2
  pair.pool0 = event.params.pool0.toHexString()
  pair.pool1 = event.params.pool0.toHexString()
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

  // create the tracked contract based on the template
  //PairTemplate.create(event.params.pair)

  // save updated values
  token0.save()
  token1.save()
  pair.save()
  market.save()
  factory.save()
}