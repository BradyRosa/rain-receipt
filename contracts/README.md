# Rain Receipt Contract

Deploy `RainReceipt.sol` to Base mainnet, then update `RAIN_RECEIPT_CONTRACT_ADDRESS` in `lib/constants.ts`.

The frontend ABI in `lib/abi.ts` matches this contract and supports only three write functions:

- `logDrizzle()`
- `openUmbrella()`
- `clearSky()`

There are no token, fee, points, invite, reward, or limit mechanics in the contract.
