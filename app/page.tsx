"use client";

import { Activity, CloudRain, Loader2, Plug, ReceiptText, ShieldCheck, Sparkles, Umbrella, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { base } from "wagmi/chains";
import { rainReceiptAbi } from "@/lib/abi";
import { ERC_8021_DATA_SUFFIX, RAIN_RECEIPT_CONTRACT_ADDRESS, isContractConfigured } from "@/lib/constants";

type ReceiptAction = {
  key: "drizzle" | "umbrella" | "clear";
  label: string;
  shortLabel: string;
  fn: "logDrizzle" | "openUmbrella" | "clearSky";
  icon: typeof CloudRain;
  tone: string;
};

const actions: ReceiptAction[] = [
  {
    key: "drizzle",
    label: "Log Drizzle",
    shortLabel: "Drizzle",
    fn: "logDrizzle",
    icon: CloudRain,
    tone: "from-[#d9eef7] to-[#bcd6e6] text-ink"
  },
  {
    key: "umbrella",
    label: "Open Umbrella",
    shortLabel: "Umbrella",
    fn: "openUmbrella",
    icon: Umbrella,
    tone: "from-[#ffe693] to-[#f5c542] text-[#263248]"
  },
  {
    key: "clear",
    label: "Clear Sky",
    shortLabel: "Clear",
    fn: "clearSky",
    icon: Sparkles,
    tone: "from-[#d7e5ff] to-[#9dbdff] text-ink"
  }
];

const zeroAddress = "0x0000000000000000000000000000000000000000" as const;

function compactHex(value?: string, fallback = "Not connected") {
  if (!value) return fallback;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("reject") || message.includes("denied")) return "Request rejected.";
  if (message.includes("chain") || message.includes("network")) return "Network busy. Try again soon.";
  return "Transaction failed. Please try again.";
}

function formatCount(value: unknown) {
  if (typeof value === "bigint") return value.toLocaleString("en-US");
  return "0";
}

function connectorLabel(connector: Connector) {
  if (connector.id === "coinbaseWalletSDK") return "Coinbase Wallet";
  if (connector.id === "injected") return "Browser Wallet";
  return connector.name;
}

export default function Home() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [lastAction, setLastAction] = useState<ReceiptAction | null>(null);
  const [activity, setActivity] = useState("Ready for the next weather receipt.");
  const [safeError, setSafeError] = useState("");
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect({
    mutation: {
      onSuccess: () => {
        setWalletOpen(false);
        setSafeError("");
        setActivity("Wallet connected.");
      },
      onError: (error) => {
        console.error(error);
        setSafeError(friendlyError(error));
        setActivity("Connection was not completed.");
      }
    }
  });
  const { disconnect } = useDisconnect();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();

  const readAddress = address ?? zeroAddress;
  const receiptContract = {
    address: RAIN_RECEIPT_CONTRACT_ADDRESS,
    abi: rainReceiptAbi,
    chainId: base.id
  } as const;

  const reads = useReadContracts({
    contracts: [
      { ...receiptContract, functionName: "userDrizzles", args: [readAddress] },
      { ...receiptContract, functionName: "userUmbrellas", args: [readAddress] },
      { ...receiptContract, functionName: "userClears", args: [readAddress] },
      { ...receiptContract, functionName: "totalDrizzles" },
      { ...receiptContract, functionName: "totalUmbrellas" },
      { ...receiptContract, functionName: "totalClears" }
    ],
    query: {
      enabled: isContractConfigured,
      refetchInterval: 15000
    },
    allowFailure: true
  });

  const wait = useWaitForTransactionReceipt({
    hash,
    chainId: base.id,
    query: {
      enabled: Boolean(hash)
    }
  });

  const confirmed = wait.status === "success";
  const txFailed = wait.status === "error";

  useEffect(() => {
    if (confirmed) {
      setActivity("Confirmed.");
      setSafeError("");
      reads.refetch();
    }
    if (txFailed) {
      if (wait.error) console.error(wait.error);
      setActivity("Failed.");
      setSafeError("Transaction failed. Please try again.");
    }
  }, [confirmed, txFailed, reads, wait.error]);

  const countRows = [
    { label: "My Drizzles", total: "Total Drizzles", mine: reads.data?.[0]?.result, all: reads.data?.[3]?.result },
    { label: "My Umbrellas", total: "Total Umbrellas", mine: reads.data?.[1]?.result, all: reads.data?.[4]?.result },
    { label: "My Clears", total: "Total Clears", mine: reads.data?.[2]?.result, all: reads.data?.[5]?.result }
  ];

  async function sendReceipt(action: ReceiptAction) {
    if (!isConnected) {
      setWalletOpen(true);
      setActivity("Choose a wallet to continue.");
      return;
    }
    if (!isContractConfigured) {
      setActivity("Setup pending.");
      setSafeError("This app is waiting for final onchain setup.");
      return;
    }
    if (chainId !== base.id) {
      setActivity("Network switch needed.");
      setSafeError("Please switch to Base and try again.");
      return;
    }

    try {
      setLastAction(action);
      setHash(undefined);
      setSafeError("");
      setActivity("Pending.");
      const txHash = await writeContractAsync({
        ...receiptContract,
        functionName: action.fn,
        dataSuffix: ERC_8021_DATA_SUFFIX
      });
      setHash(txHash);
      setActivity("Pending.");
    } catch (error) {
      console.error(error);
      setSafeError(friendlyError(error));
      setActivity(friendlyError(error));
    }
  }

  const statusText = isConnected ? "Connected" : "Disconnected";
  const lastTxText = hash ? compactHex(hash, "No transaction yet") : "No transaction yet";
  const busy = isWriting || (Boolean(hash) && wait.status === "pending");

  return (
    <main className="min-h-screen overflow-hidden px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-[8px] border border-white/70 bg-white/60 p-4 shadow-rain backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-ink text-white shadow-receipt">
              <ReceiptText className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-normal sm:text-3xl">Rain Receipt</h1>
              <p className="text-sm font-medium text-slateReceipt">Onchain Weather Receipt / Three-Action Mood Log</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-[8px] border border-[#d8e3ea] bg-white px-3 py-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-base shadow-[0_0_0_4px_rgba(0,82,255,0.12)]" />
              <span className="font-semibold">{statusText}</span>
              <span className="text-slateReceipt">{compactHex(address)}</span>
            </div>
            <button
              type="button"
              onClick={() => (isConnected ? disconnect() : setWalletOpen(true))}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-base px-4 py-2 text-sm font-bold text-white shadow-rain transition hover:bg-[#003fd1]"
            >
              <Wallet className="h-4 w-4" aria-hidden />
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </button>
          </div>
        </header>

        <section className="rain-glass relative overflow-hidden rounded-[8px] border border-white/80 p-4 shadow-rain md:p-6">
          <div className="absolute left-6 top-0 h-full w-px bg-white/60" />
          <div className="absolute right-12 top-0 h-full w-px bg-white/40" />
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <div className="relative min-h-[290px] overflow-hidden rounded-[8px] border border-white/80 bg-[#eaf4f8]/80 p-5 shadow-receipt">
              <div className="absolute inset-x-0 top-10 h-px bg-white/70" />
              <div className="absolute left-8 top-0 h-full w-1 rounded-full bg-white/35" />
              <div className="absolute right-8 top-0 h-full w-1 rounded-full bg-white/35" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-normal text-base">Base Ready</span>
                  <span className="rounded-full bg-[#f5c542] px-3 py-1 text-xs font-black uppercase tracking-normal text-[#263248]">Gas Only</span>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-normal text-slateReceipt">No Token</span>
                </div>
                <div>
                  <p className="mb-3 max-w-md text-sm font-semibold uppercase tracking-normal text-slateReceipt">Rainy window ledger</p>
                  <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-normal text-ink sm:text-5xl">
                    Stamp the weather, keep the receipt.
                  </h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {["Soft rain glass", "Receipt paper", "Live counters"].map((item) => (
                    <div key={item} className="rounded-[8px] border border-white/70 bg-white/55 px-3 py-2 text-sm font-bold text-ink">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="receipt-edge bg-[#fffdf5] p-5 shadow-receipt">
              <div className="mb-4 flex items-center justify-between border-b border-dashed border-[#c9d3da] pb-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-normal text-slateReceipt">Weather desk</p>
                  <h2 className="text-xl font-black">Receipt Actions</h2>
                </div>
                <ShieldCheck className="h-6 w-6 text-base" aria-hidden />
              </div>
              <div className="grid gap-3">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isActive = lastAction?.key === action.key && busy;
                  return (
                    <button
                      key={action.key}
                      type="button"
                      disabled={busy}
                      onClick={() => sendReceipt(action)}
                      className={`flex min-h-14 items-center justify-between rounded-[8px] bg-gradient-to-br ${action.tone} px-4 py-3 text-left font-black shadow-sm transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" aria-hidden />
                        {action.label}
                      </span>
                      {isActive ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Plug className="h-5 w-5" aria-hidden />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm font-semibold text-slateReceipt">Each action writes one simple weather receipt on Base.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4 sm:grid-cols-3">
            {countRows.map((row) => (
              <div key={row.label} className="rounded-[8px] border border-[#dce6ec] bg-white/78 p-4 shadow-receipt">
                <p className="text-xs font-black uppercase tracking-normal text-slateReceipt">{row.label}</p>
                <div className="mt-2 text-4xl font-black">{formatCount(row.mine)}</div>
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#d2dde5] pt-3 text-sm font-bold">
                  <span className="text-slateReceipt">{row.total}</span>
                  <span>{formatCount(row.all)}</span>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[8px] border border-[#dce6ec] bg-white/78 p-4 shadow-receipt">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-base" aria-hidden />
              <h2 className="text-lg font-black">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              <StatusLine label="Wallet Status" value={`${statusText} / ${compactHex(address)}`} />
              <StatusLine label="Last Transaction" value={lastTxText} />
              <StatusLine label="Receipt Status" value={activity} strong />
              {safeError ? (
                <div className="rounded-[8px] border border-[#f2d7d5] bg-[#fff3f2] px-3 py-2 text-sm font-bold text-[#9a382f]">{safeError}</div>
              ) : null}
              {!isContractConfigured ? (
                <div className="rounded-[8px] border border-[#d3e0ff] bg-[#eef4ff] px-3 py-2 text-sm font-bold text-base">
                  Final onchain setup is pending.
                </div>
              ) : null}
            </div>
          </aside>
        </section>
      </div>

      {walletOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/35 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[8px] border border-white/80 bg-white p-4 shadow-rain">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Choose Wallet</h2>
                <p className="text-sm font-semibold text-slateReceipt">Connect with Base App, Coinbase Wallet, MetaMask, or OKX.</p>
              </div>
              <button
                type="button"
                onClick={() => setWalletOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-[8px] border border-[#d8e3ea] bg-white text-ink"
                aria-label="Close wallet options"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="grid gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  type="button"
                  disabled={isConnecting}
                  onClick={() => connect({ connector, chainId: base.id })}
                  className="flex min-h-12 items-center justify-between rounded-[8px] border border-[#d8e3ea] bg-[#f8fbfc] px-4 py-3 text-left font-black text-ink transition hover:border-base hover:bg-[#eef4ff] disabled:opacity-70"
                >
                  <span>{connectorLabel(connector)}</span>
                  {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Wallet className="h-5 w-5" aria-hidden />}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatusLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[8px] border border-[#e3ebf0] bg-[#f8fbfc] px-3 py-2 text-sm">
      <span className="font-bold text-slateReceipt">{label}</span>
      <span className={`text-right ${strong ? "font-black text-base" : "font-bold text-ink"}`}>{value}</span>
    </div>
  );
}
