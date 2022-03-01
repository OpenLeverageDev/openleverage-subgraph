import { log, BigDecimal, Address } from "@graphprotocol/graph-ts"
import {
  Borrow,
  Mint,
  Redeem,
  RepayBorrow,
  ReservesAdded,
  ReservesReduced,
  Transfer
} from "../../generated/LPool/LPool"
import { fetchLiquidityOnPool, convertTokenToDecimal } from "./common";
import { Pair, Pool, Market, Token } from "../../generated/schema";

function getLiquidityOnPool(poolAddress: Address): void {
  const poolModel = Pool.load(poolAddress.toHexString());

  if(!poolModel || !poolModel.marketId){
    return;
  }
  const market =  Market.load(poolModel.marketId);

  if(!market || !market.pair){
    return;
  }
  const pair = Pair.load(market.pair);
  if (!pair) {
    log.error('no found the pair', [poolAddress.toString()]);
    return;
  }
  
  if (pair.pool0.toString() === poolAddress.toHexString()) {
    const poolLiquidity = fetchLiquidityOnPool(Address.fromString(pair.token0), poolAddress);
    const token0 = Token.load(pair.token0);
    if(!token0){
      return;
    }
    pair.reserve0 = convertTokenToDecimal(poolLiquidity,token0.decimals);
  } else {
    const poolLiquidity = fetchLiquidityOnPool(Address.fromString(pair.token1), poolAddress);
    const token1 = Token.load(pair.token1);
    if(!token1){
      return;
    }
    pair.reserve1 = convertTokenToDecimal(poolLiquidity,token1.decimals);
  }
}
export function handleBorrow(event: Borrow): void {
    getLiquidityOnPool(event.address);
}

export function handleMint(event: Mint): void {
    getLiquidityOnPool(event.address);
}

export function handleRedeem(event: Redeem): void {
    getLiquidityOnPool(event.address);
}

export function handleRepayBorrow(event: RepayBorrow): void { }

export function handleReservesAdded(event: ReservesAdded): void { }

export function handleReservesReduced(event: ReservesReduced): void { }

export function handleTransfer(event: Transfer): void { }
