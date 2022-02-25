import {
  Address,
  BigInt, log,
} from "@graphprotocol/graph-ts"

// Initialize a Token Definition with the attributes
export class TokenDefinition {
  address: Address
  symbol: string
  dexName: BigInt
  decimals: BigInt

  // Initialize a Token Definition with its attributes
  constructor(address: Address, symbol: string, dexName: BigInt, decimals: BigInt) {
    this.address = address
    this.symbol = symbol
    this.dexName = dexName
    this.decimals = decimals
  }

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<TokenDefinition> {
    let staticDefinitions = new Array<TokenDefinition>()

    // the first token is USDC
    let tokenUSDC = new TokenDefinition(
        Address.fromString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
        'USDC',
        BigInt.fromI32(1),
        BigInt.fromI32(6)
    )
    staticDefinitions.push(tokenUSDC)

    let tokenFEI = new TokenDefinition(
        Address.fromString('0x956f47f50a910163d8bf957cf5846d573e7f87ca'),
        'FEI',
        BigInt.fromI32(1),
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenFEI)

    let tokenETH = new TokenDefinition(
        Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
        'tokenETH',
        BigInt.fromI32(1),
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenETH)

    let tokenWBTC = new TokenDefinition(
        Address.fromString('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
        'WBTC',
        BigInt.fromI32(1),
        BigInt.fromI32(8)
    )
    staticDefinitions.push(tokenWBTC)

    let tokenWUSDT = new TokenDefinition(
        Address.fromString('0xa47c8bf37f92abed4a126bda807a7b7498661acd'),
        'WUSDT',
        BigInt.fromI32(33554932),
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenWUSDT)

    let tokenOHM2 = new TokenDefinition(
        Address.fromString('0x853d955acef822db058eb8505911ed77f175b99e'),
        'FRAX',
        BigInt.fromI32(1),
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenOHM2)

    let tokenUSDT = new TokenDefinition(
        Address.fromString('0xdac17f958d2ee523a2206206994597c13d831ec7'),
        'USDT',
        BigInt.fromI32(1),
        BigInt.fromI32(6)
    )
    staticDefinitions.push(tokenUSDT)

    let tokenDAI = new TokenDefinition(
        Address.fromString('0x6b175474e89094c44da98b954eedeac495271d0f'),
        'DAI',
        BigInt.fromI32(1),
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenDAI)

    return staticDefinitions
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address): TokenDefinition | null {
    let staticDefinitions = this.getStaticDefinitions()
    let tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      let staticDefinition = staticDefinitions[i]
      if (staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }
    // If not found, return null
    return null
  }

  static getAllBaseAddress(): string[] {
    let result: string[] = []
    let staticDefinitions = this.getStaticDefinitions()
    for (let i = 0; i < staticDefinitions.length; i++) {
      result[i] = staticDefinitions[i].address.toHexString()
    }
    return result
  }

}