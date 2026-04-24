import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useIdentity, useAuth } from "@nfid/identitykit/react";
import { useBackend } from "../hooks/useBackend";
import type { _SERVICE as Minter } from "../../declarations/minter/minter.did";
import type { User, UserEditableData } from "../../declarations/minter/minter.did"
// Tipos basados en tu backend
interface SessionContextType {
  balance: bigint;
  user: User | null;
  userPrincipal: string | undefined;
  loading: boolean; 
  minter: Minter | undefined;
  refreshBalance: () => Promise<void>
  updateProfile: (data: UserEditableData) => Promise<void>;
  loadAvatar: (avatar: Uint8Array) => Promise<void>;
  refreshSession: () => Promise<void>;
  redeemCoupon: (code: bigint) => Promise<boolean>
  logout: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const identity = useIdentity();
  const { disconnect } = useAuth();
  const { getBackendActor } = useBackend();
  
  const [minter, setMinter] = useState<Minter | undefined>(undefined)

  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0n);
  const [userPrincipal, setUserPrincipal] = useState<string | undefined>(undefined)
  const [user, setUser ] = useState(null as User | null)

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await disconnect(); 
      setBalance(0n)
      setUserPrincipal(undefined)
      setUser(null)
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    } finally {
      setLoading(false);
    }
  }, [disconnect]);

  const refreshSession = useCallback(async () => {
    setLoading(true)
    const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

    if (isAnonymous) {
      setLoading(false)
      setUser(null)
      setUserPrincipal(undefined)
      return;
    }
    try {
      setLoading(true);
      const backendActor = await getBackendActor()
      setMinter(backendActor);
      const userBalance = await backendActor.balance()
      const loginResult = await backendActor.login();
      setUser(loginResult[0] ? loginResult[0]: null);

      setUserPrincipal(identity.getPrincipal().toString())
      setBalance(userBalance)      
      
    } catch (error) {
      console.error("❌ Error fatal en refreshSession:", error);
    } finally {
      setLoading(false);
    }
  }, [getBackendActor, identity]);

  //------------- Pulling balance ----------------//
  
  const refreshBalance = async () => {
    if(!minter) { return }
    try {
      const newBalance = await minter.balance();
      setBalance(newBalance);
    } catch (error) {
      console.error("Error al refrescar balance:", error);
    }
  };
  // useEffect(() => {


  //   refreshBalance();

  //   const intervalId = setInterval(() => {
  //     refreshBalance();
  //   }, 10000);

  //   return () => clearInterval(intervalId);

  // }, [minter]);

  //-------------------------------------------------

  const redeemCoupon = async (code: bigint) => {
    const backend = await getBackendActor();
    const result = await backend.redeem_coupon(code);
    if ("Ok" in result){ refreshSession() }
    return ("Ok" in result)
  }

  const updateProfile = async (data: UserEditableData) => {
    if (!minter) return
    const response = await minter?.editProfile(data)
    if("Ok" in response) {
      setUser(response.Ok)
    } else {
      console.log( response )
    }
  }

  const loadAvatar = async (avatar: Uint8Array) => {
    if (!minter) return
    const response = await minter?.loadAvatar([avatar])
    if ("Ok" in response) {
      setUser(response.Ok)
    }    
  }
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <SessionContext.Provider value={{ user, userPrincipal, balance, loading, minter, redeemCoupon, refreshSession, refreshBalance, updateProfile, loadAvatar, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook personalizado para usar la sesión fácilmente
// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe usarse dentro de SessionProvider");
  return context;
};