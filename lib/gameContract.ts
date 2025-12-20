export const GAME_CONTRACT_ADDRESS = "0x4c281f04359466C4ede3F91522bC1934ac09277B" as const;

export const GAME_CONTRACT_ABI = [
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "selectMode",
    inputs: [
      { name: "difficulty", internalType: "uint8", type: "uint8" },
      { name: "nonce", internalType: "uint256", type: "uint256" }
    ]
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "playAgain",
    inputs: [{ name: "nonce", internalType: "uint256", type: "uint256" }]
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "changeDifficulty",
    inputs: [{ name: "nonce", internalType: "uint256", type: "uint256" }]
  }
] as const;
