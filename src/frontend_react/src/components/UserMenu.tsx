import {
  ConnectWalletDropdownMenu,
  ConnectWalletDropdownMenuItems,
  ConnectWalletDropdownMenuButton,
  ConnectWalletDropdownMenuItem,
} from "@nfid/identitykit/react";
import { useSession } from "@/context/SessionContext";
import type { User } from "../../declarations/minter/minter.did";
import { useNavigate } from "react-router";
import { blobToImageUrl } from "../utils/imageManager";
import {
  LogOut,
  Settings,
  User2,
  Wallet,
  Copy,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { QuickRegisterForm } from "./QuickRegisterForm";

const UserMenu = ({ user }: { user: User | null }) => {
  const { logout, refreshSession } = useSession();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if(!user) refreshSession()

  // Derivar iniciales o fallback
  const initials = user?.name[0]?.[0]?.toUpperCase() || null;
  const avatar = user?.avatar[0] ? blobToImageUrl(user.avatar[0]) : null;

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que cierre el menú si no lo deseas
    if (user) {
      await navigator.clipboard.writeText(user.principal.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-2 border-emerald-200 rounded-full w-14 h-14 flex items-center justify-center overflow-hidden">
      <ConnectWalletDropdownMenu>
        {({ close }: { close: () => void }) => (
          <>
          
            <ConnectWalletDropdownMenuButton className="p-0! bg-transparent hover:bg-transparent border-none focus:outline-none">
              <div className="w-14 h-14 rounded-full bg-linear-to-tr from-inda-blue to-inda-purple p-1 shrink-0">
                <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      className="w-full h-full object-cover aspect-square block"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold uppercase">
                        {initials ? <span className="text-zinc-450 font-black text-2xl">{initials}</span> : <User2 className=" w-8 h-8 " />}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </ConnectWalletDropdownMenuButton>

            <ConnectWalletDropdownMenuItems className="font-medium text-[14px] bg-zinc-900 rounded-2xl p-1! mt-2 select-none min-w-70">

              {/* SECCIÓN DE PERFIL O REGISTRO */}
              {user ? (
                <ConnectWalletDropdownMenuItem
                  className="px-4 py-3 flex cursor-pointer hover:bg-white/5 rounded-t-2xl items-center"
                  onClick={() => { navigate("/profile"); close(); }}
                >
                  <div className="w-22 h-22 rounded-full bg-linear-to-tr from-inda-blue to-inda-purple p-1 shrink-0">
                    <div className="w-full h-full rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
                      {avatar ? (
                        <img
                          src={avatar}
                          className="w-full h-full object-cover aspect-square block"
                          alt="Avatar"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white uppercase">
                            {initials ? <span className=" font-black text-4xl">{initials}</span> : <User2 className=" w-8 h-8 " />}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start ml-3 truncate">
                    <span className="font-bold text-white">{user.name}</span>
                    <span className="text-xs text-blue-400">Ver Perfil</span>
                  </div>
                </ConnectWalletDropdownMenuItem>
              ) : (
                <QuickRegisterForm />
              )}

              {/* ITEM DE COPIAR PRINCIPAL (Visible siempre) */}
              <div
                className="mx-2 px-2 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl border border-zinc-800 transition-colors"
                onClick={copyToClipboard}
              >
                <div className="w-55 flex flex-col overflow-hidden">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Mi Principal ID</span>
                  <span className="text-xs truncate font-mono text-blue-400">
                    {user?.principal.toString()}
                  </span>
                </div>
                {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} className="text-zinc-500" />}
              </div>

              <div className="w-full h-px bg-zinc-800 my-2"></div>

              {/* OPCIONES DE NAVEGACIÓN */}
              <ConnectWalletDropdownMenuItem
                className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/5"
                onClick={() => { navigate("/wallet"); close(); }}
              >
                <Wallet size={18} className="text-zinc-400" />
                <span className="truncate w-60">Billetera</span>
              </ConnectWalletDropdownMenuItem>

              <ConnectWalletDropdownMenuItem
                className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/5"
                onClick={() => { navigate("/settings"); close(); }}
              >
                <Settings size={18} className="text-zinc-400" />
                <span className="truncate w-60">Configuración</span>
              </ConnectWalletDropdownMenuItem>

              <div className="w-full h-px bg-zinc-800 my-2"></div>

              {/* LOGOUT */}
              <div
                className="px-4 py-2 pb-3 flex items-center gap-3 cursor-pointer hover:bg-red-500/10 text-red-400 rounded-b-2xl transition-colors"
                onClick={logout}
              >
                <LogOut size={18} />
                <span className="font-bold ml-4">Cerrar Sesión</span>
              </div>

            </ConnectWalletDropdownMenuItems>
          </>
        )}
      </ConnectWalletDropdownMenu>
    </div>
  );
};

export default UserMenu;