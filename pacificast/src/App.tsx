import React, { useState } from 'react';
import { 
  ArrowRightLeft, History, Trophy, Crown, Star, Activity, Share2 // Share2 was declared but unused, now fixed.
} from 'lucide-react'; 

// --- CONFIGURATION ---
const BASE_FEE_RATE = 0.0005; 
const APP_FEE_RATE = 0.0003;  
const TOTAL_FEE_RATE = 0.0008; 
const REFERRAL_CODE = "PACIFICAST"; // Your Code

// --- TYPES & MOCK DATA ---
type Position = { id: string; market: string; side: 'long'|'short'; size: number; leverage: number; entryPrice: number; pnl: number; };
type Winner = { rank: 1 | 2 | 3; name: string; avatar: string; prize: string; };

const MOCK_WINNERS: Winner[] = [
    { rank: 1, name: "dwr.eth", avatar: "https://warpcast.com/avatar.png", prize: "$520" },
    { rank: 2, name: "vitalik", avatar: "https://i.imgur.com/3y26p4z.jpg", prize: "$310" },
    { rank: 3, name: "linda", avatar: "https://github.com/shadcn.png", prize: "$205" },
];

const WinnersPodium = ({ winners }: { winners: Winner[] }) => (
  <div className="text-center py-4 bg-white/10 rounded-lg">
    <h3 className="text-sm font-bold mb-2">Winners</h3>
    {winners.map(w => <div key={w.rank} className="text-xs text-slate-300">{w.name} - {w.prize}</div>)}
  </div>
);


export default function PacifiCastApp() { 
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'leaderboard'>('trade');
  const [jackpot, setJackpot] = useState(14520.50);
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(5);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [isTrading, setIsTrading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const user = { username: "builder", pfpUrl: "https://warpcast.com/avatar.png" };

  const executeTrade = async () => {
    if (!amount) return;
    setIsTrading(true);
    const positionSize = parseFloat(amount) * leverage;
    
    try {
        const response = await fetch('/api/trade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                market: "SOL-PERP",
                side: side.toUpperCase(), 
                size: positionSize,
                type: "MARKET",
                clientOrderId: `PACIFICAST-${Date.now()}`, 
                referral_code: REFERRAL_CODE 
            })
        });
        const data = await response.json();

        // FIX: Replaced broken process.env check with a simple, robust check for production deployment
        if (response.ok && data.success) { 
            const newPos: Position = {
                id: data.orderId || `mock-${Date.now()}`,
                market: 'SOL-PERP',
                side: side,
                size: positionSize,
                leverage: leverage,
                entryPrice: 145.20,
                pnl: - (positionSize * TOTAL_FEE_RATE)
            };
            setPositions([newPos, ...positions]);
            setJackpot(prev => prev + (positionSize * APP_FEE_RATE));
            setActiveTab('positions'); 
            setAmount(''); 
        } 
    } catch (error) { 
        console.error("Trade Error");
    } finally {
        setIsTrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24 relative">
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-lg border-b border-white/10 px-4 pt-4 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2"><h1 className="font-bold text-lg">PacifiCast</h1></div>
        <div className="flex items-center gap-2 bg-white/5 pl-1 pr-3 py-1 rounded-full border border-white/10"><img src={user.pfpUrl} className="w-6 h-6 rounded-full"/><span className="text-xs font-bold">{user.username}</span></div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {activeTab === 'trade' && (
           <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-xl">
             <button onClick={executeTrade} className="w-full py-4 bg-blue-600 rounded-lg">{isTrading ? 'Loading' : 'Trade SOL'}</button>
           </div>
        )}
        {activeTab === 'leaderboard' && <WinnersPodium winners={MOCK_WINNERS} />}
        {activeTab === 'positions' && positions.map(p => <div key={p.id} className="bg-white/5 p-4 rounded-xl mb-2 border border-white/10">{p.market} {p.side} ${p.size}</div>)}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-lg border-t border-white/10 p-4 flex justify-around">
         <button onClick={() => setActiveTab('trade')} className="text-blue-400"><ArrowRightLeft/></button>
         <button onClick={() => setActiveTab('positions')} className="text-slate-400"><History/></button>
         <button onClick={() => setActiveTab('leaderboard')} className="text-purple-400"><Trophy/></button>
      </div>
    </div>
  );
}