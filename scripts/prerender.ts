import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const APP_URL = 'https://poker-texas-holdem-mobile.vercel.app';

interface PrerenderRoute {
  path: string;
  title: string;
  description: string;
  ogType: string;
  ogImageQuery: string;
  jsonLd: Record<string, any>[];
  staticHtml: string;
}

const routesToPrerender: PrerenderRoute[] = [
  // 1. Odds Calculator
  {
    path: '/ferramentas/calculadora-de-equidade',
    title: 'Calculadora de Odds de Poker | Texas Hold\'em Mobile',
    description: 'Calcule as probabilidades de vitória e a equidade das suas mãos de Poker Texas Hold\'em em tempo real usando nossa calculadora com simulações Monte Carlo.',
    ogType: 'website',
    ogImageQuery: 'type=profile&username=CalculadoraOdds&winrate=100%25&balance=Odds&matches=1000',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Calculadora de Equidade de Poker",
        "operatingSystem": "All",
        "applicationCategory": "GameApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Como a calculadora calcula as probabilidades?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Nossa ferramenta utiliza um algoritmo de simulação Monte Carlo. Ela pega as cartas selecionadas e executa 1.000 distribuições aleatórias das cartas restantes para o Flop, Turn e River."
            }
          },
          {
            "@type": "Question",
            "name": "O que é Equidade (Equity) no poker?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A equidade representa a sua parte esperada do pote no longo prazo, expressa como uma porcentagem."
            }
          }
        ]
      }
    ],
    staticHtml: `
      <div class="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans">
        <header class="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10">
          <div class="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70">&lt;</div>
          <span class="font-black uppercase tracking-wider text-xs text-[#DEB887]">Ferramentas de Poker</span>
          <div class="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[#DEB887]">🔄</div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
          <div class="text-center">
            <h1 class="text-2xl font-black uppercase tracking-tight">Calculadora de <span class="text-[#98D8BA]">Equidade</span></h1>
            <p class="text-white/60 text-xs mt-1">Calcule probabilidades de vitória em tempo real.</p>
          </div>
          <div class="bg-black/30 border border-[#DEB887]/15 rounded-3xl p-5 flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-widest text-[#98D8BA]">Você (Hero)</span>
                <div class="flex gap-2"><div class="w-9 h-13 bg-black/40 border border-white/20 rounded-[4px]"></div><div class="w-9 h-13 bg-black/40 border border-white/20 rounded-[4px]"></div></div>
              </div>
              <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-widest text-[#DEB887]">Oponente</span>
                <div class="flex gap-2"><div class="w-9 h-13 bg-black/40 border border-white/20 rounded-[4px]"></div><div class="w-9 h-13 bg-black/40 border border-white/20 rounded-[4px]"></div></div>
              </div>
            </div>
          </div>
          <div class="bg-black/25 border border-white/5 rounded-3xl p-5 text-center text-white/30 text-xs">
            Selecione as cartas acima para ver as probabilidades.
          </div>
        </main>
      </div>
    `
  },
  // 2. Hand Replay 1
  {
    path: '/replay/hand_1',
    title: 'Replay de Mão: Split Pot com Q-Q-2-6-6 | Texas Hold\'em Mobile',
    description: 'Assista ao replay da mão clássica de Texas Hold\'em onde dois jogadores empataram o pote de $1,400 com dois pares e kicker de Ás.',
    ogType: 'video.other',
    ogImageQuery: 'type=replay&pot=1400&board=Qc,Qs,2c,6h,6s&p1=Ad,As&p2=Jd,Js&winnerText=DIVIDIDO&desc=DOIS%20PARES%20DE%20RAINHAS%20E%20SEIS&p1Name=Hero&p2Name=Bot%20Gabriel',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": "Replay de Poker Hand 1",
        "description": "Split Pot com Q-Q-2-6-6 no board"
      }
    ],
    staticHtml: `
      <div class="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans">
        <header class="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10">
          <span class="font-black uppercase tracking-wider text-xs text-[#DEB887]">Replay de Jogada</span>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
          <div class="text-center">
            <h1 class="text-xl font-black uppercase text-white">Split Pot Histórico com Dois Pares de Rainhas</h1>
            <p class="text-white/60 text-xs mt-1">Pote Total: $1,400</p>
          </div>
          <div class="bg-black/20 border border-white/5 rounded-3xl p-5 text-xs text-white/70">
            <h3 class="font-bold text-[#DEB887] mb-2 uppercase">Histórico da Jogada (Play-by-play)</h3>
            <p>1. Pré-flop: Blinds postados. Bot Rafael posta SB ($10), Bot Sophia posta BB ($20).</p>
            <p>2. Flop: Q♣ Q♠ 2♣ apostas de $50 são pagas.</p>
            <p>3. Turn: 6♥ aposta e raise para $200.</p>
            <p>4. River: 6♠ aposta de $200 de Bot Gabriel e call de Você. Pote dividido!</p>
          </div>
        </main>
      </div>
    `
  },
  // 3. Hand Replay 2
  {
    path: '/replay/hand_2',
    title: 'Replay de Mão: Royal Flush Épico de Espadas | Texas Hold\'em Mobile',
    description: 'Assista ao replay de um Royal Flush espetacular derrotando um Full House de Ases, acumulando um pote de $5,200 no Showdown.',
    ogType: 'video.other',
    ogImageQuery: 'type=replay&pot=5200&board=As,Ks,Qs,Th,Tc&p1=Js,Ts&p2=Ah,Td&winnerText=VOC%C3%8A%20VENCEU!&desc=ROYAL%20FLUSH%20DE%20ESPADAS&p1Name=Você&p2Name=Bot%20Isabella',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": "Replay de Poker Hand 2",
        "description": "Royal Flush de Espadas vs Full House"
      }
    ],
    staticHtml: `
      <div class="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans">
        <header class="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10">
          <span class="font-black uppercase tracking-wider text-xs text-[#DEB887]">Replay de Jogada</span>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
          <div class="text-center">
            <h1 class="text-xl font-black uppercase text-white">Royal Flush contra Full House de Ases</h1>
            <p class="text-white/60 text-xs mt-1">Pote Total: $5,200</p>
          </div>
          <div class="bg-black/20 border border-white/5 rounded-3xl p-5 text-xs text-white/70">
            <h3 class="font-bold text-[#DEB887] mb-2 uppercase">Histórico da Jogada</h3>
            <p>1. Pré-flop: Aumento de Isabella para $60. Hero paga com J♠ 10♠.</p>
            <p>2. Flop: A♠ K♠ Q♠. Aposta de $100 de Isabella, Hero paga com Royal Flush draw.</p>
            <p>3. Turn: 10♥. Aposta de $250 de Isabella, Hero paga.</p>
            <p>4. River: 10♣. Isabella vai All-in de $2,190. Hero paga com Royal Flush e vence!</p>
          </div>
        </main>
      </div>
    `
  },
  // 4. Hand Replay 3
  {
    path: '/replay/hand_3',
    title: 'Replay de Mão: Quadra de Ás contra Full House de Reis | Texas Hold\'em Mobile',
    description: 'Assista a esta jogada dolorosa onde uma Quadra de Ás no Showdown levou um pote gigante de $8,400 batendo um Full House de Reis.',
    ogType: 'video.other',
    ogImageQuery: 'type=replay&pot=8400&board=Ad,As,Kc,Kh,2s&p1=Ah,Ac&p2=Ks,Qd&winnerText=BOT%20RAFAEL%20VENCEU&desc=QUADRA%20DE%20%C3%81S&p1Name=Bot%20Rafael&p2Name=Você',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": "Replay de Poker Hand 3",
        "description": "Quadra de Ás vs Full House de Reis"
      }
    ],
    staticHtml: `
      <div class="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans">
        <header class="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10">
          <span class="font-black uppercase tracking-wider text-xs text-[#DEB887]">Replay de Jogada</span>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
          <div class="text-center">
            <h1 class="text-xl font-black uppercase text-white">Quadra de Ás Supera Full House de Reis</h1>
            <p class="text-white/60 text-xs mt-1">Pote Total: $8,400</p>
          </div>
          <div class="bg-black/20 border border-white/5 rounded-3xl p-5 text-xs text-white/70">
            <h3 class="font-bold text-[#DEB887] mb-2 uppercase">Histórico da Jogada</h3>
            <p>1. Pré-flop: Aumento de Hero para $60. Rafael faz 3-Bet para $180 com Ás-Ás.</p>
            <p>2. Flop: A♦ A♠ K♣. Rafael passa, Hero aposta $150, Rafael paga.</p>
            <p>3. Turn: K♥. Hero aposta $400, Rafael aumenta para $1,000. Hero paga.</p>
            <p>4. River: 2♠. Rafael vai All-in de $2,860. Hero paga com Reis cheios de Ás e Rafael mostra Quadra!</p>
          </div>
        </main>
      </div>
    `
  },
  // 5. Player 1 Profile
  {
    path: '/profile/player_1',
    title: 'Estatísticas de João Guilherme | Texas Hold\'em Mobile',
    description: 'Estatísticas completas e curva de lucro do jogador João Guilherme no Texas Hold\'em Poker Mobile. Win Rate: 58.2%, Saldo: $15,400.',
    ogType: 'profile',
    ogImageQuery: 'type=profile&username=JoaoGuilherme&winrate=58.2%25&balance=15,400&matches=142',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
          "@type": "Person",
          "name": "João Guilherme",
          "jobTitle": "Jogador de Poker VIP"
        }
      }
    ],
    staticHtml: `
      <div class="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans">
        <header class="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10">
          <span class="font-black uppercase tracking-wider text-xs text-[#DEB887]">Estatísticas de Jogador</span>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
          <div class="bg-black/35 border border-[#DEB887]/15 rounded-3xl p-6 text-center">
            <h1 class="text-xl font-black uppercase text-white">João Guilherme</h1>
            <span class="inline-block mt-1 px-3 py-1 bg-[#DEB887]/10 rounded-full text-[9px] font-black uppercase text-[#DEB887]">Lenda Vip</span>
            <div class="grid grid-cols-3 gap-2 mt-4 border-t border-white/5 pt-4">
              <div>Partidas: 142</div>
              <div>Win Rate: 58.2%</div>
              <div>Saldo: $15,400</div>
            </div>
          </div>
        </main>
      </div>
    `
  },
  // 6. Player 2 Profile
  {
    path: '/profile/player_2',
    title: 'Estatísticas de Bot Rafael | Texas Hold\'em Mobile',
    description: 'Estatísticas completas e histórico de partidas do oponente Bot Rafael. Win Rate: 54.5%, Saldo: $8,410.',
    ogType: 'profile',
    ogImageQuery: 'type=profile&username=Bot%20Rafael&winrate=54.5%25&balance=8,410&matches=320',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
          "@type": "Person",
          "name": "Bot Rafael",
          "jobTitle": "Tubarão das Mesas"
        }
      }
    ],
    staticHtml: `
      <div class="min-h-screen bg-[#064e3b] text-white flex flex-col font-sans">
        <header class="w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-[#DEB887]/10">
          <span class="font-black uppercase tracking-wider text-xs text-[#DEB887]">Estatísticas de Jogador</span>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
          <div class="bg-black/35 border border-[#DEB887]/15 rounded-3xl p-6 text-center">
            <h1 class="text-xl font-black uppercase text-white">Bot Rafael</h1>
            <span class="inline-block mt-1 px-3 py-1 bg-[#DEB887]/10 rounded-full text-[9px] font-black uppercase text-[#DEB887]">Tubarão</span>
            <div class="grid grid-cols-3 gap-2 mt-4 border-t border-white/5 pt-4">
              <div>Partidas: 320</div>
              <div>Win Rate: 54.5%</div>
              <div>Saldo: $8,410</div>
            </div>
          </div>
        </main>
      </div>
    `
  }
];

function prerender() {
  console.log("Iniciando pré-renderização estática (SSG)...");

  // Read base index.html template from dist/
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Erro: Arquivo base ${templatePath} não encontrado! Certifique-se de rodar vite build primeiro.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');

  routesToPrerender.forEach(route => {
    console.log(`Pre-rendering route: ${route.path}`);
    
    // 1. Create target folder structure
    const routeFolder = path.join(distDir, route.path);
    fs.mkdirSync(routeFolder, { recursive: true });

    // 2. Generate custom metadata injections
    const ogImage = `${APP_URL}/api/og?${route.ogImageQuery}`;
    const canonicalUrl = `${APP_URL}${route.path}`;

    const headInjections = `
    <title>${route.title}</title>
    <meta name="description" content="${route.description}">
    <link rel="canonical" href="${canonicalUrl}">
    <!-- Open Graph -->
    <meta property="og:type" content="${route.ogType}">
    <meta property="og:title" content="${route.title}">
    <meta property="og:description" content="${route.description}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Poker Texas Hold'em Mobile">
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${route.title}">
    <meta name="twitter:description" content="${route.description}">
    <meta name="twitter:image" content="${ogImage}">
    <!-- JSON-LD Structured Data -->
    ${route.jsonLd.map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('\n    ')}
    `;

    // 3. Insert head elements (replace default titles or append)
    let renderedHtml = baseHtml;
    
    // Strip default Title tag if present
    renderedHtml = renderedHtml.replace(/<title>.*?<\/title>/gi, '');
    
    // Append to </head>
    renderedHtml = renderedHtml.replace('</head>', `${headInjections}\n</head>`);

    // 4. Inject static visual shell inside <div id="root">
    const rootSearchStr = '<div id="root"></div>';
    if (renderedHtml.includes(rootSearchStr)) {
      renderedHtml = renderedHtml.replace(rootSearchStr, `<div id="root">${route.staticHtml}</div>`);
    } else {
      // Fallback
      renderedHtml = renderedHtml.replace(/<div id="root">\s*<\/div>/gi, `<div id="root">${route.staticHtml}</div>`);
    }

    // 5. Write to dist folder
    const targetFile = path.join(routeFolder, 'index.html');
    fs.writeFileSync(targetFile, renderedHtml, 'utf8');
    console.log(`Saved: ${targetFile}`);
  });

  // 6. Generate sitemap.xml
  console.log("Generating sitemap.xml...");
  const today = new Date().toISOString().split('T')[0];
  const staticPaths = ['', '/login', '/ferramentas/calculadora-de-equidade', '/replay/hand_1', '/replay/hand_2', '/replay/hand_3', '/profile/player_1', '/profile/player_2'];
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths.map(sp => `  <url>
    <loc>${APP_URL}${sp}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${sp === '' || sp.includes('profile') ? 'daily' : 'weekly'}</changefreq>
    <priority>${sp === '' ? '1.0' : sp.includes('ferramentas') ? '0.9' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent.trim(), 'utf8');
  console.log(`Saved: ${path.join(distDir, 'sitemap.xml')}`);
  console.log("Pré-renderização concluída com sucesso!");
}

prerender();
