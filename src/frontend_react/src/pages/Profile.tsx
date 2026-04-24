import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, User as UserIcon, Fingerprint, Copy } from 'lucide-react';
// import Button from '@/components/Button';
import { useSession } from '@/context/SessionContext';
import { compressAndConvertImage, blobToImageUrl } from "@/utils/imageManager"
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import type { UserEditableData } from '@/declarations/minter/minter.did';
// import type { MetadataItem, Value } from '@/declarations/backend/backend.did'


// const SOCIAL_CONFIG = {
//   fb: { label: 'Facebook', icon: '🌐', pattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:profile\.p?hp\?id=\d+|([\w.]+))/ },
//   ig: { label: 'Instagram', icon: '📸', pattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9.]+)/ },
//   tw: { label: 'X / Twitter', icon: '🐦', pattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/ },
//   tk: { label: 'TikTok', icon: '🎵', pattern: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9.]+)/ },
// };

const Profile = () => {
  const { user, loading, loadAvatar, updateProfile, refreshSession } = useSession();
  const navigate = useNavigate()
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  
  const resolveForm = () => {
    if (user) {
      return {
        name: user.name[0] || '',
        email: user.email[0] || '',
        fortniteUserName: user.fortniteUserName[0] || '',
        fortniteID: user.fortniteID[0] || '',
        extraData: user.extraData,
      };
    }
    return {
      name: '',
      email: '',
      fortniteUserName: '',
      fortniteID: '',
      extraData: [],
    };
  }

  const resolveAvatar =  () => {
    if (user?.avatar[0]){
      return user.avatar[0] as Uint8Array | null
    } else {
      return null as Uint8Array | null
    }
  }
  
  const [formData, setFormData] = useState<UserEditableData>(() => resolveForm());
  const { id } = useParams()

  const isOwnProfile = useMemo(() => {
    if (!id && user) return true;
    return id === user?.principal.toText();
  }, [id, user]);

  const [avatar, setAvatar] = useState<Uint8Array | null>(resolveAvatar())

  const avatarPreview = useMemo(() => {
    if (!avatar) return null;
    return blobToImageUrl(avatar);
  }, [avatar]);

  const isCopying = useRef(false);

  useEffect(() => {
    const syncSession = async () => {
      // 1. Si no hay usuario y no está cargando, intentamos refrescar
      if (!user && !loading) {
        try {
          await refreshSession();
          if (user) {
            setIsInitialCheckDone(true)
          }
        } catch (error) {
          console.error("Error al refrescar sesión:", error);
        }
      } else if (user) {
        // Si el usuario ya existe, el check está listo
        setFormData(resolveForm())
        setAvatar(resolveAvatar())
        setIsInitialCheckDone(true);
      }
    };

    syncSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, refreshSession]);

  useEffect(() => {
    if (!loading && isInitialCheckDone && !user) {
      console.log("Acceso denegado: Redirigiendo a Home");
      navigate("/");
    }
  }, [loading, isInitialCheckDone, user, navigate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    setFormData(newFormData);

    setIsEdited(JSON.stringify(newFormData) !== JSON.stringify(resolveForm()))
  };

  const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Obtenemos el primer archivo seleccionado
    if (file) {
      console.log("Archivo seleccionado:", file);
      const blobAvatar = await compressAndConvertImage(file, 256)
      setAvatar(blobAvatar)
      loadAvatar(blobAvatar)
    }
  };

  const handleSave = async () => {
    // setIsSaving(true);
    await updateProfile(formData)
    
    //TODO Hacer que le boton de guardar cambios desaparezca

    refreshSession()
    // setIsSaving(false);
  };


  // const handleAddNetwork = (type: string, url: string) => {
  //   const config = SOCIAL_CONFIG[type as keyof typeof SOCIAL_CONFIG];
  //   const match = url.match(config.pattern);

  //   if (match) {
  //     const username = match[1] || match[0]; // Extrae el grupo capturado
  //     setExtraInputs(prev => ({
  //       ...prev,
  //       networks: { ...prev.networks, [type]: username }
  //     }));
  //     toast.success(`${config.label} added!`);
  //   } else {
  //     toast.error("Invalid profile link for " + config.label);
  //   }
  // };

  const handleCopyPrincipal = () => {
    // Si ya estamos en proceso de copiado o se hizo hace poco, bloqueamos
    if (isCopying.current) return;

    isCopying.current = true;
    const principalText = user?.principal.toText() || "";

    navigator.clipboard.writeText(principalText)
      .then(() => {
        // setHasCopied(true);
        toast.success("Principal ID copied", {
          id: "copy-principal", // ID ÚNICO: Esto evita que se amontonen los toasts
          duration: 2000,
        });

        // Liberamos el bloqueo después de 2 segundos
        setTimeout(() => {
          isCopying.current = false;
          // setHasCopied(false);
        }, 2000);
      })
      .catch(() => {
        isCopying.current = false;
        toast.error("Failed to copy");
      });
  };

  return (
    <div className="max-w-full md:max-w-[80%] mx-auto pt-24 px-2 md:px-6 pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">
          {isOwnProfile ? "Settings" : "User Profile"}
        </h1>
        <p className="text-zinc-500 mt-2">
          {isOwnProfile ? "Manage your sovereign identity." : "Public identity on Indasocial."}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-54 h-54 rounded-full bg-linear-to-tr from-inda-blue to-inda-purple p-1">
                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-white opacity-40">
                        {(isOwnProfile ? user?.name : "U")?.[0]?.[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Solo mostrar cámara si es mi perfil */}
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 bg-inda-blue rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleChangeAvatar} />
                </label>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-white">
                {isOwnProfile ? formData.name : "Public User"}
              </h3>
              <span className="text-xs font-mono text-inda-blue/80 uppercase tracking-widest">
                Identity Verified
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-inda-blue">
                <UserIcon className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">
                  {isOwnProfile ? "Personal Information" : "Public Information"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Principal ID (Visible en ambos pero sin click de copia si no quieres) */}
                <div onClick={handleCopyPrincipal} className="space-y-2 lg:col-span-2 cursor-pointer">
                  <label className="text-xs text-zinc-500 ml-1">Principal ID</label>
                  <div className="flex justify-center gap-5 w-full bg-white/7 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white hover:bg-inda-dark transition-colors">
                    <Fingerprint size={18} />
                    <span className="truncate">{id || user?.principal.toText()}</span>
                    <Copy size={18} />
                  </div>
                </div>

                {/* Input o Texto de Nombre */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 ml-1">Name</label>
                  {isOwnProfile ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-inda-blue outline-none transition-all"
                    />
                  ) : (
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {formData.name || "Anonymous"}
                    </div>
                  )}
                </div>

                {/* Email (Solo si es propio o si decides mostrarlo) */}
                {(isOwnProfile || formData.email) && (
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 ml-1">Email</label>
                    {isOwnProfile ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-inda-blue outline-none transition-all"
                      />
                    ) : (
                      <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                        {formData.email}
                      </div>
                    )}
                  </div>
                )}

                {/* Input o Texto de Nombre */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 ml-1">Fortnite ID</label>
                  {isOwnProfile ? (
                    <input
                      type="text"
                      name="fortniteID"
                      value={formData.fortniteID}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-inda-blue outline-none transition-all"
                    />
                  ) : (
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {formData.fortniteID || "Anonymous"}
                    </div>
                  )}
                </div>

                {/* Input o Texto de Nombre */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 ml-1">Fortnite Name</label>
                  {isOwnProfile ? (
                    <input
                      type="text"
                      name="fortniteUserName"
                      value={formData.fortniteUserName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-inda-blue outline-none transition-all"
                    />
                  ) : (
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {formData.fortniteUserName || "Anonymous"}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Botón de Guardar: SOLO si es mi perfil y hay cambios */}
            {isOwnProfile && isEdited && (
              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button onClick={handleSave}>Guardar cambios</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile