import { useState } from "react";
// import { useBackend } from "@/hooks/useBackend";
import { useSession } from "../context/SessionContext";

const RedeemCoupon = ({claimCode} : {claimCode: string}) => {
	const { redeemCoupon  } = useSession();
	const [coupon, setCoupon] = useState<string>(claimCode);
	const [palceholder, setPlaceholder] = useState("EJ: 12345678901234567890")
	const [claming, setClaming] = useState(false);

	const handleChange = (e: { target: { value: string; }; }) => {
		// Solo permite números del 0 al 9
		const value = e.target.value.replace(/\D/g, "");
		setCoupon(value);
	};

	const handleRedeemCoupon = async () => {
		if (!coupon) return;
		setClaming(true)
		const result = await redeemCoupon(BigInt(coupon))
		setPlaceholder(result? "Reclamo exitoso!!!": "Codigo erroneo :(")
		setCoupon("")
		setClaming(false)
	};


	return (
		<div className="flex flex-col gap-3 mt-10 mb-2 mr-60 items-end font-sans">
			<div className="w-100 group">
				<label
					htmlFor="coupon"
					className="block w-full text-center text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold group-focus-within:text-yellow-400 transition-colors"
				>
					Ingrese el código del cupón
				</label>

				<div className="relative flex items-center gap-2">
					{/* Icono decorativo (opcional) */}
					<span className="absolute left-4 text-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
						</svg>
					</span>

					<input
						id="coupon"
						type="text"
						value={coupon}
						disabled={claming}
						onChange={handleChange}
						placeholder={palceholder}
						className="w-full h-12 bg-gray-900 border-2 border-gray-700 text-white text-center pl-12 pr-4 rounded-xl 
                     placeholder-gray-500 outline-none transition-all duration-200
                     focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:bg-gray-900"
					/>

				</div>
				<div className={`transition-all duration-300 transform ${(coupon && !claming) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
					<button
						onClick={handleRedeemCoupon}
						className="w-full h-10 px-2 mt-2 bg-yellow-600 hover:bg-yellow-200 text-black font-black uppercase tracking-tighter rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.4)] active:scale-95 transition-all"
					>
						Reclamar
					</button>
				</div>
			</div>
		</div>
	);
};

export default RedeemCoupon