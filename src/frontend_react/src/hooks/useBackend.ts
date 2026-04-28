import { useIdentity } from "@nfid/identitykit/react";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../../declarations/minter"; 
import type { _SERVICE } from "../../declarations/minter/minter.did";
import { useCallback } from "react";

export const useBackend = () => {
  const identity = useIdentity();

  // Envolvemos todo en useCallback para que la función sea estable
  const getBackendActor = useCallback(async () => {
    const isMainnet = import.meta.env.DFX_NETWORK === "ic";
    const host = isMainnet ? "https://icp-api.io" : "http://127.0.0.1:4943";

    const agent = HttpAgent.createSync({
        host,
        identity,
        shouldFetchRootKey: !isMainnet,
    });

    console.log(host)

    if (!isMainnet) {
      await agent.fetchRootKey().catch((err) => {
        console.warn("No se pudo obtener la RootKey. Revise el estado de la replica si esta en local", err);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Actor.createActor<_SERVICE>(idlFactory as any, {
      agent,
      canisterId: import.meta.env.CANISTER_ID_MINTER,
    });
  }, [identity]); 

  return { getBackendActor };
};