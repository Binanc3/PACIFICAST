import React, { useState } from 'react';
import { 
  ArrowRightLeft, History, Share2, Activity, 
  Trophy, Crown, Star 
} from 'lucide-react';

// --- CONFIGURATION ---
const BASE_FEE_RATE = 0.0005; // 0.05% (Pacifica Protocol Fee)
const APP_FEE_RATE = 0.0003;  // 0.03% (Your Treasury Fee - The Jackpot)
const TOTAL_FEE_RATE = BASE_FEE_RATE + APP_FEE_RATE; // 0.08% Total

// !!! IMPORTANT: REPLACE "PACIFICAST" WITH YOUR REFERRAL CODE FROM THE LINK !!!
const REFERRAL_CODE = "PACIFICAST"; 

// --- TYPES & MOCK DATA ---
type Position = { id: string; market: string; side: 'long'|'short'; size: number; leverage: number; entryPrice: number; pnl: number; };
type Winner = { rank: 1 | 2 | 3; name: string; avatar: string; prize: string; };

const MOCK_WINNERS: Winner[] = [
    { rank: 1, name: "dwr.eth", avatar: "https://warpcast.com/avatar.png", prize: "$520" },
    { rank: 2, name: "vitalik", avatar: "https://i.imgur.com/3y26p4z.jpg", prize: "$310" },
    { rank: 3, name: "linda", avatar: "https://github.com/shadcn.png", prize: "$205" },
];

// --- SUB-COMPONENT: WINNERS PODIUM ---
const WinnersPodium = ({ winners }: { winners: Winner[] }) => (
  <div className="mb-8">
    <div className="text-center mb-4">
      <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center justify-center gap-2">
         <Star size={12} className="text-yellow-500 fill-yellow-500" />
         Last Week's Champions
         <Star size={12} className="text-yellow-500 fill-yellow-500" />
      </h3>
    </div>
    <div className="flex justify-center items-end gap-2 sm:gap-4">
      {/* 2nd Place */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
           <img src={winners[1].avatar} className="w-10 h-10 rounded-full border-2 border-slate-300 shadow-md" alt={winners[1].name} />
           <div className="absolute -bottom-2 -right-1 bg-slate-300 text-slate-800 text-[10px] font-bold px-1.5 rounded-full border border-white">#2</div>
        </div>
        <div className="bg-white/5 w-16 h-20 rounded-t-lg flex flex-col justify-end items-center pb-2 shadow-inner border border-white/5 backdrop-blur-sm">
           <span className="font-bold text-xs truncate max-w-[60px] text-white">{winners[1].name}</span>
           <span className="text-[10px] text-slate-400 font-mono">{winners[1].prize}</span>
        </div>
      </div>
      {/* 1st Place */}
      <div className="flex flex-col items-center z-10">
         <div className="relative mb-2">
           <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-sm animate-bounce" size={20} />
           <img src={winners[0].avatar} className="w-14 h-14 rounded-full border-2 border-yellow-400 shadow-lg ring-2 ring-yellow-400/30" alt={winners[0].name} />
           <div className="absolute -bottom-2 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 rounded-full border border-white">#1</div>
        </div>
        <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 w-20 h-28 rounded-t-lg flex flex-col justify-end items-center pb-3 shadow-lg border border-yellow-200">
           <span className="font-bold text-sm text-yellow-900 truncate max-w-[70px]">{winners[0].name}</span>
           <span className="text-[10px] text-yellow-800 font-bold font-mono bg-yellow-400/50 px-1 rounded">{winners[0].prize}</span>
        </div>
      </div>
      {/* 3rd Place */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
           <img src={winners[2].avatar} className="w-10 h-10 rounded-full border-2 border-orange-300 shadow-md" alt={winners[2].name} />
           <div className="absolute -bottom-2 -right-1 bg-orange-300 text-orange-900 text-[10px] font-bold px-1.5 rounded-full border border-white">#3</div>
        </div>
        <div className="bg-white/5 w-16 h-16 rounded-t-lg flex flex-col justify-end items-center pb-2 shadow-inner border border-white/5 backdrop-blur-sm">
           <span className="font-bold text-xs truncate max-w-[60px] text-white">{winners[2].name}</span>
           <span className="text-[10px] text-slate-400 font-mono">{winners[2].prize}</span>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function PacifiCastApp() { 
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'leaderboard'>('trade');
  const [jackpot, setJackpot] = useState(14520.50);
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(5);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [isTrading, setIsTrading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  
  // Mock User Identity
  const user = { username: "your_user", pfpUrl: "https://warpcast.com/avatar.png" };

  const getPayout = (rank: number) => {
    const pot = jackpot * 0.5;
    if (rank === 1) return pot * 0.50;
    if (rank === 2) return pot * 0.30;
    if (rank === 3) return pot * 0.20;
    return 0;
  };

  const executeTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
        alert("Please enter a valid trade amount.");
        return;
    }
    setIsTrading(true);

    const collateral = parseFloat(amount);
    const positionSize = collateral * leverage;
    
    // Create the Order Payload
    const orderPayload = {
        market: "SOL-PERP",
        side: side.toUpperCase(), 
        size: positionSize,
        type: "MARKET",
        clientOrderId: `PACIFICAST-${Date.now()}`, 
        referral_code: REFERRAL_CODE 
    };

    try {
        // CALL THE SECURE BACKEND PROXY
        const response = await fetch('/api/trade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        // Check for success (either real API success OR mock success for UI demo)
        const isSuccess = response.ok && data.success || (process.env.NODE_ENV !== 'production' && !data.error); 

        if (isSuccess) { 
            const newPos: Position = {
                id: data.orderId || `mock-${Date.now()}`,
                market: 'SOL-PERP',
                side: side,
                size: positionSize,
                leverage: leverage,
                entryPrice: data.avgFillPrice || 145.20,
                pnl: - (positionSize * TOTAL_FEE_RATE)
            };
            setPositions([newPos, ...positions]);
            setJackpot(prev => prev + (positionSize * APP_FEE_RATE));
            setActiveTab('positions'); 
            setAmount(''); 
        } else {
            throw new Error(data.message || data.details || "API call failed.");
        }
        
    } catch (error: any) { 
        console.error("Trade Failed:", error);
        alert(`Trade Failed: ${error.message}. Check Vercel logs.`);
    } finally {
        setIsTrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24 relative overflow-hidden">
      
      {/* HEADER: Glassy Nav Bar */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-lg border-b border-white/10 px-4 pt-4 pb-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          {/* Ensure icon.png is in your public folder */}
          <img src="/icon.png" alt="PacifiCast Logo" className="w-8 h-8 rounded-full shadow-md" />
          <h1 className="font-bold text-lg tracking-tight">PacifiCast</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/5 pl-1 pr-3 py-1 rounded-full border border-white/10 backdrop-blur-sm shadow-inner">
             <img src={user.pfpUrl} className="w-6 h-6 rounded-full" alt={user.username} />
             <span className="text-xs font-bold text-slate-200">{user.username}</span>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        
        {/* TRADE TAB (Glassy) */}
        {activeTab === 'trade' && (
           <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-xl shadow-lg">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-2 text-2xl font-black text-white">SOL-PERP</div>
                    <div className="text-xl font-bold font-mono text-green-400">$145.20</div>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                        <button onClick={() => setSide('long')} className={`py-3 rounded-lg font-bold text-sm transition-all ${side === 'long' ? 'bg-green-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/10'}`}>Long</button>
                        <button onClick={() => setSide('short')} className={`py-3 rounded-lg font-bold text-sm transition-all ${side === 'short' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/10'}`}>Short</button>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-xl flex items-center gap-2 border border-white/10 backdrop-blur-sm shadow-inner">
                        <span className="text-2xl font-bold text-slate-400">$</span>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-3xl font-bold w-full outline-none text-white placeholder-slate-500" min="0" step="0.01"/>
                    </div>
                    
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm shadow-inner">
                        <div className="flex justify-between mb-4">
                            <span className="text-sm font-medium text-slate-300">Leverage</span>
                            <span className="text-lg font-black text-blue-400">{leverage}x</span>
                        </div>
                        <input type="range" min="1" max="50" step="1" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-runnable-track]:bg-blue-500/30" />
                     </div>

                    <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center text-xs border border-white/10 backdrop-blur-sm shadow-inner">
                        <div>
                            <span className="text-slate-400 block">Total Fees (0.08%)</span>
                            <span className="font-mono font-bold text-white">${amount ? (parseFloat(amount) * leverage * TOTAL_FEE_RATE).toFixed(4) : '0.0000'}</span>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] text-slate-400">0.05% Protocol</div>
                           <div className="text-[10px] text-yellow-400 font-bold">0.03% Jackpot Fuel ⛽️</div>
                        </div>
                    </div>

                    <button onClick={executeTrade} disabled={!amount || parseFloat(amount) <= 0 || isTrading} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all duration-200 ${isTrading ? 'bg-slate-700 cursor-not-allowed' : (side === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}`}>
                        {isTrading ? <Activity className="animate-spin inline mr-2" /> : 'Confirm Trade'}
                    </button>
                </div>
             </div>
           </div>
        )}

        {/* LEADERBOARD TAB (Glassy) */}
        {activeTab === 'leaderboard' && (
           <div className="animate-in slide-in-from-right-8 duration-300">
               <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden text-center mb-8 border border-white/10 backdrop-blur-xl">
                   <div className="relative z-10">
                      <div className="flex justify-center items-center gap-2 mb-2">
                        <Crown size={20} className="text-yellow-300" />
                        <span className="font-bold text-indigo-100 uppercase tracking-widest text-xs">Weekly Jackpot</span>
                      </div>
                      <h2 className="text-4xl font-black mb-2">${jackpot.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                      <p className="text-xs opacity-80">Accumulating from 0.03% of every trade</p>
                   </div>
               </div>
               <WinnersPodium winners={MOCK_WINNERS} />
               <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider pl-1 mb-3">Live Standings</h3>
               <div className="space-y-3 pb-8">
                   {[
                      {name: '/degen', points: '1.5M', rank: 1, avatar: 'https://github.com/shadcn.png', pnl: 500},
                      {name: '/base', points: '1.2M', rank: 2, avatar: 'https://github.com/vercel.png', pnl: 300},
                      {name: 'pacifica_chad', points: '900K', rank: 3, avatar: 'https://github.com/shadcn.png', pnl: 200},
                      {name: 'anon_trader', points: '750K', rank: 4, avatar: 'https://i.imgur.com/3y26p4z.jpg', pnl: 100},
                      {name: 'crypto_guru', points: '600K', rank: 5, avatar: 'https://warpcast.com/avatar.png', pnl: 50},
                   ].map((s) => (
                       <div key={s.rank} className={`flex items-center p-3 sm:p-4 rounded-xl border ${s.rank <= 3 ? 'bg-white/10 border-yellow-500/30 ring-1 ring-yellow-500/20' : 'bg-white/5 border-white/5'} backdrop-blur-sm shadow-inner`}>
                               <div className={`w-8 font-black italic ${s.rank <= 3 ? 'text-yellow-400 text-lg' : 'text-slate-400'}`}>#{s.rank}</div>
                               <img src={s.avatar} className="w-8 h-8 rounded-full mr-3" alt={s.name} />
                               <div className="flex-1"><h4 className="font-bold text-white text-sm">{s.name}</h4><p className="text-xs text-slate-400">{s.points} PTS</p></div>
                               <div className="text-right"><div className="text-[10px] text-green-400 font-bold uppercase">Est. Win</div><div className="font-mono font-bold text-white text-sm">${getPayout(s.rank).toLocaleString(undefined, {maximumFractionDigits: 0})}</div></div>
                           </div>
                       ))}
                   </div>
               </div>
            )}
            
            {/* POSITIONS TAB (Glassy) */}
            {activeTab === 'positions' && (
                 <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-xl shadow-lg">
                        <h3 className="font-bold text-lg mb-4 text-white">Your Open Positions</h3>
                        {positions.length === 0 ? (
                            <p className="text-slate-400 text-sm">No open positions. Place a trade!</p>
                        ) : (
                            <div className="space-y-3">
                                {positions.map(pos => (
                                    <div key={pos.id} className="bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm shadow-inner flex justify-between items-center">
                                        <div><div className="font-bold text-sm text-white">{pos.market} ({pos.side.toUpperCase()})</div><div className="text-xs text-slate-400">Size: ${pos.size.toFixed(2)} @ {pos.leverage}x</div></div>
                                        <div className={`font-bold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>P&L: {pos.pnl.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-lg border-t border-white/10 px-6 py-4 pb-8 flex justify-between z-40 shadow-2xl">
             <button onClick={() => setActiveTab('trade')} className={`flex flex-col items-center gap-1 ${activeTab === 'trade' ? 'text-blue-400' : 'text-slate-400'}`}><ArrowRightLeft size={24} /><span className="text-[10px] font-bold">Trade</span></button>
             <button onClick={() => setActiveTab('positions')} className={`flex flex-col items-center gap-1 ${activeTab === 'positions' ? 'text-blue-400' : 'text-slate-400'}`}><History size={24} /><span className="text-[10px] font-bold">Positions</span></button>
             <button onClick={() => setActiveTab('leaderboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'leaderboard' ? 'text-purple-400' : 'text-slate-400'}`}><Trophy size={24} /><span className="text-[10px] font-bold">Jackpot</span></button>
          </div>
        </div>
      );
    }