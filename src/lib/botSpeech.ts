// Helper to provide bot speeches based on scenario and distinct personalities
export type SpeechScenario = 'pre-flop-raise' | 'flop-raise' | 'fold' | 'win' | 'lose' | 'bluff-call' | 'all-in';

export const botPersonalities: Record<string, Record<SpeechScenario | 'idle', Record<'en' | 'pt', string[]>>> = {
  'Bot Daniel': {
    // The Calculator / Nerd: logical, talks about odds, math, stats
    'pre-flop-raise': {
      en: [
        "Standard raise by position.",
        "Odds justify the raise.",
        "Odds calculated. Raise.",
        "Following mathematical range.",
        "Positive EV. Raise.",
        "Pure stats. Raising.",
        "Basic pre-flop math."
      ],
      pt: [
        "Aumento padrão por posição.",
        "As odds justificam o raise.",
        "Odds calculadas. Raise.",
        "Seguindo o range matemático.",
        "EV positivo. Raise.",
        "Estatística pura. Aumento.",
        "Matemática básica pré-flop."
      ]
    },
    'flop-raise': {
      en: [
        "High probability now. Raise.",
        "Variance in my favor.",
        "Flop within projection.",
        "Your range loses here.",
        "Equity increased. Raise.",
        "Mathematically superior. Raised.",
        "The numbers demand a raise."
      ],
      pt: [
        "Probabilidade alta agora. Raise.",
        "Variância a meu favor.",
        "Flop dentro da projeção.",
        "Seu range perde aqui.",
        "Equidade subiu. Raise.",
        "Matematicamente superior. Aumentei.",
        "Os números pedem raise."
      ]
    },
    'fold': {
      en: [
        "Bad odds. Fold.",
        "High standard deviation. Out.",
        "Negative EV. Fold.",
        "EV-. Folds.",
        "Math does not check out.",
        "Statistically unfeasible.",
        "Unnecessary risk."
      ],
      pt: [
        "Odds ruins. Fold.",
        "Desvio padrão alto. Fui.",
        "EV negativo. Fold.",
        "EV-. Desisto.",
        "Matemática não bate.",
        "Estatisticamente inviável.",
        "Risco desnecessário."
      ]
    },
    'win': {
      en: [
        "Long term wins.",
        "Math doesn't lie.",
        "Exact probability.",
        "Just the expected EV+.",
        "Applied logic. Won.",
        "Stats confirmed.",
        "Calculated result."
      ],
      pt: [
        "Longo prazo vence.",
        "A matemática não mente.",
        "Probabilidade exata.",
        "Apenas o EV+ esperado.",
        "Lógica aplicada. Ganhei.",
        "Estatística confirmada.",
        "Resultado calculado."
      ]
    },
    'lose': {
      en: [
        "5% bad beat.",
        "Just variance.",
        "Math was right, cards were unlucky.",
        "Small sample size.",
        "Statistical deviation.",
        "Probability anomaly.",
        "The 10% hit."
      ],
      pt: [
        "Bad beat de 5%.",
        "Apenas variância.",
        "Matemática certa, azar nas cartas.",
        "Amostragem pequena.",
        "Desvio estatístico.",
        "Anomalia na probabilidade.",
        "Os 10% bateram."
      ]
    },
    'bluff-call': {
      en: [
        "Your bluff range is high. Call.",
        "Impossible for you to hold the nuts.",
        "Call is EV+.",
        "High bluff frequency. Paying.",
        "Math says it is a bluff.",
        "Stats demand the call.",
        "Calculated call."
      ],
      pt: [
        "Seu range de blefe é alto. Call.",
        "Impossível você ter o nuts.",
        "Call é EV+.",
        "Frequência de blefe alta. Pago.",
        "Matemática diz que é blefe.",
        "Estatística pede o call.",
        "Call calculado."
      ]
    },
    'all-in': {
      en: [
        "Maximum probability. All-in.",
        "100% of stack. It's logical.",
        "Calculated risk. All-in.",
        "No statistical doubt. All-in!",
        "Maximum value bet.",
        "Total equity in the center.",
        "Variance ignored. All-in!"
      ],
      pt: [
        "Probabilidade máxima. All-in.",
        "100% do stack. É lógico.",
        "Risco calculado. All-in.",
        "Sem dúvidas estatísticas. All-in!",
        "Aposta de valor máximo.",
        "Equidade total no centro.",
        "Variância ignorada. All-in!"
      ]
    },
    'idle': {
      en: [
        "Calculating ranges...",
        "Analyzing patterns...",
        "Variance is sample size.",
        "Reviewing equations...",
        "Updating statistics...",
        "Calculating GTO...",
        "Math never sleeps."
      ],
      pt: [
        "Calculando ranges...",
        "Analisando padrões...",
        "Variância é amostragem.",
        "Revisando equações...",
        "Atualizando estatísticas...",
        "Calculando GTO...",
        "Matemática nunca dorme."
      ]
    }
  },
  'Bot Bob': {
    // The Aggressive / Trash Talker: arrogant, competitive, taunts others
    'pre-flop-raise': {
      en: [
        "Scared? Raise!",
        "I run this. Raise!",
        "Inflating the pot now!",
        "Stop licking chips. Raise.",
        "Pay up or run!",
        "Raised! Wanna cry?",
        "Poker for real men. Raise."
      ],
      pt: [
        "Com medo? Raise!",
        "Eu mando aqui. Raise!",
        "Inflando o pote agora!",
        "Chega de lamber ficha. Raise.",
        "Paga logo ou foge!",
        "Aumentei! Vai chorar?",
        "Poker pra homem. Raise."
      ]
    },
    'flop-raise': {
      en: [
        "Your bluff is garbage. Raise!",
        "No way you hit. Raising!",
        "Who has guts? Raise!",
        "Felt the pressure, huh?",
        "Running away in 3, 2, 1...",
        "Pure aggression here!",
        "I will crush you on this flop."
      ],
      pt: [
        "Seu blefe é lixo. Raise!",
        "Duvido que acertou. Aumentei!",
        "Quem tem coragem? Raise!",
        "Sentiu a pressão, né?",
        "Fugindo em 3, 2, 1...",
        "Aqui é agressão pura!",
        "Vou te esmagar no flop."
      ]
    },
    'fold': {
      en: [
        "Garbage hand. Keep the pot.",
        "Keep it warm for me, I'll be back.",
        "Too lazy to clean you out today.",
        "Fold. Surviving to break you later.",
        "Not even wasting my time.",
        "Keep the crumbs.",
        "Trash cards."
      ],
      pt: [
        "Mão lixo. Fica com o pote.",
        "Guarda pra mim, volto já.",
        "Preguiça de te limpar hoje.",
        "Fold. Sobrevivendo pra te quebrar.",
        "Nem perco meu tempo.",
        "Fica com as migalhas.",
        "Lixo de cartas."
      ]
    },
    'win': {
      en: [
        "Broke you! Too easy!",
        "I am the king here!",
        "Come to daddy! I'm a monster!",
        "You guys play so bad.",
        "Cry some more!",
        "Where is the tough guy now?",
        "Swept the table again."
      ],
      pt: [
        "Te quebrei! Muito fácil!",
        "Eu sou o rei daqui!",
        "Vem pro papai! Sou monstro!",
        "Vocês jogam muito mal.",
        "Chora mais!",
        "Cadê o machão agora?",
        "Limpei a mesa de novo."
      ]
    },
    'lose': {
      en: [
        "Pure luck!",
        "What a massive fluke!",
        "The dealer saved you on that one.",
        "Beginner's luck.",
        "Trash deck!",
        "You play bad and still win.",
        "You won't get that lucky again."
      ],
      pt: [
        "Pura sorte sua!",
        "Que cagada monstra!",
        "O dealer te salvou dessa.",
        "Sorte de principiante.",
        "Baralho lixo!",
        "Você joga mal e ganha.",
        "Não vai ter essa sorte de novo."
      ]
    },
    'bluff-call': {
      en: [
        "Pure air! Calling to laugh at you!",
        "Bluffing against me? Joke. Call!",
        "Lies have short legs. Paying!",
        "Cheap bluff. Call!",
        "Trying to steal from me? Call!",
        "Show your garbage.",
        "I read your soul. Call."
      ],
      pt: [
        "Puro ar! Pago pra rir de você!",
        "Blefando contra mim? Piada. Call!",
        "Mentira tem perna curta. Pago!",
        "Blefe mixuruca. Call!",
        "Tentando me roubar? Pago!",
        "Mostra logo seu lixo.",
        "Eu leio sua alma. Call."
      ]
    },
    'all-in': {
      en: [
        "All on the felt! Where's your guts?",
        "All in! Call if you're a man!",
        "All mine. All-in!",
        "Game over. All-in!",
        "Breaking you now. All-in!",
        "Kneel and cry. All-in!",
        "Betting your dignity. All-in."
      ],
      pt: [
        "Tudo no pano! Cadê a coragem?",
        "Vem tudo! Paga se for homem!",
        "Tudo meu. All-in!",
        "Acabou a brincadeira. All-in!",
        "Te quebrando agora. All-in!",
        "Ajoelha e chora. All-in!",
        "Apostando sua dignidade. All-in."
      ]
    },
    'idle': {
      en: [
        "Gonna play or just stall?",
        "Anyone here got guts?",
        "My chips are collecting dust.",
        "Ready to clean everyone out.",
        "Hurry up, cowards.",
        "Takes an eternity to fold, impressive.",
        "Am I playing with turtles?"
      ],
      pt: [
        "Vão jogar ou enrolar?",
        "Alguém aí tem coragem?",
        "Minhas fichas tão mofando.",
        "Pronto pra limpar geral.",
        "Anda logo, covardes.",
        "Demora pra foldar, impressionante.",
        "Estou jogando com tartarugas?"
      ]
    }
  },
  'Bot Carol': {
    // The Lucky / Anxious / Superstitious: nervous, friendly, polite
    'pre-flop-raise': {
      en: [
        "Sorry guys... I will raise.",
        "Good cards, raise!",
        "Risking a raise...",
        "A slight raise...",
        "Oh I'm scared, but raise.",
        "Root for me! Raise.",
        "Just a little bit more..."
      ],
      pt: [
        "Gente, desculpa... vou aumentar.",
        "Cartas boas, raise!",
        "Arriscando um raise...",
        "Um raise de leve...",
        "Ai que medo, mas raise.",
        "Torçam por mim! Raise.",
        "Só um pouquinho a mais..."
      ]
    },
    'flop-raise': {
      en: [
        "The flop helped... raise!",
        "Oh my God... raised!",
        "Don't be mad... raise.",
        "Cute flop, raise!",
        "Am I doing this right? Raise.",
        "I think I have a game...",
        "Closing my eyes and... raise!"
      ],
      pt: [
        "O flop ajudou... raise!",
        "Ai meu Deus... aumentei!",
        "Não fiquem bravos... raise.",
        "Flop bonitinho, raise!",
        "Será que faço certo? Raise.",
        "Acho que tenho jogo...",
        "Fechando os olhos e... raise!"
      ]
    },
    'fold': {
      en: [
        "Bad cards. Fold.",
        "Sneaking away... fold.",
        "I don't want to lose. Out.",
        "Waiting for a better one. Fold.",
        "Oh, scared of this flop. Ran.",
        "I'll pass this time...",
        "Oh, too heavy for me. Fold."
      ],
      pt: [
        "Cartas ruins. Fold.",
        "Saindo de fininho... fold.",
        "Não quero perder. Fui.",
        "Espero uma melhor. Fold.",
        "Ai que medo desse flop. Corri.",
        "Passo dessa vez...",
        "Ui, pesado pra mim. Fold."
      ]
    },
    'win': {
      en: [
        "What luck! Thank you!",
        "I won! What a relief!",
        "Oh my heart! I won!",
        "Thank you, guys!",
        "It worked! Yay!",
        "The fairies helped!",
        "Wow, I can't believe it!"
      ],
      pt: [
        "Que sorte! Obrigada!",
        "Ganhei! Que alívio!",
        "Ai meu coração! Ganhei!",
        "Obrigada, gente!",
        "Deu certo! Uhu!",
        "As fadinhas ajudaram!",
        "Nossa, nem acredito!"
      ]
    },
    'lose': {
      en: [
        "Gee, the cards hate me.",
        "Lost my little chips...",
        "Oh, how sad.",
        "Congrats, well played.",
        "Not this time...",
        "Aww, what a shame.",
        "It was too good to be true."
      ],
      pt: [
        "Poxa, as cartas me odeiam.",
        "Perdi minhas fichinhas...",
        "Ai, que triste.",
        "Parabéns, jogou bem.",
        "Não foi dessa vez...",
        "Buá, que pena.",
        "Tava boa demais pra ser verdade."
      ]
    },
    'bluff-call': {
      en: [
        "Scared, but calling.",
        "Bluffing? I'll call.",
        "Don't show a better hand! Calling.",
        "Slight call to see.",
        "Hey, you can't fool me... Call.",
        "Hope I don't regret this. Paying.",
        "Called with a prayer."
      ],
      pt: [
        "Com medo, mas pago.",
        "Blefando? Vou pagar.",
        "Não me mostre jogo melhor! Pago.",
        "Call de leve pra ver.",
        "Aí, não me engana... Call.",
        "Espero não me arrepender. Pago.",
        "Paguei rezando."
      ]
    },
    'all-in': {
      en: [
        "Whatever God wills. All-in!",
        "How scary! All-in!",
        "Shaking with fear... All-in!",
        "Double or nothing. Luck help me!",
        "Closed my eyes! All-in!",
        "All my little chips! All-in!",
        "Oh, my stomach... All-in!"
      ],
      pt: [
        "Seja o que Deus quiser. All-in!",
        "Que assustador! All-in!",
        "Tremendo de medo... All-in!",
        "Tudo ou nada. Sorte me ajuda!",
        "Fechei os olhos! All-in!",
        "Todas as minhas fichinhas! All-in!",
        "Ai, meu estômago... All-in!"
      ]
    },
    'idle': {
      en: [
        "What a cool suspense...",
        "Deck, please be nice.",
        "Hoping for a pretty hand.",
        "Exciting and scary!",
        "Oh, butterflies in my stomach...",
        "Wish I had an Ace now...",
        "Crossing my fingers!"
      ],
      pt: [
        "Que suspense legal...",
        "Baralho, seja bonzinho.",
        "Torcendo por mão bonita.",
        "Emocionante e assustador!",
        "Ai que frio na barriga...",
        "Queria um Ás agora...",
        "Cruzando os dedinhos!"
      ]
    }
  },
  'Bot Ana': {
    // The Impatient / Sarcastic / Swift: snappy, fast, hates waiting, sarcastic
    'pre-flop-raise': {
      en: [
        "Let's speed this up. Raise.",
        "Wake up. Raise.",
        "Clearing out the indecisive. Raise.",
        "Tired of this slowness. Raised.",
        "Click the button already! Raise.",
        "Hurry up. Raise.",
        "No pre-flop stalling."
      ],
      pt: [
        "Bora acelerar isso. Raise.",
        "Acordem. Raise.",
        "Limpando indecisos. Raise.",
        "Cansei de lerdeza. Aumentei.",
        "Clica logo nesse botão! Raise.",
        "Agiliza aí. Raise.",
        "Sem enrolação pré-flop."
      ]
    },
    'flop-raise': {
      en: [
        "Your slow play is tiring. Raise.",
        "Raise to make you cry.",
        "No more checking. Raise!",
        "Liveliness for this stagnation. Raise.",
        "Don't fall asleep! Raised.",
        "Fast play, learn. Raise.",
        "Less talk, more betting."
      ],
      pt: [
        "Seu jogo lerdo cansa. Raise.",
        "Raise pra fazer chorar.",
        "Chega de check. Raise!",
        "Animando esse marasmo. Raise.",
        "Dorme não! Aumentei.",
        "Jogada rápida, aprende. Raise.",
        "Menos papo, mais aposta."
      ]
    },
    'fold': {
      en: [
        "Boring. Out.",
        "Trash. Wasting no time.",
        "Next hand already. Fold.",
        "Not even wasting a brain cell. Out.",
        "Bye to you guys.",
        "I want the next one now.",
        "Discarded."
      ],
      pt: [
        "Tédio. Fui.",
        "Lixo. Não perco tempo.",
        "Próxima logo. Fold.",
        "Nem gasto neurônio. Fui.",
        "Tchau pra vocês.",
        "Quero a próxima já.",
        "Descartado."
      ]
    },
    'win': {
      en: [
        "Finally. My pot.",
        "My pot. Next!",
        "Slow and bad.",
        "Zero news. Won.",
        "Thank God, it's over.",
        "I knew it. Next.",
        "Got it. Next turtle?"
      ],
      pt: [
        "Até que enfim. Pote meu.",
        "Pote meu. Próxima!",
        "Lerdos e ruins.",
        "Zero novidades. Ganhei.",
        "Graças a Deus, acabou.",
        "Eu sabia. Próxima.",
        "Peguei. Próximo lerdão?"
      ]
    },
    'lose': {
      en: [
        "Luck of bad players.",
        "What a waste of time!",
        "Luck in the deck, not talent.",
        "Congrats on the miracle.",
        "I won't even comment.",
        "Robbed.",
        "Ugh, move on to the next one already."
      ],
      pt: [
        "Sorte de quem joga mal.",
        "Que perda de tempo!",
        "Sorte no baralho, não talento.",
        "Parabéns pelo milagre.",
        "Não vou nem comentar.",
        "Roubado.",
        "Afff, passa logo pra próxima."
      ]
    },
    'bluff-call': {
      en: [
        "Obvious and boring bluff. Call.",
        "Two seconds to read you. Call.",
        "Paid to watch you embarrass yourself.",
        "Enough theater. Paying.",
        "It is so obvious it's sad. Call.",
        "Go act in the movies. Call.",
        "No patience for bluffs. Call."
      ],
      pt: [
        "Blefe óbvio e chato. Call.",
        "Dois segundos pra ler você. Call.",
        "Paguei pra te ver passar vergonha.",
        "Chega de teatro. Pago.",
        "Tá tão na cara que dá dó. Pago.",
        "Vai atuar assim no cinema. Call.",
        "Sem paciência pra blefe. Call."
      ]
    },
    'all-in': {
      en: [
        "Tired of waiting. All-in!",
        "Gonna stall or play? All-in!",
        "All mine. Run or pay?",
        "All-in to see if you wake up.",
        "Resolving this now. All-in!",
        "No patience: ALL-IN.",
        "Pay up or get out."
      ],
      pt: [
        "Cansei de esperar. All-in!",
        "Vai enrolar ou jogar? All-in!",
        "Tudo meu. Corre ou paga?",
        "All-in pra ver se acordam.",
        "Resolving isso já. All-in!",
        "Sem paciência: ALL-IN.",
        "Paga logo ou dá o fora."
      ]
    },
    'idle': {
      en: [
        "Almost falling asleep here.",
        "Is this poker or therapy?",
        "You think too much, seriously.",
        "Did your mouse break?",
        "Play already!",
        "Anyone awake there?",
        "My patience is already gone."
      ],
      pt: [
        "Tô quase dormindo aqui.",
        "É poker ou terapia?",
        "Pensam demais, credo.",
        "O mouse quebrou?",
        "Joga logooo!",
        "Alguém acordado aí?",
        "Minha paciência já acabou."
      ]
    }
  },
  'Bot Thalita': {
    // The Quiet / Stoic / Observer: quiet, reads tells, calm, cold-blooded
    'pre-flop-raise': {
      en: [
        "Tactical adjustment. Raise.",
        "Pressure applied.",
        "Quietly raising the stakes.",
        "The price went up.",
        "Calculating read. Raise.",
        "Necessary move.",
        "Testing the waters. Raise."
      ],
      pt: [
        "Ajuste tático. Raise.",
        "Pressão aplicada.",
        "Subindo o valor em silêncio.",
        "O preço subiu.",
        "Calculando leitura. Raise.",
        "Movimento necessário.",
        "Teste de águas. Raise."
      ]
    },
    'flop-raise': {
      en: [
        "I saw that. Raise.",
        "Stance changed. Raise.",
        "Mental pressure. Raise.",
        "Less talk, more action. Raise.",
        "You hesitated. Raised.",
        "Obvious body language. Raise.",
        "Taking you out of your comfort zone."
      ],
      pt: [
        "Eu vi isso. Raise.",
        "Postura mudou. Raise.",
        "Pressão mental. Raise.",
        "Menos fala, mais ação. Raise.",
        "Você hesitou. Aumento.",
        "Linguagem corporal óbvia. Raise.",
        "Tirando você da zona de conforto."
      ]
    },
    'fold': {
      en: [
        "Read says fold.",
        "No value. Out.",
        "Retreating in silence.",
        "Waiting for my time. Fold.",
        "Patience. Fold.",
        "Strategic retreat.",
        "Wrong moment."
      ],
      pt: [
        "Leitura diz fold.",
        "Sem valor. Fui.",
        "Recuando em silêncio.",
        "Espero a minha hora. Fold.",
        "Paciência. Fold.",
        "Fuga estratégica.",
        "Momento errado."
      ]
    },
    'win': {
      en: [
        "Silence wins. My pot.",
        "Accurate read.",
        "Your eyes gave you away.",
        "No drama. Victory.",
        "Just as I predicted.",
        "Focus brings results.",
        "Your posture betrayed you."
      ],
      pt: [
        "Silêncio vence. Pote meu.",
        "Leitura precisa.",
        "Os olhos te entregaram.",
        "Sem drama. Vitória.",
        "Como eu previ.",
        "Foco gera resultado.",
        "Sua postura te traiu."
      ]
    },
    'lose': {
      en: [
        "Hid it well. Congratulations.",
        "Good play. Your point.",
        "Lost chips, gained information.",
        "Part of the game. Good hand.",
        "False read by me.",
        "Patience, it's a long game.",
        "Mentally noted."
      ],
      pt: [
        "Escondeu bem. Parabéns.",
        "Boa jogada. Ponto seu.",
        "Perdi fichas, ganhei informação.",
        "Faz parte. Boa mão.",
        "Falsa leitura minha.",
        "Paciência, é um jogo longo.",
        "Anotado mentalmente."
      ]
    },
    'bluff-call': {
      en: [
        "Blinked too much. Call.",
        "Too tense. Calling.",
        "Breathing gave you away. Call.",
        "Show the truth. Call.",
        "I don't believe you. Call.",
        "Your body says it is a bluff.",
        "Coldness. I pay."
      ],
      pt: [
        "Piscou demais. Call.",
        "Tenso demais. Pago.",
        "Respiração te entregou. Call.",
        "Mostre a verdade. Call.",
        "Eu não acredito em você. Call.",
        "Seu corpo diz que é blefe.",
        "Frieza. Eu pago."
      ]
    },
    'all-in': {
      en: [
        "All in silence. All-in.",
        "Decision made: All-in.",
        "End of reading. All-in.",
        "End of the line. All-in.",
        "Cold calculation. All-in.",
        "No emotion, just all the chips.",
        "Surgical strike. All-in."
      ],
      pt: [
        "Tudo em silêncio. All-in.",
        "Decisão tomada: All-in.",
        "Fim da leitura. All-in.",
        "Fim da linha. All-in.",
        "Cálculo frio. All-in.",
        "Sem emoção, apenas todas as fichas.",
        "Ataque cirúrgico. All-in."
      ]
    },
    'idle': {
      en: [
        "Observing the details...",
        "Silence is strategy.",
        "Reading micro-expressions...",
        "Studying postures...",
        "Calm and focus.",
        "Just breathing and analyzing..."
      ],
      pt: [
        "Observando os detalhes...",
        "Silêncio é estratégia.",
        "Lendo micro-expressões...",
        "Estudando posturas...",
        "Calma e foco.",
        "Apenas respirando e analisando..."
      ]
    }
  }
};

export function getBotSpeech(name: string, scenario: SpeechScenario, lang: 'en' | 'pt' = 'en'): string {
  const personality = botPersonalities[name];
  const activeLang = lang === 'pt' ? 'pt' : 'en';
  if (personality && personality[scenario]) {
    const phrases = personality[scenario][activeLang];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  // Safe fallback
  const fallback = botPersonalities['Bot Carol'][scenario][activeLang];
  return fallback[Math.floor(Math.random() * fallback.length)];
}

export function getRandomIdleSpeech(name: string, lang: 'en' | 'pt' = 'en'): string {
  const personality = botPersonalities[name];
  const activeLang = lang === 'pt' ? 'pt' : 'en';
  if (personality && personality['idle']) {
    const phrases = personality['idle'][activeLang];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  // Safe fallback
  const fallback = botPersonalities['Bot Carol']['idle'][activeLang];
  return fallback[Math.floor(Math.random() * fallback.length)];
}