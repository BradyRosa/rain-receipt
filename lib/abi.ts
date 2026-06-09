export const rainReceiptAbi = [
  {
    type: "function",
    name: "userDrizzles",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "userUmbrellas",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "userClears",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "totalDrizzles",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "totalUmbrellas",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "totalClears",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "logDrizzle",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "openUmbrella",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "clearSky",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "event",
    name: "DrizzleLogged",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "userDrizzles", type: "uint256", indexed: false },
      { name: "totalDrizzles", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "UmbrellaOpened",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "userUmbrellas", type: "uint256", indexed: false },
      { name: "totalUmbrellas", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SkyCleared",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "userClears", type: "uint256", indexed: false },
      { name: "totalClears", type: "uint256", indexed: false }
    ],
    anonymous: false
  }
] as const;
