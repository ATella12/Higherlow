import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    miniAppConnector(),
    injected({
      shimDisconnect: true
    })
  ],
  transports: {
    [base.id]: http()
  },
  ssr: false
});
