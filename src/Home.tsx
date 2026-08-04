import React, { useEffect, useState, useTransition } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, LogOut, History, TrendingUp, TrendingDown, QrCode, X, PlusCircle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, deleteDoc, increment, serverTimestamp, setDoc, addDoc, onSnapshot } from 'firebase/firestore';
import QRCode from 'react-qr-code';
import { useLanguage } from './contexts/LanguageContext';

interface MatchObj {
  id: string;
  status: 'won' | 'lost' | 'tie';
  winnings: number;
}

export default function Home() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const { t, language, setLanguage } = useLanguage();
  const [recentMatches, setRecentMatches] = useState<MatchObj[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [activeGame, setActiveGame] = useState<any>(null);
  const [loadingActive, setLoadingActive] = useState(true);

  // Top-ups
  const [qrCodeData, setQrCodeData] = useState<{ token: string, url: string } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [topupHistory, setTopupHistory] = useState<any[]>([]);
  const [topupStats, setTopupStats] = useState<{ remainingCount: number, remainingCredits: number, nextAvailableTime: Date | null }>({ remainingCount: 3, remainingCredits: 5000, nextAvailableTime: null });
  const [isCreditsInfoOpen, setIsCreditsInfoOpen] = useState(false);

  // PWA Install Banner
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    if (isStandalone) return;

    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('poker_install_dismissed');
    if (dismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, which does not support beforeinstallprompt, show the banner after a small delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert(language === 'pt' ? "Para instalar no iOS, toque no ícone de compartilhar (Seta para cima) no Safari e selecione 'Adicionar à Tela de Início'." : "To install on iOS, tap the share icon (arrow pointing up) in Safari and select 'Add to Home Screen'.");
      } else {
        alert(language === 'pt' ? "Para instalar, clique nos três pontinhos do navegador e selecione 'Adicionar à tela inicial' ou 'Instalar'." : "To install, click the browser options icon and select 'Add to Home Screen' or 'Install'.");
      }
    }
  };

  const handleDismissBanner = () => {
    localStorage.setItem('poker_install_dismissed', 'true');
    setShowInstallBanner(false);
  };

  useEffect(() => {
    if (!user) return;

    const fetchMatchesAndActive = async () => {
      try {
        const matchesRef = collection(db, 'users', user.uid, 'matches');
        const q = query(matchesRef, orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);

        const matches: MatchObj[] = [];
        querySnapshot.forEach((docSnap) => {
          matches.push({ id: docSnap.id, ...docSnap.data() } as MatchObj);
        });
        setRecentMatches(matches);
      } catch (err) {
        console.warn('[Firestore Rules Warning] Insufficient permissions listing matches:', err);
        setRecentMatches([]);
      } finally {
        setLoadingMatches(false);
      }

      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid, 'currentGame', 'active'));
        if (docSnap.exists()) {
          setActiveGame(docSnap.data());
        }
      } catch (err) {
        console.warn('[Firestore Rules Warning] Insufficient permissions getting active game:', err);
      } finally {
        setLoadingActive(false);
      }
    };

    fetchMatchesAndActive();
  }, [user]);

  useEffect(() => {
    if (!qrCodeData || !showQrModal) return;
    const unsub = onSnapshot(doc(db, 'topupTokens', qrCodeData.token), (docSnap) => {
      if (!docSnap.exists()) {
        setShowQrModal(false);
        setQrCodeData(null);
      }
    }, (err) => console.warn('[Firestore Rules Warning] QR code listener error:', err));
    return () => unsub();
  }, [qrCodeData, showQrModal]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, 'users', user.uid, 'topups'), orderBy('createdAt', 'desc'), limit(20)), (snap) => {
      const history: any[] = [];
      snap.forEach(d => history.push({ id: d.id, ...d.data() }));
      setTopupHistory(history);

      const WINDOW_MS = 4 * 60 * 60 * 1000;
      const now = Date.now();
      const windowStartMs = now - WINDOW_MS;

      const inWindow = history.filter(t => t.createdAt && t.createdAt.toMillis() > windowStartMs);
      const creditsAdded = inWindow.reduce((acc, t) => acc + (t.amount || 0), 0);

      const remainingCount = Math.max(0, 3 - inWindow.length);
      const remainingCredits = Math.max(0, 5000 - creditsAdded);

      let nextTime = null;
      if (inWindow.length > 0) {
        const oldest = inWindow[inWindow.length - 1];
        nextTime = new Date(oldest.createdAt.toMillis() + WINDOW_MS);
      }

      setTopupStats({ remainingCount, remainingCredits, nextAvailableTime: nextTime });
    }, (err) => {
      console.warn('[Firestore Rules Warning] Topups listener error:', err);
      setTopupHistory([]);
    });
    return () => unsub();
  }, [user]);

  const handleRequestCredits = async () => {
    if (!user) return;
    setLoadingQr(true);
    try {
      if (topupStats.remainingCount <= 0) {
        alert(language === 'pt' ? "Você atingiu o limite de 3 autorizações nas últimas 4 horas." : "You have reached the limit of 3 refills in the last 4 hours.");
        setLoadingQr(false);
        return;
      }
      if (topupStats.remainingCredits <= 0) {
        alert(language === 'pt' ? "Você atingiu o limite de 5.000 créditos nas últimas 4 horas." : "You have reached the limit of 5,000 chips in the last 4 hours.");
        setLoadingQr(false);
        return;
      }

      const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await setDoc(doc(db, 'topupTokens', randomId), {
        userId: user.uid,
        expiresAt: Date.now() + 5 * 60 * 1000,
        maxAmount: topupStats.remainingCredits
      });

      const url = `${window.location.origin}/topup/${randomId}`;
      setQrCodeData({ token: randomId, url });
      setShowQrModal(true);
    } catch (err) {
      console.error(err);
      alert(language === 'pt' ? 'Erro ao solicitar créditos.' : 'Error requesting chips.');
    } finally {
      setLoadingQr(false);
    }
  };

  const handleStartGame = () => {
    if (profile && profile.credits >= 1000) {
      startTransition(async () => {
        if (activeGame) {
          // Should cancel previous
          await handleCancelAndStart();
        } else {
          navigate('/game');
        }
      });
    } else {
      alert(language === 'pt' ? "Você não tem créditos suficientes (Mínimo: 1.000)." : "You do not have enough chips (Minimum: 1,000).");
    }
  };

  const handleResumeGame = () => {
    startTransition(() => {
      navigate('/game', { state: { resume: true } });
    });
  };

  const handleCancelAndStart = async () => {
    if (!user) return;
    try {
      const stateObj = JSON.parse(activeGame.stateData);
      const humanPlayer = stateObj.players.find((p: any) => p.isHuman);
      const stack = humanPlayer ? humanPlayer.stack : 1000;
      const diff = stack - 1000;

      if (diff !== 0) {
        await setDoc(doc(db, 'users', user.uid), {
          credits: increment(diff)
        }, { merge: true });
        await addDoc(collection(db, 'users', user.uid, 'matches'), {
          status: diff > 0 ? 'won' : 'lost',
          winnings: diff,
          createdAt: serverTimestamp()
        });
      }
      await deleteDoc(doc(db, 'users', user.uid, 'currentGame', 'active'));
      navigate('/game');
    } catch (e) {
      console.error(e);
      alert(language === 'pt' ? "Erro ao cancelar partida anterior." : "Error canceling previous match.");
    }
  };

  return (
    <div className="min-h-screen bg-[#121513] text-white p-6 pb-24 relative overflow-hidden flex flex-col font-sans">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />

      <header className="flex items-center justify-between mb-8 z-10 p-2">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={language === 'pt' ? "Foto de perfil" : "Profile picture"}
              className="w-10 h-10 rounded-full object-cover border border-emerald-500/30 shadow-md shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20 shadow-md shrink-0">
              {profile?.name?.charAt(0).toUpperCase() || 'J'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{t('homeWelcome')}</span>
            <span className="font-bold text-lg leading-tight">{profile?.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 shadow-md">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                language === 'en'
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('pt')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                language === 'pt'
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              PT
            </button>
          </div>

          <button
            onClick={() => startTransition(() => signOut())}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <section className="bg-emerald-950/30 border border-emerald-900/50 rounded-3xl pt-10 pb-6 px-6 flex flex-col items-center justify-center text-center mb-6 relative z-10 min-h-[180px]">
        <div className="flex justify-between w-full absolute top-4 px-4">
          <button title={t('homeHistoryLogs')} onClick={() => setShowHistory(true)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors border border-white/5">
            <History size={16} />
          </button>
          <button title={t('homeQrTitle')} onClick={handleRequestCredits} disabled={loadingQr || topupStats.remainingCount === 0 || topupStats.remainingCredits === 0} className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full text-emerald-400 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:grayscale">
            {loadingQr ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent animate-spin rounded-full" /> : <PlusCircle size={16} />}
          </button>
        </div>
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2 mt-2">
          <Coins size={32} className="text-emerald-400" />
        </div>
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">{language === 'pt' ? 'Seu Saldo' : 'Your Balance'}</p>
        <h2 className="text-4xl font-black font-mono tracking-tighter text-emerald-400 mb-4">
          ${profile?.credits ? Math.floor(profile.credits).toLocaleString('en-US') : '0'}
        </h2>
        <div className="text-[10px] text-white/40 flex flex-col items-center gap-1 bg-black/20 w-full py-2 rounded-xl">
          <span className="font-bold">
            {language === 'pt' ? 'Autorizações (4h)' : 'Refills (4h)'}: <span className="text-white/70">{topupStats.remainingCount}/3</span> &nbsp;|&nbsp; {language === 'pt' ? 'Créditos disp.' : 'Chips avail.'}: <span className="text-white/70">${Math.floor(topupStats.remainingCredits).toLocaleString('en-US')}/5,000</span>
          </span>
          {(topupStats.remainingCount === 0 || topupStats.remainingCredits === 0) && topupStats.nextAvailableTime && (
            <span className="text-rose-400 font-bold">
              {language === 'pt' ? 'Próxima liberação em' : 'Next refill at'}: {topupStats.nextAvailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </section>

      <section className="mb-8 z-10 px-2 flex flex-col gap-2">
        <div
          className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors hover:bg-sky-500/15"
          onClick={() => setIsCreditsInfoOpen(!isCreditsInfoOpen)}
        >
          <div className="flex items-center gap-4">
            <div className="bg-sky-500/20 p-2 rounded-full text-sky-400 shrink-0">
              <Coins size={16} />
            </div>
            <div className="flex-1 text-sm text-sky-300 font-bold flex justify-between items-center">
              <span>{t('homeChipsInfoTitle')}</span>
              <span className="text-sky-400 text-xs font-mono">{isCreditsInfoOpen ? '-' : '+'}</span>
            </div>
          </div>
          <AnimatePresence>
            {isCreditsInfoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="text-sm text-sky-100/70 pt-2 pl-14 leading-relaxed">
                  {t('homeBuyinExplain')}<br /><br />
                  {t('homeStackExplain')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="flex-1 overflow-y-auto mb-8 z-10 no-scrollbar">
        <div className="flex items-center gap-2 mb-4 px-2">
          <History size={16} className="text-white/50" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">{t('homeStatsTitle')}</h3>
        </div>

        {loadingMatches ? (
          <div className="text-center p-8 text-white/30 text-sm font-medium">{t('loading')}</div>
        ) : recentMatches.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-white/30 text-sm font-medium">
            {language === 'pt' ? 'Nenhuma partida jogada ainda.' : 'No matches played yet.'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMatches.map((match) => (
              <div key={match.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${match.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' : match.status === 'lost' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-white/50'}`}>
                    {match.status === 'won' ? <TrendingUp size={18} /> : match.status === 'lost' ? <TrendingDown size={18} /> : <Coins size={18} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">
                      {match.status === 'won' 
                        ? (language === 'pt' ? 'Vitória' : 'Win') 
                        : match.status === 'lost' 
                          ? (language === 'pt' ? 'Derrota' : 'Loss') 
                          : (language === 'pt' ? 'Empate' : 'Split')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-white/40">
                      {language === 'pt' ? 'Hold\'em Sem Limite' : 'No-Limit Hold\'em'}
                    </span>
                  </div>
                </div>
                <div className={`font-mono font-bold ${match.status === 'won' ? 'text-emerald-400' : match.status === 'lost' ? 'text-rose-400' : 'text-white/50'}`}>
                  {match.status === 'won' ? '+$' : match.status === 'lost' ? '-$' : '$'}{Math.floor(Math.abs(match.winnings)).toLocaleString('en-US')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent z-20 flex flex-col gap-3">
        {loadingActive ? (
          <button disabled className="w-full h-16 bg-white/10 text-white/30 font-black uppercase text-sm rounded-full flex items-center justify-center">
            {language === 'pt' ? 'Verificando partida...' : 'Checking match...'}
          </button>
        ) : activeGame ? (
          <>
            <button
              onClick={handleResumeGame}
              className="w-full h-12 bg-[#98D8BA] text-[#121513] font-black uppercase text-xs rounded-full shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play size={15} fill="currentColor" />
              {t('homeResumeGame')}
            </button>
            <button
              onClick={handleStartGame}
              disabled={!profile || profile.credits < 1000}
              className="w-full h-12 bg-white/12 text-shadow-sm backdrop-blur-[2px] border border-white/10 text-white font-bold uppercase text-[10px] rounded-full active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {language === 'pt' ? 'Nova Partida (Cancelar Anterior)' : 'New Match (Cancel Previous)'}
            </button>
          </>
        ) : (
          <button
            onClick={handleStartGame}
            disabled={!profile || profile.credits < 1000}
            className="w-full h-16 bg-[#98D8BA] text-[#121513] font-black uppercase text-sm rounded-full shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
          >
            <Play size={20} fill="currentColor" />
            {language === 'pt' ? 'Mesa 1K (Jogar)' : 'Table 1K (Play)'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showQrModal && qrCodeData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#1A1D1A] border border-white/10 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center relative overflow-hidden">
              <button
                onClick={async () => {
                  setShowQrModal(false);
                  if (qrCodeData) {
                    await deleteDoc(doc(db, 'topupTokens', qrCodeData.token)).catch(() => { });
                  }
                  setQrCodeData(null);
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <QrCode size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('homeQrTitle')}</h3>
              <p className="text-white/50 text-xs text-center mb-6">
                {language === 'pt' 
                  ? 'Leia este QR Code com o seu celular para adicionar créditos. O link expira em 5 minutos.'
                  : 'Scan this QR Code with your phone to add chips. The link expires in 5 minutes.'}
              </p>
              <div className="bg-white p-4 rounded-xl">
                <QRCode value={qrCodeData.url} size={200} />
              </div>
              <div className="mt-4 flex flex-col items-center">
                <a href={qrCodeData.url} target="_blank" rel="noopener noreferrer" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-all">
                  {language === 'pt' ? 'Abrir link em nova aba' : 'Open link in new tab'}
                </a>
                <p className="text-[10px] text-white/40 text-center mt-2 px-4 leading-tight">
                  {language === 'pt'
                    ? 'Caso você não consiga ler o QR Code, clique no botão acima para abrir a página de pagamento em uma nova aba do seu navegador.'
                    : 'If you cannot scan the QR Code, click the button above to open the payment page in a new browser tab.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showHistory && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#1A1D1A]/95 backdrop-blur-md border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col h-[70vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <History className="text-emerald-400" size={20} />
                <h3 className="font-black text-white uppercase tracking-wider text-sm">{t('homeHistoryTitle')}</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 no-scrollbar flex flex-col gap-3">
              {topupHistory.length === 0 ? (
                <div className="text-center text-white/30 text-sm mt-8">{t('homeHistoryEmpty')}</div>
              ) : (
                topupHistory.map(topup => (
                  <div key={topup.id} className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{language === 'pt' ? 'Recarga' : 'Refill'}</span>
                      {topup.createdAt && (
                        <span className="text-[10px] text-white/40">{topup.createdAt.toDate().toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-emerald-400 font-bold font-mono">
                      +${Math.floor(topup.amount || 0).toLocaleString('en-US')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {showInstallBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-[#1A1D1A]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img src="/logo/logo.jpg" alt="Poker Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-xs text-white">
                  {language === 'pt' ? 'Instalar Poker Hold\'em' : 'Install Poker Hold\'em'}
                </h4>
                <p className="text-[10px] text-white/60 leading-tight">
                  {language === 'pt' ? 'Roda melhor no celular como aplicativo.' : 'Runs better on mobile as an app.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-[#98D8BA] text-[#121513] hover:bg-[#86c7a9] px-3 py-1.5 rounded-lg text-xs font-black uppercase active:scale-95 transition-all"
              >
                {language === 'pt' ? 'Instalar' : 'Install'}
              </button>
              <button
                onClick={handleDismissBanner}
                className="text-white/40 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {(loadingMatches || loadingActive || !profile || isPending) && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#121513] z-[999] flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              {/* Pulsing Outer Ring */}
              <div className="w-24 h-24 rounded-full border-2 border-[#DEB887]/20 absolute -inset-2 animate-ping" />
              
              {/* Rotating border container */}
              <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-[#98D8BA] animate-spin absolute -inset-1" />

              {/* Logo */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#DEB887]/30 shadow-2xl relative z-10">
                <img src="/logo/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-white text-sm font-black uppercase tracking-widest bg-gradient-to-r from-white to-[#DEB887] bg-clip-text text-transparent">
                {language === 'pt' ? 'Carregando Club...' : 'Loading Club...'}
              </h2>
              <p className="text-white/40 text-[9px] font-mono tracking-wider uppercase">
                {language === 'pt' ? 'Sincronizando com a Nuvem' : 'Syncing with Cloud'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
