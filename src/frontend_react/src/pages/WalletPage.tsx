import { useState, useEffect } from 'react';
import { useSession } from "@/context/SessionContext";
import { Wallet, Send, ArrowUpRight, Search, CheckCircle2, AlertCircle } from "lucide-react";


const formatNTX = (amount: bigint | number) => {
	const value = typeof amount === 'bigint' ? Number(amount) / 1e8 : amount;

	return new Intl.NumberFormat('es-AR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
};

const FEE = 1000000n

const WalletPage = () => {
	const { userPrincipal, minter, balance, refreshSession, refreshBalance } = useSession();
	const [destination, setDestination] = useState("");
	const [amount, setAmount] = useState<number>(0);
	const [available, setAvailable] = useState(Number(balance) / 10 ** 8)
	const [recipientStatus, setRecipientStatus] = useState<'idle' | 'searching' | 'internal' | 'external' | 'himself' |'invalid'>('idle');
	const [recipientName, setRecipientName] = useState<string | null>(null);

	const handleAmountChange = (val: string) => {
		// Reemplaza coma por punto y permite solo números y un único punto decimal
		const sanitized = val.replace(",", ".").replace(/[^0-9.]/g, "");

		// Validar que no haya más de un punto
		const parts = sanitized.split(".");
		if (parts.length > 2) return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setAmount(sanitized === "" ? 0 : sanitized as any);
	};

	const setPercentage = (pct: number) => {
		const calculated = (available * pct) / 100;
		// Redondeamos a 8 decimales (estándar de ICP/Ledger) para evitar basura de punto flotante
		setAmount(Number(calculated.toFixed(8)));
	};

	const handleTransfer = async () => {
		console.log("Transfiriendo")
		if (recipientStatus === 'internal') {
			const sendResponse = await minter?.sendNXST({ to: destination, amount: BigInt(Math.floor(amount * 10 ** 8))})
			refreshSession()
			setAmount(0)
			console.log(sendResponse)
		} else if( recipientStatus === 'external') {
			const trxResponse = await minter?.withdraw({ to: destination, subaccount: [], amount: BigInt(Math.floor(amount * 10 ** 8))})
			refreshSession()
			setAmount(0)
			console.log(trxResponse)
		} 
	}

	// Validación dinámica del Principal
	useEffect(() => {
		const validatePrincipal = async () => {
			if (destination.length < 63) {
				setRecipientStatus('idle');
				return;
			}
			try {
				setRecipientStatus('searching');

				
				if (userPrincipal?.toString() === destination) {
					setRecipientStatus('himself');
					setRecipientName(null);
					return;
				};

				const profile = await minter?.getUserName(destination);
				console.log(profile)

				if (profile && "Ok" in profile) {
					setRecipientStatus('internal');
					setRecipientName(profile.Ok);
				} else {
					setRecipientStatus('external');
					setRecipientName(null);
				}
				} catch (error){
					console.error("Validation error:", error);
					setRecipientStatus('invalid');
					setRecipientName(null);
				}
			};

		const timeoutId = setTimeout(validatePrincipal, 1000);
		return () => clearTimeout(timeoutId);
	}, [destination, minter, userPrincipal]);

	useEffect(() => {
		// 1. Ejecutamos una vez al montar el componente (opcional)
		refreshBalance();
		// 2. Configuramos el intervalo (10.000 ms = 10 segundos)
		const intervalId = setInterval(() => {
			console.log("Pullinmg balance")
			refreshBalance();
		}, 3000);

		// 3. FUNCIÓN DE LIMPIEZA (Crucial)
		// Esto detiene el ping si el usuario cambia de página o el componente se desmonta
		return () => clearInterval(intervalId);

		// Agregamos [minter] como dependencia para que el ping se reinicie 
		// si el objeto minter cambia o se inicializa más tarde.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [minter]);

	useEffect(() => {
		setAvailable(Number(balance) / 10 ** 8)
	}, [balance])

	const disabledTransfer = 
		recipientStatus === 'invalid' 
		|| destination === userPrincipal
		|| recipientStatus === 'idle' 
		|| amount <= 0 
		|| Number(amount) * 1e8 + Number(FEE) > Number(balance)

	return (
		<div className="max-w-7xl mx-auto p-6 font-rajdhani text-white">
			<h1 className="text-3xl font-black mb-8 flex items-center gap-3">
				<Wallet className="text-amber-400" size={32} /> MI BILLETERA
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

				{/* PANEL DE SALDO */}
				<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
					<div>
						<span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Saldo Disponible</span>
						<div className="text-5xl font-black mt-2 text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-200">
							{(Number(balance) / 1e8).toLocaleString('es-AR', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
							<span className="text-xl ml-2 text-white/50 uppercase tracking-tighter">NTX</span>
						</div>
					</div>
					<div className="mt-8 p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
						<span className="text-[10px] text-zinc-500 block mb-1">TU PRINCIPAL ID</span>
						<code className="text-xs break-all text-blue-300">{userPrincipal?.toString()}</code>
					</div>
				</div>

				{/* PANEL DE ENVÍO */}
				<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
					<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
						<Send size={20} className="text-blue-400" /> Enviar Fondos
					</h2>

					<div className="space-y-4">
						{/* INPUT DESTINO */}
						<div>
							<label className="text-xs font-bold text-zinc-500 ml-1">PRINCIPAL ID DE DESTINO</label>
							<div className="relative mt-1">
								<input
									type="text"
									value={destination}
									spellCheck="false"
									onChange={(e) => setDestination(e.target.value.trim())}
									placeholder="aaaaa-aa..."
									className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
								/>
								<div className="absolute right-3 top-3">
									{recipientStatus === 'searching' && <Search className="animate-spin text-zinc-500" size={20} />}
									{recipientStatus === 'internal' && <CheckCircle2 className="text-emerald-400" size={20} />}
									{recipientStatus === 'external' && <ArrowUpRight className="text-amber-400" size={20} />}
									{recipientStatus === 'invalid' && <AlertCircle className="text-red-500" size={20} />}
								</div>
							</div>

							{/* FEEDBACK DE VALIDACIÓN */}
							<div className="mt-2 px-2">
								{recipientStatus === 'internal' && (
									<p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
										Usuario encontrado: <span className="font-bold">{recipientName || "No Name"}</span> (Transferencia Interna)
									</p>
								)}
								{recipientStatus === 'external' && (
									<p className="text-xs text-amber-400 font-medium">
										Billetera externa detectada (Withdrawal)
									</p>
								)}
								{recipientStatus ===  'himself' && (
									<p className="text-xs text-red-400 font-medium italic">No puedes enviarte a ti mismo</p>
								)

								}
								{recipientStatus === 'invalid' && (
									<p className="text-xs text-red-400 font-medium italic">ID de Principal inválido</p>
								)}
							</div>
						</div>

						<div>
							<div className="flex justify-between items-end ml-1 mb-1">
								<label className="text-xs font-bold text-zinc-500">MONTO A ENVIAR</label>
								<span className="text-[10px] text-zinc-400">Balance: {available.toLocaleString()}</span>
							</div>

							<div className="relative">
								<input
									type="text" // Cambiado a text para evitar flechas y controlar chars
									value={amount === 0 ? "" : amount}
									onChange={(e) => handleAmountChange(e.target.value)}
									placeholder="0.00"
									className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 font-mono text-2xl focus:border-orange-500 outline-none transition-colors"
								/>
								<span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-zinc-600">TOKENS</span>
							</div>

							{/* SLIDER / PERCENTAGE SELECTOR */}
							<div className="mt-4 space-y-3">
								<input
									type="range"
									min="0"
									max="100"
									step="1"
									value={(amount / available) * 100 > 100 ? 100 : (amount / available) * 100}
									onChange={(e) => setPercentage(Number(e.target.value))}
									className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
								/>

								<div className="flex justify-between gap-2">
									{[25, 50, 75, 100].map((pct) => (
										<button
											key={pct}
											onClick={() => setPercentage(pct)}
											className="flex-1 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700/50 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
										>
											{pct === 100 ? "MAX" : `${pct}%`}
										</button>
									))}
								</div>
							</div>


							<div className="mt-6 p-4 bg-black/20 rounded-2xl border border-zinc-800 space-y-2">
								<div className="flex justify-between text-xs">
									<span className="text-zinc-500">Monto a enviar:</span>
									<span className="font-mono">{formatNTX(amount)} NTX</span>
								</div>
								<div className="flex justify-between text-xs">
									<span className="text-zinc-500">Comisión de red (Fee):</span>
									<span className="font-mono text-amber-500">{formatNTX(FEE)} NTX</span>
								</div>
								<div className="h-px bg-zinc-800 my-1"></div>
								<div className="flex justify-between text-sm font-bold">
									<span className="text-zinc-300">Total a descontar:</span>
									<span className={`font-mono ${Number(amount) * 1e8 + Number(FEE) > Number(balance) ? 'text-red-500' : 'text-emerald-400'}`}>
										{formatNTX(BigInt(Math.round(Number(amount) * 1e8)) + FEE)} NTX
									</span>
								</div>
							</div>
						</div>
					</div>
					<button
						onClick={handleTransfer}
						disabled={disabledTransfer}
						className="w-full bg-linear-to-r mt-4 from-orange-600 to-amber-500 text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-30 disabled:grayscale"
					>
						{recipientStatus === 'internal' ? 'CONFIRMAR TRANSFERENCIA' : 'SOLICITAR WITHDRAW'}
					</button>
				</div>

			</div>
		</div>
	);
};

export default WalletPage;