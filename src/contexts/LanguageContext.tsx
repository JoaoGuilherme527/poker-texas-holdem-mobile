import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Common
    back: 'Back',
    leave: 'Leave',
    cancel: 'Cancel',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',

    // Landing Page
    landingTitle: 'Texas Hold\'em Poker',
    landingSub: 'VIP Club & Professional Poker Simulator',
    landingHeroText: 'Challenge high-performance bots in fluid matches with flawless animations. The premium felt table awaits you directly in your browser.',
    playNow: 'Play Now',
    freeInstall: '100% Free Installation',
    pwaFeature: 'Install on your mobile home screen to play fullscreen with native app performance.',
    simulationTitle: 'Live Simulation Table',
    simPreflop: 'Pre-flop: Players receive hole cards.',
    simFlop: 'Flop: Three community cards are dealt.',
    simTurn: 'Turn & River: The final community cards.',
    simShowdown: 'Showdown: Best hand wins the pot.',
    creditAcquisitionTitle: 'Credit Acquisition & Protection Limits',
    buyinLabel: 'Table Entry (Buy-in)',
    buyinDesc: 'Upon entering the table, $1,000 chips are taken from your wallet to become your initial stack.',
    stackLabel: 'Stack Variations',
    stackDesc: 'Your stack increases or decreases based on your wins and losses in each round.',
    cashoutLabel: 'Leaving the Table',
    cashoutDesc: 'When you click "Leave Table", your entire remaining stack is returned to your main wallet. Profits are saved.',
    walletLabel: 'Wallet',
    stackTitle: 'Table Stack',
    creditsSim1: 'Buy-in: $1,000 chips moved to active Stack.',
    creditsSim2: 'Won the round! Stack grew to $1,800.',
    creditsSim3: 'Left the table: $1,800 returned to Wallet. Profit: +$800!',
    limitsTitle: 'Safe Credit Limitations',
    limitsDesc: 'A rotating system that protects the betting table from exaggerations, guaranteeing a healthy environment for everyone.',
    refillsTitle: 'Regular Refills Available',
    refillsDesc: 'Plenty of credits for you to play dozens of rounds at our VIP tables or test new strategies.',
    readyToSeat: 'Ready to take a seat?',
    joinClub: 'Join the VIP Poker Club and start playing in seconds.',
    footerText: '© 2026 VIP Poker Club. All rights reserved. Developed with Mobile-First design.',

    // Login Page
    loginTitle: 'VIP POKER CLUB',
    loginSubtitle: 'Texas Hold\'em Mobile',
    loginCloudTitle: 'Cloud Saved Progression',
    loginCloudDesc: 'By logging in with Google, your chips and history are securely synced in the cloud. Access from any device, anywhere.',
    loginGbutton: 'Sign in with Google',
    loginFooterText: 'Easy, secure, and 100% free installation.',

    // Home / Dashboard
    homeTitle: 'VIP POKER CLUB',
    homeWelcome: 'Welcome,',
    homeActiveGame: 'Active Table',
    homeResumeGame: 'Resume Match',
    homeStartNewGame: 'Start New Match',
    homeChipsInfoTitle: 'How Chip Synchronization Works',
    homeBuyinExplain: 'Each table has a "Buy-in" (entry fee) of 1,000 chips, which is deducted from your balance upon entry.',
    homeStackExplain: 'Your chips inside the match (Stack) go up and down as you win or lose rounds. When you Leave the Table, your final Stack returns to your account balance. For example, if you finish with 1,500 chips, you secured a profit of 500.',
    homeStatsTitle: 'Match History',
    homeStatsWins: 'Wins',
    homeStatsGames: 'Hands',
    homeStatsProfit: 'Net Profit',
    homeHistoryTitle: 'Refill History',
    homeHistoryEmpty: 'No refills requested yet.',
    homeQrTitle: 'Get Chips',
    homeQrScanText: 'Scan the QR Code to simulate a credit top-up in the system.',
    homeQrClose: 'Close',
    homePwaBannerText: 'Install the app on your phone for a better mobile experience!',
    homePwaInstall: 'Install Now',
    homePwaDismiss: 'Later',
    homeHistoryLogs: 'Refills Logs',
    homeActiveTableStack: 'Stack on Table',

    // Game Page
    gamePhaseWaiting: 'Waiting',
    gamePhasePreflop: 'Pre-flop',
    gamePhaseFlop: 'Flop',
    gamePhaseTurn: 'Turn',
    gamePhaseRiver: 'River',
    gamePhaseShowdown: 'Showdown',
    gamePot: 'POT',
    gameYou: 'You',
    gameYourCards: 'YOUR CARDS',
    gameDealer: 'D',
    gameSpeechFold: 'Folds.',
    gameSpeechCheck: 'Checks.',
    gameSpeechCall: 'Calls.',
    gameSpeechRaise: 'Raises.',
    gameSpeechAllin: 'All-in!',
    gameSpeechWin: 'Wins the pot!',
    gameSpeechLose: 'Next hand will be mine.',
    gameLeaveTitle: 'Leave Table',
    gameLeaveBody: 'Choose how you want to exit the match:',
    gameLeaveSaveBtn: 'Save & Continue Later',
    gameLeaveSaveDesc: 'If you choose "Save & Continue Later", the active table state will be preserved.',
    gameLeaveAbandonBtn: 'Abandon & Close Table',
    gameLeaveAbandonDesc: 'If you choose "Abandon & Close Table", the table will close. Any chips already bet in this round will be lost, and you will not collect anything from this pot.',
    gameTimeWarning: 'Your turn! Deciding...',
    gameProcessing: 'Dealer acting...',
    gameActionFold: 'Fold',
    gameActionCheck: 'Check',
    gameActionCall: 'Call',
    gameActionRaise: 'Raise',
    gameActionAllin: 'All-in',

    // Player Seat & Controls
    playerYourCardsLabel: 'Your Cards',
    seatFolded: 'Fold',
    seatChecked: 'Check',
    seatCalled: 'Call',
    seatRaised: 'Raise',
    seatAllin: 'All In',

    // Results Bottom Sheet / Overlay
    resultsSummaryTitle: 'Table Summary',
    resultsWinner: 'Winner!',
    resultsWinners: 'Winners!',
    resultsNextHand: 'Next Hand',
    resultsSplitPot: 'Split Pot!',
    resultsScoreboard: 'Scoreboard',
    resultsPlayer: 'Player',
    resultsCards: 'Cards',
    resultsResult: 'Result',
    resultsMinimisedTooltip: 'Minimize and see the table',

    // Hands Guide / Hand Rankings
    handsGuideTitle: 'Hand Rankings',
    handsGuideHighCard: 'High Card',
    handsGuideHighCardDesc: 'No combination. Highest card in hand rules.',
    handsGuideOnePair: 'One Pair',
    handsGuideOnePairDesc: 'Two cards of the same rank.',
    handsGuideTwoPairs: 'Two Pairs',
    handsGuideTwoPairsDesc: 'Two different pairs of cards.',
    handsGuideThreeKind: 'Three of a Kind',
    handsGuideThreeKindDesc: 'Three cards of the same rank.',
    handsGuideStraight: 'Straight',
    handsGuideStraightDesc: 'Five sequential cards of different suits.',
    handsGuideFlush: 'Flush',
    handsGuideFlushDesc: 'Five cards of the same suit, not sequential.',
    handsGuideFullHouse: 'Full House',
    handsGuideFullHouseDesc: 'Three of a kind combined with a pair.',
    handsGuideFourKind: 'Four of a Kind',
    handsGuideFourKindDesc: 'Four cards of the same rank.',
    handsGuideStraightFlush: 'Straight Flush',
    handsGuideStraightFlushDesc: 'Five sequential cards of the same suit.',
    handsGuideRoyalFlush: 'Royal Flush',
    handsGuideRoyalFlushDesc: 'A, K, Q, J, 10 of the same suit.',

    // Logs & Status
    logPostSB: 'posted the Small Blind of',
    logPostBB: 'posted the Big Blind of',
    logFold: 'folded',
    logCheck: 'checked',
    logCall: 'called',
    logRaise: 'raised to',
    logAllIn: 'went ALL-IN with',
    logWinPot: 'won the pot of',
    logSplitPot: 'The pot was split between'
  },
  pt: {
    // Header & Common
    back: 'Voltar',
    leave: 'Sair',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    yes: 'Sim',
    no: 'Não',
    loading: 'Carregando...',

    // Landing Page
    landingTitle: 'Texas Hold\'em Poker',
    landingSub: 'VIP Club & Simulador Profissional de Poker',
    landingHeroText: 'Desafie bots de alta performance em partidas fluidas com animações impecáveis. A mesa de feltro premium espera por você direto no navegador do celular.',
    playNow: 'Jogar Agora',
    freeInstall: 'Instalação 100% Gratuita',
    pwaFeature: 'Instale na tela inicial do seu celular para jogar em tela cheia com a performance de um app nativo.',
    simulationTitle: 'Mesa de Simulação Ao Vivo',
    simPreflop: 'Pré-flop: Jogadores recebem suas cartas da mão.',
    simFlop: 'Flop: Três cartas comunitárias são abertas.',
    simTurn: 'Turn & River: As últimas cartas comunitárias.',
    simShowdown: 'Showdown: A melhor mão leva o pote.',
    creditAcquisitionTitle: 'Aquisição de Créditos e Limites de Proteção',
    buyinLabel: 'Entrada na Mesa (Buy-in)',
    buyinDesc: 'Ao entrar na mesa, $1.000 fichas são retiradas da sua carteira e se tornam o seu "Stack" inicial na partida.',
    stackLabel: 'Variações no Stack',
    stackDesc: 'Suas fichas dentro da mesa aumentam ou diminuem de acordo com as vitórias ou derrotas em cada rodada.',
    cashoutLabel: 'Saída da Mesa',
    cashoutDesc: 'Ao clicar em "Sair da Mesa", todo o Stack restante é devolvido à carteira principal. Todo o lucro é salvo.',
    walletLabel: 'Carteira',
    stackTitle: 'Stack na Mesa',
    creditsSim1: 'Buy-in: $1.000 fichas movidas para o Stack ativo.',
    creditsSim2: 'Ganhou a rodada! Stack subiu para $1.800.',
    creditsSim3: 'Saiu da mesa: $1.800 devolvidos. Lucro de +$800!',
    limitsTitle: 'Limites de Proteção',
    limitsDesc: 'Um sistema rotativo que protege a mesa de apostas exageradas, garantindo um ambiente saudável para todos.',
    refillsTitle: 'Recargas Regulares Disponíveis',
    refillsDesc: 'Créditos de sobra para você disputar dezenas de rodadas em nossas mesas VIP ou testar novas táticas.',
    readyToSeat: 'Pronto para sentar na mesa?',
    joinClub: 'Entre no VIP Poker Club e comece a jogar em segundos.',
    footerText: '© 2026 VIP Poker Club. Todos os direitos reservados. Desenvolvido com foco Mobile-First.',

    // Login Page
    loginTitle: 'VIP POKER CLUB',
    loginSubtitle: 'Texas Hold\'em Mobile',
    loginCloudTitle: 'Progresso Salvo na Nuvem',
    loginCloudDesc: 'Ao entrar com o Google, suas fichas e histórico ficam salvos de forma segura na nuvem, permitindo acesso de qualquer dispositivo.',
    loginGbutton: 'Entrar com o Google',
    loginFooterText: 'Instalação fácil, segura e 100% gratuita.',

    // Home / Dashboard
    homeTitle: 'VIP POKER CLUB',
    homeWelcome: 'Bem-vindo,',
    homeActiveGame: 'Mesa Ativa',
    homeResumeGame: 'Continuar Partida',
    homeStartNewGame: 'Iniciar Nova Partida',
    homeChipsInfoTitle: 'Como funciona a sincronização de fichas',
    homeBuyinExplain: 'Toda mesa tem um "Buy-in" (taxa de entrada) de 1.000 fichas, que é descontado do seu saldo ao entrar.',
    homeStackExplain: 'Seu saldo de fichas dentro da partida (Stack) sobe e desce ao ganhar ou perder rodadas. Ao Sair da Mesa, o seu Stack final volta inteiro para o seu saldo da conta. Se você terminar com 1.500 fichas, você garantiu um lucro de 500.',
    homeStatsTitle: 'Histórico de Partidas',
    homeStatsWins: 'Vitórias',
    homeStatsGames: 'Mãos',
    homeStatsProfit: 'Lucro Líquido',
    homeHistoryTitle: 'Histórico de Recargas',
    homeHistoryEmpty: 'Nenhuma recarga realizada ainda.',
    homeQrTitle: 'Adicionar Créditos',
    homeQrScanText: 'Aponte a câmera para simular uma recarga de créditos no sistema.',
    homeQrClose: 'Fechar',
    homePwaBannerText: 'Instale o aplicativo no seu celular para uma melhor experiência mobile!',
    homePwaInstall: 'Instalar Agora',
    homePwaDismiss: 'Mais Tarde',
    homeHistoryLogs: 'Registros de Recarga',
    homeActiveTableStack: 'Stack na Mesa',

    // Game Page
    gamePhaseWaiting: 'Aguardando',
    gamePhasePreflop: 'Pré-flop',
    gamePhaseFlop: 'Flop',
    gamePhaseTurn: 'Turn',
    gamePhaseRiver: 'River',
    gamePhaseShowdown: 'Showdown',
    gamePot: 'POTE',
    gameYou: 'Você',
    gameYourCards: 'SUAS CARTAS',
    gameDealer: 'D',
    gameSpeechFold: 'Fold.',
    gameSpeechCheck: 'Check.',
    gameSpeechCall: 'Call.',
    gameSpeechRaise: 'Raise.',
    gameSpeechAllin: 'All-in!',
    gameSpeechWin: 'Ganhou o pote!',
    gameSpeechLose: 'A próxima mão será minha.',
    gameLeaveTitle: 'Sair da Mesa',
    gameLeaveBody: 'Escolha como deseja sair da partida:',
    gameLeaveSaveBtn: 'Sair e Continuar Depois',
    gameLeaveSaveDesc: 'Se escolher "Sair e Continuar Depois", a mesa atual será salva.',
    gameLeaveAbandonBtn: 'Abandonar Partida',
    gameLeaveAbandonDesc: 'Se escolher "Abandonar Partida", a mesa será fechada. As fichas apostadas nesta rodada serão perdidas e você não levará nada deste pote.',
    gameTimeWarning: 'Sua vez! Decidindo...',
    gameProcessing: 'Dealer agindo...',
    gameActionFold: 'Fold',
    gameActionCheck: 'Check',
    gameActionCall: 'Call',
    gameActionRaise: 'Raise',
    gameActionAllin: 'All-in',

    // Player Seat & Controls
    playerYourCardsLabel: 'Suas Cartas',
    seatFolded: 'Fold',
    seatChecked: 'Check',
    seatCalled: 'Call',
    seatRaised: 'Raise',
    seatAllin: 'All In',

    // Results Bottom Sheet / Overlay
    resultsSummaryTitle: 'Resumo da Mesa',
    resultsWinner: 'Vencedor!',
    resultsWinners: 'Vencedores!',
    resultsNextHand: 'Próxima Mão',
    resultsSplitPot: 'Pote Dividido!',
    resultsScoreboard: 'Classificação',
    resultsPlayer: 'Jogador',
    resultsCards: 'Cartas',
    resultsResult: 'Resultado',
    resultsMinimisedTooltip: 'Minimizar e ver a mesa',

    // Hands Guide / Hand Rankings
    handsGuideTitle: 'Guia de Mãos',
    handsGuideHighCard: 'Carta Alta',
    handsGuideHighCardDesc: 'Nenhuma combinação. A maior carta da mão define a força.',
    handsGuideOnePair: 'Um Par',
    handsGuideOnePairDesc: 'Duas cartas do mesmo valor.',
    handsGuideTwoPairs: 'Dois Pares',
    handsGuideTwoPairsDesc: 'Dois pares diferentes de cartas.',
    handsGuideThreeKind: 'Trinca',
    handsGuideThreeKindDesc: 'Três cartas do mesmo valor.',
    handsGuideStraight: 'Sequência',
    handsGuideStraightDesc: 'Cinco cartas sequenciais de naipes diferentes.',
    handsGuideFlush: 'Flush',
    handsGuideFlushDesc: 'Cinco cartas do mesmo naipe, não sequenciais.',
    handsGuideFullHouse: 'Full House',
    handsGuideFullHouseDesc: 'Uma trinca combinada com um par.',
    handsGuideFourKind: 'Quadra',
    handsGuideFourKindDesc: 'Quatro cartas do mesmo valor.',
    handsGuideStraightFlush: 'Straight Flush',
    handsGuideStraightFlushDesc: 'Cinco cartas sequenciais do mesmo naipe.',
    handsGuideRoyalFlush: 'Royal Flush',
    handsGuideRoyalFlushDesc: 'A, K, Q, J, 10 do mesmo naipe.',

    // Logs & Status
    logPostSB: 'pagou o Small Blind de',
    logPostBB: 'pagou o Big Blind de',
    logFold: 'deu fold',
    logCheck: 'deu check',
    logCall: 'deu call',
    logRaise: 'deu raise para',
    logAllIn: 'deu ALL-IN com',
    logWinPot: 'ganhou o pote de',
    logSplitPot: 'O pote foi dividido entre'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'pt' || saved === 'en') return saved;
    // Default to 'en' (primary focus on English)
    return 'en';
  });

  // Sync language selection from cloud profile on login
  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      const dbLang = profile.language as Language;
      setLanguageState(dbLang);
      localStorage.setItem('language', dbLang);
    }
  }, [profile?.language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { language: lang }, { merge: true });
      } catch (error) {
        console.error('Error saving language preference to Firestore:', error);
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
