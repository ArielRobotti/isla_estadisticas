import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useIdentity, useAuth } from "@nfid/identitykit/react";
import { useBackend } from "../hooks/useBackend";
import { useLedger } from "@/hooks/useIcpLedger";
import type { _SERVICE as Minter } from "../../declarations/minter/minter.did";
import type { AccountIdentifier } from "../../declarations/icp_ledger/icp_ledger.did";
import type { User, UserEditableData } from "../../declarations/minter/minter.did"
// Tipos basados en tu backend
interface SessionContextType {
  balance: bigint;
  icpBalance: bigint;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  minter: Minter | undefined;
  refreshBalances: () => Promise<void>
  updateProfile: (data: UserEditableData) => Promise<void>;
  loadAvatar: (avatar: Uint8Array) => Promise<void>;
  refreshSession: (force?: boolean) => Promise<void>;
  redeemCoupon: (code: bigint) => Promise<boolean>
  logout: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const identity = useIdentity();
  const { disconnect } = useAuth();
  const { getBackendActor } = useBackend();
  const { getICPBalance } = useLedger();

  const [minter, setMinter] = useState<Minter | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0n);
  const [icpBalance, setIcpBalance] = useState(0n);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // CONTROLADORES DE BUCLE (Síncronos)
  const isProcessing = useRef(false);
  const lastPrincipal = useRef<string>("");

  const principalStr = identity?.getPrincipal().toString();

  const refreshBalances = useCallback(async () => {
    if (!minter || !user) return;
    try {
      console.log("Refrescando balances...");
      const [icp, bal] = await Promise.all([
        getICPBalance(user.assignedAccountID as AccountIdentifier),
        minter.balance()
      ]);
      setIcpBalance(icp);
      setBalance(bal);
    } catch (e) {
      console.error("Balance refresh failed", e);
    }
  }, [minter, user, getICPBalance]);

  // 2. Lógica interna de carga (para evitar dependencias circulares)
  const loadInitialData = useCallback(async (actor: Minter, userData: User) => {
    try {
      const [icp, bal] = await Promise.all([
        getICPBalance(userData.assignedAccountID as AccountIdentifier),
        actor.balance()
      ]);
      setIcpBalance(icp);
      setBalance(bal);
    } catch (e) {
      console.error("Initial data load failed", e);
    }
  }, [getICPBalance]);

  // 3. refreshSession con escudo de Ref
  const refreshSession = useCallback(async (force = false) => {

    if (isProcessing.current) return;

    const isAnonymous = !principalStr || principalStr === "2vxsx-fae";

    if (isAnonymous) {
      if (lastPrincipal.current !== "anonymous") {
        setUser(null);
        setMinter(undefined);
        setBalance(0n);
        lastPrincipal.current = "anonymous";
      }
      return;
    }

    // Si NO es forzado Y el principal es igual salimos, Pero si force es true, saltamos esta validación y continuamos.
    if (!force && principalStr === lastPrincipal.current) return;

    try {
      isProcessing.current = true;

      const backendActor = await getBackendActor();
      setMinter(backendActor);

      // const [loginResult, isAdmin] = await backendActor.login();
      const [loginResult, imAdmin] = await Promise.all([
        backendActor.login(),
        backendActor.imAdmin()
      ]);

      const resolveUser = loginResult[0] || null;

      setUser(resolveUser);
      setIsAdmin(imAdmin && (resolveUser != null))
      lastPrincipal.current = principalStr; // Actualizamos el ref del principal

      if (resolveUser) {
        await loadInitialData(backendActor, resolveUser);
      }
    } catch (error) {
      console.error("❌ Error en refreshSession:", error);
      lastPrincipal.current = "";
    } finally {
      isProcessing.current = false;
    }
  }, [principalStr, getBackendActor, loadInitialData]);

  // 4. DISPARADOR DE SESIÓN
  useEffect(() => {
    refreshSession();
  }, [principalStr, refreshSession]);

  // 5. EFECTO DE BALANCE (Opcional: Solo si quieres que refresque al cambiar user)
  // Pero lo ideal es que refreshSession ya cargue los primeros balances.
  // Si queres que refreshBalances se ejecute ante cambios de 'user' fuera de login:
  useEffect(() => {
    if (user && minter) {
      // Solo refrescamos si no estamos en medio de un login (porque refreshSession ya lo hace)
      if (!isProcessing.current) {
        refreshBalances();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]); // Solo dependencias específicas, no todo el objeto user


  //-------------------------------------------------

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await disconnect();
      setBalance(0n)
      setIcpBalance(0n)
      setUser(null)
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    } finally {
      setLoading(false);
    }
  }, [disconnect]);

  const redeemCoupon = async (code: bigint) => {
    const backend = await getBackendActor();
    const result = await backend.redeem_coupon(code);
    if ("Ok" in result) { refreshBalances() }
    return ("Ok" in result)
  }

  const updateProfile = async (data: UserEditableData) => {
    if (!minter) return
    const response = await minter?.editProfile(data)
    if ("Ok" in response) {
      setUser(response.Ok)
    } else {
      console.log(response)
    }
  }

  const loadAvatar = async (avatar: Uint8Array) => {
    if (!minter) return
    const response = await minter?.loadAvatar([avatar])
    if ("Ok" in response) {
      setUser(response.Ok)
    }
  }

  // useEffect(() => {
  //   refreshSession();
  // }, [refreshSession]);

  return (
    <SessionContext.Provider value={{ user, isAdmin, balance, icpBalance, loading, minter, redeemCoupon, refreshSession, refreshBalances, updateProfile, loadAvatar, logout }}>
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