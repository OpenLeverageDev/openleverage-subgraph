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
import { fetchLiquidityOnPool } from "./common";
import { Pair, Pool, Market } from "../../generated/schema";

function getLiquidityOnPool(address: Address): void {
  const poolLiquidity = fetchLiquidityOnPool(address);
  const poolModel = Pool.load(address.toString());

  if(!poolModel || !poolModel.marketId){
    return;
  }
  const market =  Market.load(poolModel.marketId);

  if(!market || !market.pair){
    return;
  }
  const pair = Pair.load(market.pair);
  if (!pair) {
    log.error('no found the pair', [address.toString()]);
    return;
  }
  
  if (pair.pool0.toString() === address.toString()) {
    pair.reserve0 = BigDecimal.fromString(poolLiquidity.toString());
  } else {
    pair.reserve1 = BigDecimal.fromString(poolLiquidity.toString());
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

// export function handleRepayBorrow(event: RepayBorrow): void { }

// export function handleReservesAdded(event: ReservesAdded): void { }

// export function handleReservesReduced(event: ReservesReduced): void { }

// export function handleTransfer(event: Transfer): void { }
