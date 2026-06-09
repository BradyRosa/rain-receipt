"use client";

import { coinbaseWallet, injected } from "wagmi/connectors";
import { base } from "wagmi/chains";
import { createConfig, http } from "wagmi";
import { ERC_8021_DATA_SUFFIX } from "./constants";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({
      target() {
        return {
          id: "injected",
          name: "Browser Wallet",
          provider: typeof window !== "undefined" ? window.ethereum : undefined
        };
      }
    }),
    coinbaseWallet({
      appName: "Rain Receipt",
      preference: "all"
    })
  ],
  transports: {
    [base.id]: http()
  },
  ssr: true,
  dataSuffix: ERC_8021_DATA_SUFFIX
});
