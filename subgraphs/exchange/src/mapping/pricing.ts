import { Pair, Token, Bundle } from '../../generated/schema'
import { BigDecimal, Address, BigInt, Bytes} from '@graphprotocol/graph-ts/index'
import {ZERO_BD, ADDRESS_ZERO, ONE_BD, DEX_AGG_ADDRESS, convertTokenToDecimal, ONE_BI} from './common'
import {TokenDefinition} from "./tokenDefinition";
import { Dex as DexContract } from "../../generated/Lever/Dex"
import {log} from "@graphprotocol/graph-ts";

export const dexContract = DexContract.bind(Address.fromString(DEX_AGG_ADDRESS))

export function findTokenUSDCPrice(token: Token, quoteToken: Token, dexName: BigInt): BigDecimal {

  log.info("findTokenUSDCPrice start, token = {}, quoteToken = {}, dexName = {}", [token.symbol, quoteToken.symbol, dexName.toString()])
  const middleList = TokenDefinition.getStaticDefinitions()
  const addressList = TokenDefinition.getAllBaseAddress()
  const tokenAddress = token.id
  const quoteAddress = quoteToken.id
  const USDCAddress = addressList[0]
  const USDCDecimal = middleList[0].decimals

  if (addressList.indexOf(tokenAddress) < 0 && addressList.indexOf(quoteAddress) < 0){
     log.error("findTokenUSDCPrice error, unSupport pair, baseToken = {}, quoteToken = {}", [tokenAddress, quoteAddress])
     return ZERO_BD
  }

  // if USDC
  if (tokenAddress == USDCAddress){
    return ONE_BD
  }

  let middle = TokenDefinition.fromAddress(Address.fromString(tokenAddress))
  let middleMulti = ONE_BD
  if (middle == null){
    middle = TokenDefinition.fromAddress(Address.fromString(quoteAddress));
    middleMulti = getPrice(Address.fromString(tokenAddress), token.decimals, Address.fromString(quoteAddress), quoteToken.decimals, dexName)
  }
  if (middle == null){
    return ZERO_BD
  }

  const middleResult = middle.address.toHexString() == USDCAddress ? ONE_BD : getPrice(middle.address, middle.decimals, Address.fromString(USDCAddress), USDCDecimal, middle.dexName)
  const result = middleMulti.times(middleResult).truncate(18)
  log.info("findTokenUSDCPrice finish, middleMulti = {}, middleResult = {}, result = {}", [middleMulti.toString(), middleResult.toString(), result.toString()])
  return result
}

export function getPrice(baseToken: Address, baseDecimal: BigInt, quoteToken: Address, quoteDecimal: BigInt, dexName: BigInt): BigDecimal {
  const dexData = Bytes.fromByteArray(Bytes.fromHexString("0" + dexName.toHexString().replace("0x","")));
  const result = dexContract.getPrice(baseToken, quoteToken, dexData)
  log.info("getPrice end ,baseToken: {}, baseDecimal: {}, quoteToken: {}, quoteDecimal: {}, dexName: {}， dexData:{}, dexDataHexStr={},res0 = {}, res1 = {}", [baseToken.toHexString(), baseDecimal.toString(), quoteToken.toHexString(), quoteDecimal.toString(), dexName.toString(), dexData.toString(), dexData.toHexString(), result.value0.toString(), result.value1.toString()])
  return result.value0.toBigDecimal().div(convertTokenToDecimal(ONE_BI, baseDecimal.minus(quoteDecimal))).times(convertTokenToDecimal(ONE_BI, BigInt.fromI32(result.value1)))
}


