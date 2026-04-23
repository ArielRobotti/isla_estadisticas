import {
  ConnectWalletDropdownMenu,
  ConnectWalletDropdownMenuItems,
  // ConnectWalletDropdownMenuDisconnectItem,
  ConnectWalletDropdownMenuButton,
  ConnectWalletDropdownMenuItem,
} from "@nfid/identitykit/react";
import { useSession } from "@/context/SessionContext";
import type { User } from "../../declarations/minter/minter.did";
import { useNavigate } from "react-router";
import { blobToImageUrl } from "../utils/imageManager";
import { BadgeDollarSign, Layers, LogOut, MessageSquareQuote, Settings, Star, User2, Wallet} from "lucide-react";


const UserMenu = ({ user, onClose }: { user: User | null, onClose: () => void }) => {
  const { logout } = useSession();
  const initials = user?.name[0]?.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('.');
  const navigate = useNavigate()


  const avatar = user?.avatar[0] ? blobToImageUrl(user.avatar[0]) : null

  const closeAllMenus = (closeIdentityMenu: () => void) => {
    // 1. Cerramos el menú lateral de Navbar (si estamos en móvil)
    if (onClose) onClose();

    // 2. Cerramos el Dropdown de IdentityKit usando la función close de Headless UI
    if (closeIdentityMenu) closeIdentityMenu();

    // 3. Forzamos un pequeño blur para asegurar que los elementos enfocados se cierren
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleNavigation = (path: string, closeIdentityMenu: () => void) => {
    closeAllMenus(closeIdentityMenu);
    navigate(path);
  };

  return (
    <div 
      className=" border-2 border-emerald-200 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden"
    >

      {/* Menú Desplegable de IdentityKit */}
      <ConnectWalletDropdownMenu>
        {({ close }: { close: () => void }) => (
          <>
            {/* Este es el activador (el avatar) */}
            <ConnectWalletDropdownMenuButton className="p-0 bg-transparent hover:bg-transparent border-none focus:outline-none ">

              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden 
                  bg-linear-to-br from-emerald-300 to-emerald-900 hover: cursor-pointer select-none"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="User avatar"

                    className="w-full h-full object-cover aspect-square"
                  />
                ) : (
                  <span className="text-zinc-950 font-black text-2xl tracking-tight  ">
                    {initials || '?'}
                  </span>
                )}
              </div>
            </ConnectWalletDropdownMenuButton>

            {/* Los items del menú */}
            <ConnectWalletDropdownMenuItems 
              className="font-medium text-[14px]! bg-zinc-900  rounded-2xl! p-0! mt-2! select-none"
            >
              {/* <ConnectWalletDropdownMenuItem
                className="w-full px-4! mb-2 flex cursor-pointer hover:bg-white/5 rounded-2xl"
                onClick={() => handleNavigation("/", close)}
              >
                <Home className="w-5 h-5"/>
                <span className="truncate w-60">Home</span>
              </ConnectWalletDropdownMenuItem> */}

              <ConnectWalletDropdownMenuItem
                className="w-full px-4! mb-2 flex cursor-pointer hover:bg-white/5 rounded-2xl items-center"
                onClick={() => handleNavigation("/profile", close)}
              >
                {/* <Home className="w-5 h-5"/> */}
                {avatar ? (
                  <img
                    src={avatar}
                    alt="User avatar"

                    className="w-16 h-16 object-cover aspect-square rounded-full"
                  />
                ) : (
                  <User2 className="h-15 w-15 border! border-zinc-500! rounded-full p-2"/>
                )}
                <div className="flex flex-col truncate w-60">
                  <span className="pl-3">{user?.name}</span>
                  <span className="pl-3">{user?.email}</span>
                  <span className="pl-5 text-blue-500 w-60">Profile</span>
                </div>
              </ConnectWalletDropdownMenuItem>

              <div className="w-full h-px bg-zinc-700 my-2"></div>

              <ConnectWalletDropdownMenuItem
                className="w-full px-4! mb-2 flex cursor-pointer hover:bg-white/5 rounded-2xl"
                onClick={() => handleNavigation("/dashboard", close)}
              >
                <Layers className="w-5 h-5"/>
                <span className="truncate w-60">My Workspaces</span>
              </ConnectWalletDropdownMenuItem>

              <ConnectWalletDropdownMenuItem
                className="w-full px-4! mb-2 flex cursor-pointer hover:bg-white/5 rounded-2xl"
                onClick={() => handleNavigation("/favorites", close)}
              >
                <Star className="w-5 h-5"/>
                <span className="truncate w-60">Favorites</span>
              </ConnectWalletDropdownMenuItem>

              <ConnectWalletDropdownMenuItem
                className="px-4! mb-2 flex cursor-pointer hover:bg-white/5 rounded-2xl"
                onClick={() => {console.log("Not implemented"); close()}}
              >
                <Wallet className="w-5 h-5"/>
                <span className="truncate w-60">Wallet</span>
              </ConnectWalletDropdownMenuItem>

              <ConnectWalletDropdownMenuItem
                className="px-4! mb-2 flex cursor-pointer hover:bg-white/5 rounded-2xl"
                onClick={() => {console.log("Not implemented"); close()}}
              >
                <BadgeDollarSign className="w-5 h-5"/>
                <span className="truncate w-60">Account subscriptions</span>
              </ConnectWalletDropdownMenuItem>

              <ConnectWalletDropdownMenuItem
                className="w-full px-4! mb-2 flex cursor-pointer hover:bg-white/5 rounded-2xl"
                onClick={() => handleNavigation("/feedback", close)}
              >
                <MessageSquareQuote className="w-5 h-5"/>
                <span className="truncate w-60">Feedback</span>
              </ConnectWalletDropdownMenuItem>

              <ConnectWalletDropdownMenuItem
                className="px-4! mb-2 flex  cursor-pointer hover:bg-white/5 rounded-2xl"
                onClick={() => handleNavigation("/profile", close)}
              >
                <Settings className="w-5 h-5"/>
                <span className="truncate w-60">Settings</span>
              </ConnectWalletDropdownMenuItem>

              <div className="w-full h-px bg-zinc-700 my-2"></div>

              <div 
                className="h-10! flex items-center gap-10 px-4! mb-2 cursor-pointer hover:bg-red-500/15 rounded-2xl"
                onClick={logout} 
              >
                <LogOut className="w-5 h-5"/>
                <span className="truncate w-60">Logout</span>
              </div>


            </ConnectWalletDropdownMenuItems>
          </>)}
      </ConnectWalletDropdownMenu>
    </div>
  );
};

export default UserMenu;