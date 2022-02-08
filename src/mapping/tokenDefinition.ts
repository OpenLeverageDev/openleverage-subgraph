import {
  Address,
  BigInt, log,
} from "@graphprotocol/graph-ts"

// Initialize a Token Definition with the attributes
export class TokenDefinition {
  address : Address
  symbol: string
  name: string
  decimals: BigInt

  // Initialize a Token Definition with its attributes
  constructor(address: Address, symbol: string, name: string, decimals: BigInt) {
    this.address = address
    this.symbol = symbol
    this.name = name
    this.decimals = decimals
  }

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<TokenDefinition> {
    let staticDefinitions = new Array<TokenDefinition>()

    let tokenMPL = new TokenDefinition(
      Address.fromString('0x33349b282065b0284d756f0577fb39c158f935e6'),
      'MPL',
      'Maple Token',
      BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenMPL)

    let tokenUSDC = new TokenDefinition(
      Address.fromString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
      'USDC',
      'USD Coin',
      BigInt.fromI32(6)
    )
    staticDefinitions.push(tokenUSDC)

    let tokenETH = new TokenDefinition(
      Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
      'tokenETH',
      'Wrapped Ether',
      BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenETH)

    let tokenWBTC = new TokenDefinition(
      Address.fromString('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
      'WBTC',
      'Wrapped BTC',
      BigInt.fromI32(8)
    )
    staticDefinitions.push(tokenWBTC)

    let tokenOHM = new TokenDefinition(
      Address.fromString('0x383518188c0c6d7730d91b2c03a03c837814a899'),
      'OHM',
      'Olympus',
      BigInt.fromI32(9)
    )
    staticDefinitions.push(tokenOHM)

    let tokenFLOKI = new TokenDefinition(
      Address.fromString('0x43f11c02439e2736800433b4594994bd43cd066d'),
      'FLOKI',
      'FLOKI',
      BigInt.fromI32(9)
    )
    staticDefinitions.push(tokenFLOKI)

    let tokenDYDX = new TokenDefinition(
        Address.fromString('0x92d6c1e31e14520e676a687f0a93788b716beff5'),
        'DYDX',
        'dYdX',
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenDYDX)

    let SHIB = new TokenDefinition(
        Address.fromString('0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce'),
        'SHIB',
        'SHIBA INU',
        BigInt.fromI32(18)
    )
    staticDefinitions.push(SHIB)

    let tokenUNI = new TokenDefinition(
        Address.fromString('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'),
        'UNI',
        'Uniswap',
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenUNI)

    let tokenPEOPLE = new TokenDefinition(
        Address.fromString('0x7a58c0be72be218b41c608b7fe7c5bb630736c71'),
        'PEOPLE',
        'ConstitutionDAO',
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenPEOPLE)

    let tokenFREE = new TokenDefinition(
        Address.fromString('0x4cd0c43b0d53bc318cc5342b77eb6f124e47f526'),
        'FREE',
        'Ross Ulbricht Genesis Collection',
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenFREE)

    let tokenUSDT = new TokenDefinition(
        Address.fromString('0xdac17f958d2ee523a2206206994597c13d831ec7'),
        'USDT',
        'Tether USD',
        BigInt.fromI32(6)
    )
    staticDefinitions.push(tokenUSDT)

    let tokenSOS = new TokenDefinition(
        Address.fromString('0x3b484b82567a09e2588a13d54d032153f0c0aee0'),
        'SOS',
        'SOS',
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenSOS)

    let tokenDAI = new TokenDefinition(
        Address.fromString('0x6b175474e89094c44da98b954eedeac495271d0f'),
        'DAI',
        'Dai Stablecoin',
        BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenDAI)

    return staticDefinitions
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address) : TokenDefinition | null {
    let staticDefinitions = this.getStaticDefinitions()
    let tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      let staticDefinition = staticDefinitions[i]
      if(staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }

    // If not found, return null
    return null
  }

}