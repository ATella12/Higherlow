import { parseAbi } from "viem";

export const menuContracts = {
  win: "0x9de1ec90a9e024608327D48D0161A6c359D0EC90",
  draw: "0x523E05808B5443EB404140056f2F98b2DB1946bB",
  loose: "0x5049175C0f622640b9b7E6EbBc8c0f07fd9790fB"
} as const;

export type MenuAction = keyof typeof menuContracts;

export const menuAbi = parseAbi([
  "function win() external payable",
  "function draw() external payable",
  "function loose() external payable"
]);
