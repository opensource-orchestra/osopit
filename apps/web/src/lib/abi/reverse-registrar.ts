export const ReverseRegistrarABI = [
  {
    type: "function",
    name: "setName",
    inputs: [{ name: "name", type: "string", internalType: "string" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "nonpayable",
  },
] as const;
