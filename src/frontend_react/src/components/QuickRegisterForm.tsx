import { useEffect, useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { useSession } from "@/context/SessionContext";


export const QuickRegisterForm = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredDone, setRegisteredDone] = useState(false)

  const { minter, user, refreshSession } = useSession()


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await minter?.signUp(name);
      setRegisteredDone(true)
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      const syncSession = async () => {
        // 1. Si no hay usuario y no está cargando, intentamos refrescar
        if (!user && !loading) {
          try {
            await refreshSession();

          } catch (error) {
            console.error("Error al refrescar sesión:", error);
          }
        } 
      };
  
      syncSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, refreshSession]);

  useEffect(() => {
    if(!registeredDone) return
    refreshSession(true)
  },[refreshSession, registeredDone])

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 m-2">
      <p className="text-xs text-blue-400 mb-2 font-semibold flex items-center gap-1">
        <UserPlus size={14} /> ¡Únete a la plataforma!
      </p>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Tu nombre o Nickname"
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={25}
          required
        />
        <button
          // type="submit"
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 py-2 rounded-lg text-sm font-bold transition-colors flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Completar Registro"}
        </button>
      </div>
    </form>
  );
};