import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Coins, LogIn } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, getDoc, deleteDoc, addDoc, collection, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function TopupScreen() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [maxAmount, setMaxAmount] = useState<number>(5000);

  useEffect(() => {
    const verifyToken = async () => {
      if (!user || !tokenId) return;
      try {
        const tokenRef = doc(db, 'topupTokens', tokenId);
        const tokenSnap = await getDoc(tokenRef);
        
        if (!tokenSnap.exists()) {
           setError('Este QR Code é inválido ou já foi utilizado.');
           return;
        }

        const data = tokenSnap.data();
        if (data.userId !== user.uid) {
           setError('Este QR Code foi gerado por outra conta. Faça login com a conta correta.');
           return;
        }

        if (Date.now() > data.expiresAt) {
           setError('Este QR Code expirou.');
           return;
        }
        
        if (data.maxAmount) {
          setMaxAmount(data.maxAmount);
        }

      } catch (err) {
         setError('Erro ao verificar QR Code.');
         console.error(err);
      } finally {
         setLoading(false);
      }
    };

    if (user) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [user, tokenId]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      alert('Erro ao fazer login.');
    }
  };

  const addCredits = async (amount: number) => {
    if (!user || !tokenId || processing) return;
    setProcessing(true);
    try {
      // 1. Add topup record
      await addDoc(collection(db, 'users', user.uid, 'topups'), {
        amount,
        createdAt: serverTimestamp()
      });
      // 2. Increment credits
      await setDoc(doc(db, 'users', user.uid), {
        credits: increment(amount)
      }, { merge: true });
      // 3. Delete token
      await deleteDoc(doc(db, 'topupTokens', tokenId));
      // 4. Sign out and redirect
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar créditos.');
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#121513] text-white flex items-center justify-center font-bold">Verificando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121513] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-bold mb-4">Adicionar Créditos</h1>
        <p className="text-white/60 text-center mb-8 max-w-sm">
          Faça login com a mesma conta onde você solicitou o QR Code para continuar.
        </p>
        <button 
          onClick={handleLogin}
          className="h-12 px-6 bg-white text-black font-bold rounded flex items-center gap-2 uppercase tracking-wide text-sm"
        >
          <LogIn size={20} />
          Fazer Login com Google
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121513] text-white flex flex-col items-center justify-center p-6">
        <p className="text-red-400 text-center mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="text-emerald-400 underline font-bold uppercase text-sm">
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121513] text-white flex flex-col items-center justify-center p-6 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
      
      <div className="z-10 text-center mb-8">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <Coins className="text-emerald-400" size={32} />
        </div>
        <h1 className="text-2xl font-black uppercase text-emerald-400">Pacotes de Fichas</h1>
        <p className="text-sm text-white/50 mt-1">Sua conta: {user.email}</p>
      </div>

      <div className="z-10 grid grid-cols-2 gap-4 w-full max-w-sm">
        {[500, 1000, 2000, 5000].filter(amount => amount <= maxAmount).map(amount => (
          <button
            key={amount}
            disabled={processing}
            onClick={() => addCredits(amount)}
            className="bg-black/40 border border-white/5 hover:border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group disabled:opacity-50 disabled:grayscale"
          >
            <Coins size={24} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
            <span className="font-black text-xl text-white group-hover:text-emerald-300 transition-colors">
              {amount === 1000 ? '1K' : amount === 2000 ? '2K' : amount === 5000 ? '5K' : amount}
            </span>
          </button>
        ))}
        {[500, 1000, 2000, 5000].filter(amount => amount <= maxAmount).length === 0 && (
          <div className="col-span-2 text-center text-rose-400 font-bold p-4 bg-white/5 rounded-xl">
            Limite insuficiente para adicionar opções.
          </div>
        )}
      </div>
    </div>
  );
}
