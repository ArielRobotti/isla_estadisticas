

// import React, { useState } from 'react';
import { ConnectWallet } from "@nfid/identitykit/react";
import logoGif from '../assets/ANIMACION_3_WEB .gif';
import { useSession } from "../context/SessionContext";
import UserMenu from '../components/UserMenu';
import { Menu } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MyCustomButton = (props: any) => {
  const { loading, ...restProps } = props;
  return (
    <button
      className="bg-linear-to-r from-orange-900 to-amber-400 text-black text-md font-black py-1.5 px-6 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:scale-110!"
      {...restProps}
    >
      {loading ? "CARGANDO..." : "LOGIN"}
    </button>
  );
};


const NavBar: React.FC = () => {
  // Asegúrate de descomentar useSession para obtener balance y loading
  const { loading, balance, user, userPrincipal } = useSession();
  //  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const MyCustomDisconnectButton = () => {
    return (
      <UserMenu user={user} />
    );
  };
  return (
    <nav className=' px-8  border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl '>
      <div className="flex items-center w-full h-24 top-0 z-50 select-none">
        {/* COLUMNA 1: Espacio vacío / Futuro Menú (33%) */}
        <div className="flex-1 flex justify-start">
          <div className=" flex items-center justify-center cursor-pointer ">
            <Menu className="h-10 w-10 text-gray-400 hover:text-gray-200 transition-all duration-400"/>
          </div>
        </div>

        {/* COLUMNA 2: LOGO (Centro Exacto) */}
        <div className="flex-none flex flex-col items-center justify-center text-center">
          <a href="https://c3ntral.gg/" className="group transition-transform hover:scale-105 flex flex-col items-center">
            <div className="flex items-center font-rajdhani text-4xl lg:text-6xl font-bold tracking-tighter leading-none">
              C
              <img
                src={logoGif}
                alt="e"
                className="h-10 w-10 lg:h-18 lg:w-18 object-contain"
              />
              NTRAL.GG
            </div>
            <div className="text-[0.6rem] lg:text-[0.7rem] text-zinc-500 tracking-[5px] uppercase font-bold mt-1">
              Island Statistics
            </div>
          </a>
        </div>

        {/* COLUMNA 3: Balance + Wallet (33%) */}
        <div className="flex-1 flex items-center justify-end gap-4">

          {/* Display de Balance con el divisor vertical */}
          {!loading && balance !== undefined && userPrincipal != undefined && (
            <div className="w-50 border-r border-zinc-800 pr-5">
              <div className='hidden md:flex px-3 py-2.5 flex-col items-end pr-4 border border-zinc-600 rounded-2xl'>
                <span className="text-[0.7rem] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
                  Balance
                </span>
                <span className="text-md font-rajdhani font-bold text-yellow-500 leading-none">
                  {(Number(balance) / 10 ** 8).toFixed(3)} <span className="text-md text-yellow-500 font-black">
                    <a
                      href="https://dashboard.internetcomputer.org/canister/ls35s-zaaaa-aaaap-qumfa-cai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-md font-rajdhani font-bold text-yellow-500 hover:text-yellow-300 transition-colors cursor-pointer"
                    >
                      NXT
                    </a>
                  </span>
                </span>
              </div>
            </div>
          )}

          <div className="relative">

            <ConnectWallet
              connectButtonComponent={MyCustomButton}
              connectedButtonComponent={MyCustomDisconnectButton}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;