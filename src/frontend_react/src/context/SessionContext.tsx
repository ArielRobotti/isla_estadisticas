import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useIdentity, useAuth } from "@nfid/identitykit/react";
import { useBackend } from "../hooks/useBackend";
import type { User } from "../../declarations/minter/minter.did"

// Tipos basados en tu backend
interface SessionContextType {
  balance: bigint;
  user: User | null;
  userPrincipal: string | undefined;
  loading: boolean; 
  refreshSession: () => Promise<void>;
  redeemCoupon: (code: bigint) => Promise<boolean>
  logout: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const identity = useIdentity();
  const { disconnect } = useAuth();
  const { getBackendActor } = useBackend();
  
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0n);
  // const [userSubaccount, setUserSubaccount] = useState<string | undefined>(undefined);
  const [userPrincipal, setUserPrincipal] = useState<string | undefined>(undefined)
  const [user, setUser ] = useState(null as User | null)
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await disconnect(); 
      // Limpiamos nuestro estado local sie s necesario
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
      const userBalance = await backendActor.balance()
      const loginResult = await backendActor.login();
      setUser(loginResult[0] ? loginResult[0]: null);

      // const userSubaccount = await backendActor.getSubaccount();
      // console.log(userSubaccount.toString())
      // setUserSubaccount(userSubaccount.toString())
      setUserPrincipal(identity.getPrincipal().toString())
      setBalance(userBalance)
      console.log((await backendActor.getSubaccount()).toString())
      
      
    } catch (error) {
      console.error("❌ Error fatal en refreshSession:", error);
    } finally {
      setLoading(false);
    }
  }, [getBackendActor, identity]);

  const redeemCoupon = async (code: bigint) => {
    console.log("Reclamando")
    // return true
    const backend = await getBackendActor();
    const result = await backend.redeem_coupon(code);
    if ("Ok" in result){ refreshSession() }
    return ("Ok" in result)

  }

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <SessionContext.Provider value={{ user, userPrincipal, balance, loading, redeemCoupon, refreshSession, logout }}>
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