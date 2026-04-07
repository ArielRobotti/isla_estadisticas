import React from 'react';
import logoGif from '../assets/ANIMACION_3_WEB .gif';

const NavBar: React.FC = () => {
  return (
    <header className="text-center py-[40px] px-[20px] pb-[16px]">
      <div className="flex items-center justify-center gap-[16px] mb-[6px]">
        {/* <div className="hex">⚡</div> */}
        <div className="flex font-rajdhani text-7xl ">
          C

            <img
              src={logoGif}
              alt="e"
              className=" h-18 w-18 logo-gif"
            />

          NTRAL.GG
        </div>
        {/* <div className="hex">⚡</div> */}
      </div>
      <div className="text-[0.9rem] text-[#c8d8f073] tracking-[6px] uppercase mt-[4px] font-rajdhani">
        Fortnite Ecosystem · Data API
      </div>
    </header>
  );
};

export default NavBar;