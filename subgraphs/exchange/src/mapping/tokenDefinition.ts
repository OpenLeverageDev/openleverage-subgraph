import {
  Address,
  BigInt,
} from "@graphprotocol/graph-ts"
// bsc
import { baseTokenList,baseTokenNameMap,baseTokenDexMap,baseTokenDecimalsMap } from "../../../../config/bsc";
// eth
//import { baseTokenList,baseTokenNameMap,baseTokenDexMap,baseTokenDecimalsMap } from "../../../../config/mainnet";


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
    const staticDefinitions = new Array<TokenDefinition>();
    if(baseTokenList){
      for(var i = 0; i<baseTokenList.length; i++){
        const name = baseTokenNameMap.get(baseTokenList[i]);
        const dex = BigInt.fromString(baseTokenDexMap.get(baseTokenList[i]));
        const decimals = BigInt.fromString(baseTokenDecimalsMap.get(baseTokenList[i]));
        const token = new TokenDefinition(
          Address.fromString(baseTokenList[i]),
          name,
          dex,
          decimals,
        )
        staticDefinitions.push(token);
      }
    }

    return staticDefinitions
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address): TokenDefinition | null {
    const staticDefinitions = this.getStaticDefinitions()
    const tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      const staticDefinition = staticDefinitions[i]
      if (staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }
    // If not found, return null
    return null
  }

  static getAllBaseAddress(): string[] {
    const result: string[] = []
    const staticDefinitions = this.getStaticDefinitions()
    for (let i = 0; i < staticDefinitions.length; i++) {
      result[i] = staticDefinitions[i].address.toHexString()
    }
    return result
  }

}