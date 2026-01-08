"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditorPage() {
  const [auditData, setAuditData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExiting, setIsExiting] = useState(false); // Controls the exit transition
  const router = useRouter();

  useEffect(() => {
    const savedData = localStorage.getItem('auditData');
    if (savedData) {
      setAuditData(JSON.parse(savedData));
    }
  }, []);

  // Smooth return sequence
  const handleReturnHome = () => {
    setIsExiting(true); // Start fade-out
    setTimeout(() => {
      router.push('/'); // Navigate after animation begins
    }, 300); // 300ms matches the transition duration
  };

  if (!auditData) return (
    <div className="h-screen flex items-center justify-center font-mono opacity-20 uppercase tracking-[0.5em]">
      Waiting for Audit Stream...
    </div>
  );

  const filteredAnomalies = auditData.anomalies.filter((txn: any) => 
    txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.artifact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative min-h-screen bg-[#fbfbfb] overflow-x-hidden transition-all duration-500 ease-in-out ${
      isExiting ? "opacity-0 scale-95 blur-sm" : "opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-1000"
    }`}>
      
      {/* HOME LAUNCHPAD (Left Side) */}
      <button 
        onClick={handleReturnHome}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] py-8 px-2 rounded-r-2xl vertical-text hover:bg-zinc-800 transition-all shadow-xl z-50 group"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className="group-hover:-translate-y-2 transition-transform">← RETURN HOME</span>
      </button>

      {/* MAIN AUDIT INTERFACE */}
      <div className="p-20 max-w-400 mx-auto">
        <header className="flex justify-between items-center mb-20 border-b border-black/5 pb-12">
          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] mb-2"></p>
            <h1 className="text-5xl font-bold tracking-tighter uppercase">Comprehensive Page</h1>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1">Exposure at Risk</p>
             <p className="text-5xl font-bold text-red-600 tracking-tighter">
               ${auditData.stats.exposure.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </p>
          </div>
        </header>

        {/* SEARCH & TOOLBAR */}
        <div className="flex gap-4 mb-8">
           <input 
             type="text" 
             placeholder="Filter by Signature, Amount, or Artifact..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="flex-1 bg-white border border-black/5 rounded-2xl px-8 py-6 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all shadow-sm font-medium"
           />
           <div className="bg-white border border-black/5 rounded-2xl px-8 py-4 flex items-center gap-8 shadow-sm">
              <div className="text-center">
                <p className="text-[10px] opacity-30 font-bold uppercase tracking-tighter">Total Scanned</p>
                <p className="font-bold font-mono">{auditData.stats.total}</p>
              </div>
              <div className="text-center border-l border-black/5 pl-8">
                <p className="text-[10px] opacity-30 font-bold uppercase tracking-tighter">Flagged</p>
                <p className="font-bold font-mono text-red-600">{auditData.anomalies.length}</p>
              </div>
           </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                <th className="p-8">Transaction Signature</th>
                <th className="p-8">Amount</th>
                <th className="p-8">Risk Confidence</th>
                <th className="p-8">Artifact Pattern</th>
                <th className="p-8 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredAnomalies.length > 0 ? (
                filteredAnomalies.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-black/1 transition-colors group">
                    <td className="p-8 font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{txn.id}</td>
                    <td className="p-8 text-sm font-bold tracking-tight">{txn.amount}</td>
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full transition-all duration-1000 ${txn.score > 80 ? 'bg-red-500' : 'bg-orange-400'}`} 
                            style={{ width: `${txn.score}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold font-mono">{txn.score}%</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="text-[10px] font-mono bg-black/5 px-3 py-1 rounded-full uppercase opacity-60">
                        {txn.artifact}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <select className="text-[10px] font-bold uppercase tracking-widest bg-transparent border border-black/10 rounded px-3 py-2 outline-none cursor-pointer hover:border-black transition-colors">
                        <option>UNREVIEWED</option>
                        <option className="text-emerald-600">VERIFIED</option>
                        <option className="text-red-600">FRAUD CONFIRMED</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center opacity-20 font-bold uppercase tracking-widest text-sm">
                    No records match your filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}