import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';

// Helper to escape XML characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Map card string (e.g. "As", "Th", "2c") to render info
interface CardRenderInfo {
  rank: string;
  suitSymbol: string;
  color: string;
}

function parseCard(cardStr: string): CardRenderInfo {
  if (!cardStr || cardStr.length < 2) {
    return { rank: '?', suitSymbol: '?', color: '#94a3b8' };
  }
  const isTen = cardStr.length === 3;
  let rank = isTen ? '10' : cardStr[0].toUpperCase();
  if (rank === 'T') rank = '10';
  const suitChar = (isTen ? cardStr[2] : cardStr[1]).toLowerCase();

  let suitSymbol = '♠';
  let color = '#0f172a'; // dark slate/black

  if (suitChar === 'h' || suitChar === 'hearts') {
    suitSymbol = '♥';
    color = '#dc2626'; // red
  } else if (suitChar === 'd' || suitChar === 'diamonds') {
    suitSymbol = '♦';
    color = '#dc2626'; // red
  } else if (suitChar === 'c' || suitChar === 'clubs') {
    suitSymbol = '♣';
    color = '#0f172a';
  } else if (suitChar === 's' || suitChar === 'spades') {
    suitSymbol = '♠';
    color = '#0f172a';
  }

  return { rank, suitSymbol, color };
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const { query } = parse(req.url || '', true);
  const type = (query.type as string) || 'replay';

  let svgContent = '';

  if (type === 'profile') {
    const username = escapeXml((query.username as string) || 'Jogador Anonimo');
    const winrate = escapeXml((query.winrate as string) || '50%');
    const balance = escapeXml((query.balance as string) || '1,000');
    const matches = escapeXml((query.matches as string) || '0');

    svgContent = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Gradient -->
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#022c22" />
        </radialGradient>
        <!-- Gold Border Gradient -->
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DEB887" />
          <stop offset="50%" stop-color="#f5d0a9" />
          <stop offset="100%" stop-color="#c59f6d" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.5" />
        </filter>
      </defs>

      <!-- Background felt -->
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      
      <!-- Outer Gold Frame -->
      <rect x="25" y="25" width="1150" height="580" rx="30" fill="none" stroke="url(#goldGrad)" stroke-width="6" />
      <rect x="35" y="35" width="1130" height="560" rx="20" fill="none" stroke="#DEB887" stroke-width="1.5" stroke-opacity="0.3" />

      <!-- Left Column: User Profile Badge -->
      <g transform="translate(100, 100)" filter="url(#shadow)">
        <!-- Avatar Ring -->
        <circle cx="120" cy="120" r="100" fill="#022c22" stroke="url(#goldGrad)" stroke-width="5" />
        <circle cx="120" cy="120" r="88" fill="#064e3b" />
        <!-- Initial letter -->
        <text x="120" y="150" font-family="Inter, system-ui, sans-serif" font-size="90" font-weight="900" fill="#DEB887" text-anchor="middle">
          ${username.charAt(0).toUpperCase()}
        </text>

        <!-- User Info -->
        <text x="260" y="90" font-family="Inter, system-ui, sans-serif" font-size="52" font-weight="900" fill="#ffffff">
          ${username}
        </text>
        <rect x="260" y="115" width="180" height="35" rx="8" fill="#98D8BA" fill-opacity="0.1" stroke="#98D8BA" stroke-width="1" />
        <text x="350" y="138" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="900" fill="#98D8BA" text-anchor="middle" letter-spacing="2">
          JOGADOR VIP
        </text>
      </g>

      <!-- Mid-Section Dividers -->
      <line x1="100" y1="360" x2="1100" y2="360" stroke="#DEB887" stroke-opacity="0.15" stroke-width="2" />

      <!-- Bottom Grid: Stats -->
      <g transform="translate(100, 400)">
        <!-- Stat 1: Matches -->
        <g transform="translate(0, 0)">
          <rect width="280" height="130" rx="20" fill="#022c22" fill-opacity="0.6" stroke="#DEB887" stroke-opacity="0.1" stroke-width="2" />
          <text x="40" y="45" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#94a3b8" letter-spacing="1">PARTIDAS</text>
          <text x="40" y="98" font-family="JetBrains Mono, monospace" font-size="42" font-weight="900" fill="#ffffff">${matches}</text>
        </g>
        
        <!-- Stat 2: Win Rate -->
        <g transform="translate(360, 0)">
          <rect width="280" height="130" rx="20" fill="#022c22" fill-opacity="0.6" stroke="#98D8BA" stroke-opacity="0.2" stroke-width="2" />
          <text x="40" y="45" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#98D8BA" letter-spacing="1">TAXA DE VITÓRIA</text>
          <text x="40" y="98" font-family="JetBrains Mono, monospace" font-size="42" font-weight="900" fill="#98D8BA">${winrate}</text>
        </g>

        <!-- Stat 3: Balance -->
        <g transform="translate(720, 0)">
          <rect width="280" height="130" rx="20" fill="#022c22" fill-opacity="0.6" stroke="url(#goldGrad)" stroke-opacity="0.2" stroke-width="2" />
          <text x="40" y="45" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#DEB887" letter-spacing="1">SALDO TOTAL</text>
          <text x="40" y="98" font-family="JetBrains Mono, monospace" font-size="42" font-weight="900" fill="#DEB887">$${balance}</text>
        </g>
      </g>

      <!-- Right Column: Performance Trend Mini Chart -->
      <g transform="translate(700, 90)" filter="url(#shadow)">
        <rect width="400" height="230" rx="24" fill="#022c22" fill-opacity="0.5" stroke="#DEB887" stroke-opacity="0.1" stroke-width="2" />
        <text x="30" y="40" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="800" fill="#DEB887" letter-spacing="1">CURVA DE LUCROS</text>
        
        <!-- SVG Chart Path -->
        <path d="M 40 170 Q 100 160 140 120 T 240 130 T 360 60" fill="none" stroke="#98D8BA" stroke-width="5" stroke-linecap="round" />
        <!-- Shading under path -->
        <path d="M 40 170 Q 100 160 140 120 T 240 130 T 360 60 L 360 190 L 40 190 Z" fill="url(#chartFill)" fill-opacity="0.06" />
        
        <circle cx="360" cy="60" r="8" fill="#98D8BA" filter="url(#glow)" />
        <circle cx="360" cy="60" r="4" fill="#ffffff" />
      </g>
      
      <!-- Defs for chart fill -->
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#98D8BA" />
          <stop offset="100%" stop-color="#98D8BA" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
    `;
  } else {
    // default: type === 'replay'
    const pot = escapeXml((query.pot as string) || '0');
    const winnerText = escapeXml((query.winnerText as string) || 'MÃO FINALIZADA');
    const desc = escapeXml((query.desc as string) || 'DIVIDIDO');
    const boardStr = (query.board as string) || 'Qc,Qs,2c,6h,6s';
    const player1Str = (query.p1 as string) || 'Ad,As';
    const player2Str = (query.p2 as string) || 'Jd,Js';
    const p1Name = escapeXml((query.p1Name as string) || 'Jogador A');
    const p2Name = escapeXml((query.p2Name as string) || 'Jogador B');

    const boardCards = boardStr.split(',').map(parseCard);
    const p1Cards = player1Str.split(',').map(parseCard);
    const p2Cards = player2Str.split(',').map(parseCard);

    // SVG Rendering for Replay
    svgContent = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#022c22" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DEB887" />
          <stop offset="50%" stop-color="#f5d0a9" />
          <stop offset="100%" stop-color="#c59f6d" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.6" />
        </filter>
      </defs>

      <!-- Background Felt -->
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      
      <!-- Outer Frame -->
      <rect x="25" y="25" width="1150" height="580" rx="30" fill="none" stroke="url(#goldGrad)" stroke-width="6" />

      <!-- Top Header -->
      <g transform="translate(100, 80)">
        <text x="0" y="0" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="900" fill="#DEB887" letter-spacing="4">POKER HOLD'EM PREMIUM</text>
        <text x="0" y="45" font-family="Inter, system-ui, sans-serif" font-size="44" font-weight="900" fill="#98D8BA" letter-spacing="1">REPLAY DE JOGADA HISTÓRICA</text>
      </g>

      <!-- Pot Badge (Right aligned) -->
      <g transform="translate(850, 70)" filter="url(#shadow)">
        <rect width="250" height="70" rx="35" fill="#022c22" stroke="url(#goldGrad)" stroke-width="2" />
        <circle cx="40" cy="35" r="20" fill="#DEB887" />
        <circle cx="40" cy="35" r="14" fill="#022c22" stroke="#ffffff" stroke-width="1.5" />
        <text x="40" y="40" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="900" fill="#DEB887" text-anchor="middle">$</text>
        <text x="80" y="28" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="900" fill="#94a3b8" letter-spacing="1">POTE TOTAL</text>
        <text x="80" y="55" font-family="JetBrains Mono, monospace" font-size="28" font-weight="900" fill="#ffffff">$${pot}</text>
      </g>

      <!-- Community Cards Board (Felt oval style) -->
      <g transform="translate(100, 180)" filter="url(#shadow)">
        <!-- Table Felt center area -->
        <rect width="1000" height="170" rx="30" fill="#032f24" stroke="#DEB887" stroke-opacity="0.15" stroke-width="3" />
        <text x="40" y="40" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="800" fill="#DEB887" letter-spacing="2" fill-opacity="0.6">COMMUNITY CARDS (BOARD)</text>

        <!-- Cards Row -->
        <g transform="translate(40, 50)">
          ${boardCards.map((c, i) => `
            <g transform="translate(${i * 120}, 0)">
              <rect width="95" height="100" rx="10" fill="#ffffff" />
              <!-- Card Border -->
              <rect width="95" height="100" rx="10" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1" />
              <!-- Top Left Rank -->
              <text x="14" y="25" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="900" fill="${c.color}">${c.rank}</text>
              <!-- Center Suit -->
              <text x="47" y="68" font-family="Inter, system-ui, sans-serif" font-size="46" font-weight="900" fill="${c.color}" text-anchor="middle">${c.suitSymbol}</text>
            </g>
          `).join('')}
        </g>
      </g>

      <!-- Showdown Hands Section -->
      <g transform="translate(100, 390)">
        <!-- Player 1 Hand -->
        <g transform="translate(0, 0)">
          <rect width="470" height="120" rx="20" fill="#022c22" fill-opacity="0.6" stroke="#98D8BA" stroke-opacity="0.15" stroke-width="2" />
          <text x="30" y="40" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="800" fill="#98D8BA" letter-spacing="1">${p1Name}</text>
          
          <g transform="translate(250, 15)">
            ${p1Cards.map((c, i) => `
              <g transform="translate(${i * 85}, 0)">
                <rect width="70" height="90" rx="8" fill="#ffffff" />
                <text x="10" y="22" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="900" fill="${c.color}">${c.rank}</text>
                <text x="35" y="60" font-family="Inter, system-ui, sans-serif" font-size="36" font-weight="900" fill="${c.color}" text-anchor="middle">${c.suitSymbol}</text>
              </g>
            `).join('')}
          </g>
        </g>

        <!-- Player 2 Hand -->
        <g transform="translate(530, 0)">
          <rect width="470" height="120" rx="20" fill="#022c22" fill-opacity="0.6" stroke="#DEB887" stroke-opacity="0.15" stroke-width="2" />
          <text x="30" y="40" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="800" fill="#DEB887" letter-spacing="1">${p2Name}</text>
          
          <g transform="translate(250, 15)">
            ${p2Cards.map((c, i) => `
              <g transform="translate(${i * 85}, 0)">
                <rect width="70" height="90" rx="8" fill="#ffffff" />
                <text x="10" y="22" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="900" fill="${c.color}">${c.rank}</text>
                <text x="35" y="60" font-family="Inter, system-ui, sans-serif" font-size="36" font-weight="900" fill="${c.color}" text-anchor="middle">${c.suitSymbol}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <!-- Bottom Showdown Info Banner -->
      <g transform="translate(100, 530)">
        <rect width="1000" height="55" rx="15" fill="#022c22" stroke="url(#goldGrad)" stroke-width="1.5" />
        <circle cx="30" cy="27" r="7" fill="#98D8BA" />
        <text x="55" y="33" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="800" fill="#ffffff">
          ${winnerText} &nbsp;•&nbsp; <tspan fill="#98D8BA">${desc}</tspan>
        </text>
      </g>
    </svg>
    `;
  }

  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
  });
  res.end(svgContent.trim());
}
