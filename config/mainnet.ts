// eth
export const baseTokenList: string[] = ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0x956f47f50a910163d8bf957cf5846d573e7f87ca","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0xa47c8bf37f92abed4a126bda807a7b7498661acd","0x853d955acef822db058eb8505911ed77f175b99e", "0xdac17f958d2ee523a2206206994597c13d831ec7","0x6b175474e89094c44da98b954eedeac495271d0f"]

export const baseTokenNameMap = new Map<string,string>();
// eth
baseTokenNameMap.set("0x6b175474e89094c44da98b954eedeac495271d0f","DAI");
baseTokenNameMap.set("0xdac17f958d2ee523a2206206994597c13d831ec7","USDT");
baseTokenNameMap.set("0x853d955acef822db058eb8505911ed77f175b99e","FRAX");
baseTokenNameMap.set("0xa47c8bf37f92abed4a126bda807a7b7498661acd","WUSDT");

baseTokenNameMap.set("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","WBTC");
baseTokenNameMap.set("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","tokenETH");
baseTokenNameMap.set("0x956f47f50a910163d8bf957cf5846d573e7f87ca","FEI");
baseTokenNameMap.set("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","USDC");



export const baseTokenDexMap = new Map<string,string>();
// eth
baseTokenDexMap.set("0x6b175474e89094c44da98b954eedeac495271d0f","1");
baseTokenDexMap.set("0xdac17f958d2ee523a2206206994597c13d831ec7","1");
baseTokenDexMap.set("0x853d955acef822db058eb8505911ed77f175b99e","1");
baseTokenDexMap.set("0xa47c8bf37f92abed4a126bda807a7b7498661acd","33554932");

baseTokenDexMap.set("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","1");
baseTokenDexMap.set("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","1");
baseTokenDexMap.set("0x956f47f50a910163d8bf957cf5846d573e7f87ca","1");
baseTokenDexMap.set("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","1");

export const baseTokenDecimalsMap = new Map<string,string>();

// eth
baseTokenDecimalsMap.set("0x6b175474e89094c44da98b954eedeac495271d0f","18");
baseTokenDecimalsMap.set("0xdac17f958d2ee523a2206206994597c13d831ec7","6");
baseTokenDecimalsMap.set("0x853d955acef822db058eb8505911ed77f175b99e","18");
baseTokenDecimalsMap.set("0xa47c8bf37f92abed4a126bda807a7b7498661acd","18");

baseTokenDecimalsMap.set("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","8");
baseTokenDecimalsMap.set("0x956f47f50a910163d8bf957cf5846d573e7f87ca","18");
baseTokenDecimalsMap.set("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","18");
baseTokenDecimalsMap.set("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","6");


export const dexAddr = "0xd78b5db4aec619779b4c7d1ab99e290e6347d66a";