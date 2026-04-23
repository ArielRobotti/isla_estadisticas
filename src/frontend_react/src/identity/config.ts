import { 
  InternetIdentity, 
  NFIDW, 
  IdentityKitAuthType,
  OISY,
} from "@nfid/identitykit";
import { IdentityKitTheme } from "@nfid/identitykit/react"

export const identityKitConfig = {
  authType: IdentityKitAuthType.DELEGATION,
  theme: IdentityKitTheme.SYSTEM,
  signers: [
    {
      ...InternetIdentity, 
      label: "Internet Identity 2.0",  
      id: "InternetIdentity2.0", 
      providerUrl: "https://id.ai/" 
    },
    NFIDW,
    OISY,
  ],
  signerClientOptions: {
    // targets: [
    //   import.meta.env.CANISTER_ID_FRONTEND,
    //   import.meta.env.CANISTER_ID_BACKEND,
    // ],
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000000000) 
  },
};