import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfile {
  email: string;
  name: string;
  credits: number;
  language?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const parseAuthError = (error: any): string => {
    const code = error?.code || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    switch (code) {
      case 'auth/unauthorized-domain':
        return `Domínio não autorizado no Firebase (${hostname}). Adicione "${hostname}" em: Firebase Console > Authentication > Settings > Authorized domains.`;
      case 'auth/popup-closed-by-user':
        return 'A janela de login do Google foi fechada antes de concluir a autenticação. Tente novamente.';
      case 'auth/popup-blocked':
        return 'O navegador bloqueou a janela pop-up. Clique em "Entrar por Redirecionamento" ou habilite pop-ups para este site.';
      case 'auth/configuration-not-found':
      case 'auth/operation-not-allowed':
        return 'O provedor de login do Google não está ativado no seu projeto Firebase. Acesse o Firebase Console > Authentication > Sign-in method > Google e clique em "Ativar".';

      case 'auth/invalid-api-key':
        return 'Chave API do Firebase (VITE_FIREBASE_API_KEY) inválida no arquivo .env.local.';
      case 'auth/network-request-failed':
        return 'Erro de conexão com o Firebase. Verifique sua conexão de internet e tente novamente.';
      case 'auth/internal-error':
        return `Erro interno do Firebase Auth: ${error?.message || code}`;
      default:
        return error?.message 
          ? `Erro ao autenticar: ${error.message} (${code || 'desconhecido'})` 
          : 'Ocorreu um erro ao realizar o login com o Google.';
    }
  };

  useEffect(() => {
    // Process redirect result if returning from a Google OAuth redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Successfully authenticated via redirect:', result.user.email);
        }
      })
      .catch((err) => {
        console.error('Redirect sign in error:', err);
        if (err?.code) {
          setAuthError(parseAuthError(err));
        }
      });

    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      setUser(currentUser);
      
      if (currentUser) {
        // Fallback profile in case Firestore Rules block access initially
        const fallbackProfile: UserProfile = {
          email: currentUser.email || '',
          name: currentUser.displayName || 'Jogador',
          credits: 10000,
          language: localStorage.getItem('language') || 'en'
        };

        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            const localLang = localStorage.getItem('language') || 'en';
            await setDoc(userRef, {
              email: currentUser.email,
              name: currentUser.displayName || 'Jogador',
              credits: 10000,
              language: localLang,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            });
          } else {
            await setDoc(userRef, {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (err: any) {
          console.warn('[Firestore Rules Warning] Insufficient permissions reading/writing user profile. Using fallback profile.', err);
          setProfile(fallbackProfile);
          setLoading(false);
          setAuthError('Permissão do Firestore insuficiente. Atualize as Regras (Rules) no Firebase Console > Firestore Database > Rules.');
        }

        let firstSnapshot = true;
        unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          } else {
            setProfile(fallbackProfile);
          }
          if (firstSnapshot) {
            firstSnapshot = false;
            setLoading(false);
          }
        }, (error) => {
          console.warn('[Firestore Rules Warning] Snapshot listener error:', error?.message);
          setProfile(fallbackProfile);
          if (firstSnapshot) {
            firstSnapshot = false;
            setLoading(false);
          }
        });
      } else {
        setProfile(null);
        setLoading(false);
      }

    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error signing in with Google popup:', error);
      const friendlyMsg = parseAuthError(error);
      setAuthError(friendlyMsg);
      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
    setAuthError(null);
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Error signing in with Google redirect:', error);
      const friendlyMsg = parseAuthError(error);
      setAuthError(friendlyMsg);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      authError, 
      setAuthError, 
      signInWithGoogle, 
      signInWithGoogleRedirect, 
      signOut 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
