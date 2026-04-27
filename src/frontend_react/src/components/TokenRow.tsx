import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";

const TokenRow = ({
	name,
	symbol,
	decimals,
	balance,
	address,
	logo,
	color
}: {
	name: string,
	symbol: string,
	decimals: number,
	balance: bigint | number,
	address: string,
	logo: string,
	color: string
}) => {

	const [copiedId, setCopiedId] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(address);
		setCopiedId(true);
		setTimeout(() => setCopiedId(false), 2000);
	};
	return (
		<div className="group flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-zinc-800 cursor-pointer">
			<div className="flex items-center gap-4">
				{/* Logo Circle */}
				<div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 ${color} shadow-lg`}>
					{logo}
				</div>

				{/* Token Info */}
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-bold text-zinc-100">{symbol}</span>
						<span className="text-[10px] text-zinc-500 font-medium px-1.5 py-0.5 bg-zinc-800 rounded-md">{name}</span>
					</div>
					{/* <span className="text-[10px] text-zinc-500 font-mono truncate w-32 sm:w-48">
					{address}
				</span> */}
					<div
						onClick={handleCopy}
						className="group flex items-center justify-between p-3"
					>
						<div className="flex flex-col overflow-hidden mr-4">
							<span className="text-[9px] uppercase text-amber-500/80 font-bold tracking-wider">Recibir {symbol}</span>
							<span className="text-xs truncate  w-30 xl:w-90 font-mono text-zinc-300 group-hover:text-blue-400 transition-colors">
								{address}
							</span>
						</div>
						<div className="shrink-0">
							{copiedId ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} className="text-zinc-500" />}
						</div>
					</div>
				</div>
			</div>

			{/* Balance Info */}
			<div className="flex text-right w-22 items-center gap-2">
				<div className="text-40 font-black text-zinc-100">
					{(Number(balance) / 10 ** decimals).toLocaleString('es-AR', { minimumFractionDigits: 3 })}
				</div>
				<div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
					{symbol}
				</div>
			</div>
		</div>
	);
}

export default TokenRow