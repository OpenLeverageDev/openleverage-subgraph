import { log, BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import {Controller} from "../../generated/Controller/Controller";
import {ERC20} from "../../generated/Controller/ERC20";
import {ERC20SymbolBytes} from "../../generated/Controller/ERC20SymbolBytes";
import {ERC20NameBytes} from "../../generated/Controller/ERC20NameBytes";


export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS_V2 = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
export const FACTORY_ADDRESS_V3 = '0x1f98431c8ad98523631ae4a59f267346ea31f984'
export const DEX_AGG_ADDRESS = '0xd78b5db4aec619779b4c7d1ab99e290e6347d66a'
export const FACTORY_ID = "1"

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BD = BigDecimal.fromString('0')
export const ONE_BD = BigDecimal.fromString('1')
export const BI_18 = BigInt.fromI32(18)

export const factoryContractV2 = Controller.bind(Address.fromString(FACTORY_ADDRESS_V2))
export const factoryContractV3 = Controller.bind(Address.fromString(FACTORY_ADDRESS_V3))

export function fetchTokenSymbol(tokenAddress: Address): string {
    let symbolValue = 'unknown'
    const contract = ERC20.bind(tokenAddress)
    const contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

    // try types string and bytes32 for symbol
    const symbolResult = contract.try_symbol()
    if (symbolResult.reverted) {
        const symbolResultBytes = contractSymbolBytes.try_symbol()
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
    let nameValue = 'unknown'
    const contract = ERC20.bind(tokenAddress)
    const contractNameBytes = ERC20NameBytes.bind(tokenAddress)

    // try types string and bytes32 for name
    const nameResult = contract.try_name()
    if (nameResult.reverted) {
        const nameResultBytes = contractNameBytes.try_name()
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
    let totalSupplyValue = new BigInt(0)
    const contract = ERC20.bind(tokenAddress)
    const totalSupplyResult = contract.try_totalSupply()
    if (!totalSupplyResult.reverted) {
        totalSupplyValue = totalSupplyResult.value
    }
    return totalSupplyValue
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let decimalValue:i32
    const contract = ERC20.bind(tokenAddress)

    // try types uint8 for decimals
    const decimalResult = contract.try_decimals()
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

export function fetchLiquidityOnPool(tokenAddress: Address, poolAddress: Address): BigInt {
      const contract = ERC20.bind(tokenAddress);
      const poolLiquidity =  contract.balanceOf(poolAddress);
      log.debug('balance of pool == {}, {}', [tokenAddress.toHexString(),poolLiquidity.toString()]);
      return poolLiquidity;
}


