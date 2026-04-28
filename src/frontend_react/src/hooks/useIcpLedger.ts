import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../../declarations/icp_ledger";
import type { _SERVICE, AccountIdentifier  } from "../../declarations/icp_ledger/icp_ledger.did";
import { useCallback, useMemo } from "react";

export const useLedger = () => {
  // 1. Configuramos el host una sola vez
  const isMainnet = import.meta.env.DFX_NETWORK === "ic";
  const host = isMainnet ? "https://icp-api.io" : "http://127.0.0.1:4943";

  // 2. Creamos un Actor estable para consultas públicas (anónimas)
  // Usamos useMemo para que no se recree el agente en cada render
  const ledgerActor = useMemo(() => {
    const agent = HttpAgent.createSync({ host });

    if (!isMainnet) {
      agent.fetchRootKey().catch(console.error);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Actor.createActor<_SERVICE>(idlFactory as any, {
      agent,
      canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    });
  }, [isMainnet, host]);

  // 3. Función para obtener balance de forma sencilla
  const getICPBalance = useCallback(async (account: AccountIdentifier) => {
    try {
      return (await ledgerActor.account_balance({account})).e8s
    } catch (error) {
      console.error("Error consultando balance en Ledger:", error);
      return BigInt(0);
    }
  }, [ledgerActor]);

  const getMetadata = useCallback(async () => {
    try {
      return (await ledgerActor.icrc1_metadata())
    } catch (error){
      console.error("Error consultando balance en Ledger:", error);
      return []
    }
  }, [ledgerActor])

  return { ledgerActor, getICPBalance, getMetadata };
};