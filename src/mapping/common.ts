import { log, BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import {Controller} from "../../generated/Controller/Controller";
import {TokenDefinition} from "./tokenDefinition";
import {ERC20} from "../../generated/Factory/ERC20";
import {ERC20SymbolBytes} from "../../generated/Factory/ERC20SymbolBytes";
import {ERC20NameBytes} from "../../generated/Factory/ERC20NameBytes";


export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS_V2 = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
export const FACTORY_ADDRESS_V3 = '0x1f98431c8ad98523631ae4a59f267346ea31f984'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContractV2 = Controller.bind(Address.fromString(FACTORY_ADDRESS_V2))
export let factoryContractV3 = Controller.bind(Address.fromString(FACTORY_ADDRESS_V3))

export function fetchTokenSymbol(tokenAddress: Address): string {
    // static definitions overrides
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    log.info("fetchTokenSymbol address={}, staticDefinition={}", [tokenAddress.toHexString(), staticDefinition == null ? "" : staticDefinition.name.toString()])
    if(staticDefinition != null) {
        return (staticDefinition as TokenDefinition).symbol
    }
    log.info("start ERC20 query : {}, Address = {}", ["fetchTokenSymbol", tokenAddress.toHexString()])
    let contract = ERC20.bind(tokenAddress)
    let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

    // try types string and bytes32 for symbol
    let symbolValue = 'unknown'
    let symbolResult = contract.try_symbol()
    if (symbolResult.reverted) {
        let symbolResultBytes = contractSymbolBytes.try_symbol()
        if (!symbolResultBytes.reverted) {
            // for broken pairs that have no symbol function exposed
            if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
                symbolValue = symbolResultBytes.value.toString()
            }
        }
    } else {
        symbolValue = symbolResult.value
    }

    return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
    // static definitions overrides
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if(staticDefinition != null) {
        return (staticDefinition as TokenDefinition).name
    }
    log.info("start ERC20 query : {}, Address = {}", ["fetchTokenName", tokenAddress.toHexString()])

    let contract = ERC20.bind(tokenAddress)
    let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

    // try types string and bytes32 for name
    let nameValue = 'unknown'
    let nameResult = contract.try_name()
    if (nameResult.reverted) {
        let nameResultBytes = contractNameBytes.try_name()
        if (!nameResultBytes.reverted) {
            // for broken exchanges that have no name function exposed
            if (!isNullEthValue(nameResultBytes.value.toHexString())) {
                nameValue = nameResultBytes.value.toString()
            }
        }
    } else {
        nameValue = nameResult.value
    }

    return nameValue
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
    return ZERO_BI
    // let contract = ERC20.bind(tokenAddress)
    // let totalSupplyValue = new BigInt(0)
    // let totalSupplyResult = contract.try_totalSupply()
    // if (!totalSupplyResult.reverted) {
    //     totalSupplyValue = totalSupplyResult.value
    // }
    // return totalSupplyValue
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    // static definitions overrides
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if(staticDefinition != null) {
        return (staticDefinition as TokenDefinition).decimals
    }
    log.info("start ERC20 query : {}, Address = {}", ["fetchTokenDecimals", tokenAddress.toHexString()])
    let contract = ERC20.bind(tokenAddress)
    // try types uint8 for decimals
    let decimalValue = null
    let decimalResult = contract.try_decimals()
    if (!decimalResult.reverted) {
        decimalValue = decimalResult.value
    }
    return BigInt.fromI32(decimalValue as i32)
}

export function isNullEthValue(value: string): boolean {
    return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == ZERO_BI) {
        return tokenAmount.toBigDecimal()
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
        bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}



