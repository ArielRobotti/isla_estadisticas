import React, { useState, useEffect } from 'react';
import { useSession } from "@/context/SessionContext";
import { Ticket, Plus, Copy, Check, Hash, Coins, Loader2, AlertCircle } from "lucide-react";
// import { type Coupon } from '../../declarations/minter/minter.did';
import { formatNTX } from "../utils/formatters"; // La función que armamos antes
import { useNavigate } from 'react-router';

const CouponsAdmin = () => {
  const { minter, isAdmin, loading: sessionLoading } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<bigint | null>(null);

  // Estado para el formulario de generación
  const [qty, setQty] = useState(10);
  const [value, setValue] = useState(1);

  const navigate = useNavigate()

  const fetchCoupons = async () => {
    if (!minter) return;
    try {
      setLoading(true);
      const data = await minter.getCouponsInfo();
      console.log(data)
      setCoupons(data);
    } catch (e) {
      console.error("Error al traer cupones:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minter || generating) return;

    setGenerating(true);
    try {
      // qty y value multiplicados por la escala de tu token (e8)
      console.log(value)
      const res = await minter.generateCoupons({
        qty: BigInt(qty),
        value: BigInt(value * 1e6) 
      });
      console.log("Cupones generados:", res);
      await fetchCoupons(); // Refrescamos la lista
    } catch (e) {
      console.error("Error generando cupones:", e);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (id: bigint) => {
    navigator.clipboard.writeText(id.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetchCoupons();
  }, [minter]);

  if(!isAdmin && !sessionLoading) {
    navigate("/")
    return
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-rajdhani text-white">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Ticket className="text-orange-500" size={32} /> GESTIÓN DE CUPONES
          </h1>
          <p className="text-zinc-500 font-medium">Genera y administra códigos de canje para la Isla.</p>
        </div>
        <button 
          onClick={fetchCoupons}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="animate-spin text-zinc-500" /> : <Hash className="text-zinc-500" />}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL IZQUIERDO: GENERADOR */}
        <section className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-blue-400" /> Nuevo Lote
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-500 ml-1">CANTIDAD DE CUPONES</label>
                <input 
                  type="number" 
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 ml-1">VALOR POR CUPÓN (NTX)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-orange-500"
                  />
                  <Coins size={18} className="absolute right-4 top-4 text-zinc-600" />
                </div>
              </div>

              <button 
                disabled={generating || qty <= 0 || value <= 0}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-500 text-white font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-30 flex justify-center items-center gap-2"
              >
                {generating ? <Loader2 className="animate-spin" size={20} /> : "GENERAR CUPONES"}
              </button>
            </form>
          </div>
        </section>

        {/* PANEL DERECHO: LISTADO */}
        <section className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold text-zinc-400 uppercase tracking-widest text-sm">Cupones Disponibles</h2>
              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                {coupons.length} ACTIVOS
              </span>
            </div>

            <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto custom-scrollbar">
              {coupons.length === 0 && !loading && (
                <div className="p-20 text-center text-zinc-600">
                  <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                  <p>No hay cupones activos. Genera un lote para empezar.</p>
                </div>
              )}

              {coupons.map((coupon) => (
                <div key={coupon.id.toString()} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <Ticket size={20} className="text-zinc-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold text-blue-300">{coupon.id.toString()}</code>
                        <button 
                          onClick={() => copyToClipboard(coupon.id)}
                          className="text-zinc-600 hover:text-white transition-colors"
                        >
                          {copiedId === coupon.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">ID DE CUPÓN</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-white">
                      {formatNTX(Number(coupon.value)/10**6, 0)} <span className="text-[10px] text-zinc-500">NTX</span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-black px-2 py-0.5 bg-emerald-500/10 rounded">DISPONIBLE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CouponsAdmin;