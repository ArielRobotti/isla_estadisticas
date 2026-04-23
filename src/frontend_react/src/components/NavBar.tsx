

import React from 'react';
import { ConnectWallet } from "@nfid/identitykit/react";
import logoGif from '../assets/ANIMACION_3_WEB .gif';
import { useSession } from "../context/SessionContext";
import UserMenu from '../components/UserMenu';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MyCustomButton = (props: any) => {
  const { loading, ...restProps } = props;
  return (
    <button
      className="bg-yellow-600 hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-tighter py-2 px-6 rounded-lg shadow-[0_0_10px_rgba(202,138,4,0.3)] transition-all duration-200 active:scale-95"
      {...restProps}
    >
      {loading ? "Cargando..." : "Login"}
    </button>
  );
};


const NavBar: React.FC = () => {
  // Asegúrate de descomentar useSession para obtener balance y loading
  const { loading, balance, user, userPrincipal, logout } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MyCustomDisconnectButton = () => {
    // const { loading, ...restProps } = props;
    return (
      <UserMenu user={ user } onClose={logout}/>
      // <button
      //   className="bg-yellow-600! hover:bg-yellow-400! text-black! font-black! uppercase! text-xs! py-2! px-6! rounded-lg! shadow-[0_0_10px_rgba(202,138,4,0.3)] transition-all duration-200 active:scale-95"
      //   onClick={logout}
      //   {...restProps}
      // >
      //   {loading ? "Cargando..." : "Logout"}
      // </button>
    );
  };
  return (
    <nav className=' px-8  border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl '>
      <div className="flex items-center w-full h-22 top-0 z-50 select-none">
        {/* COLUMNA 1: Espacio vacío / Futuro Menú (33%) */}
        <div className="flex-1 flex justify-start">
          {/* Aquí puedes meter un botón de menú tipo hamburguesa luego */}
          {/* <div className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 cursor-pointer transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div> */}
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
              <div className='hidden md:flex px-3 py-1 flex-col items-end pr-4 border border-zinc-600 rounded-2xl'>
                <span className="text-[0.5rem] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
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
      {userPrincipal && 
        <div className=' w-full text-xs pr-2 flex gap-6 justify-end mb-2'>
          <span>User Principal ID</span> 
          <span>{userPrincipal}</span>
        </div>}
    </nav>
  );
};

export default NavBar;