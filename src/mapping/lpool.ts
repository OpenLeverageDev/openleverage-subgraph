import { BigInt } from "@graphprotocol/graph-ts"
import {
  LPool,
  Borrow,
  Mint,
  Redeem,
  RepayBorrow,
  ReservesAdded,
  ReservesReduced,
  Transfer
} from "../../generated/LPool/LPool"

export function handleBorrow(event: Borrow): void {}

export function handleMint(event: Mint): void {}

export function handleRedeem(event: Redeem): void {}

export function handleRepayBorrow(event: RepayBorrow): void {}

export function handleReservesAdded(event: ReservesAdded): void {}

export function handleReservesReduced(event: ReservesReduced): void {}

export function handleTransfer(event: Transfer): void {}
