"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForensicDashboard() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, found: 0, exposure: 0, avg: 0 });
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();

  const openAuditorView = () => {
    if (anomalies.length === 0) return;
    
    localStorage.setItem('auditData', JSON.stringify({
      anomalies: anomalies,
      stats: stats
    }));
    
    // Smooth transition to auditor view in the same tab
    router.push('/auditor');
  };

  const exportToCSV = () => {
    if (anomalies.length === 0) return;
    const headers = ["Transaction_Signature", "Amount", "Risk_Score", "Artifact_Pattern"];
    const rows = anomalies.map(txn => [
      txn.id,
      txn.amount.replace('$', '').replace(',', ''),
      `${txn.score}%`,
      txn.artifact
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `areola_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const initiateSweep = async () => {
    setLoading(true);
    let endpoint = "http://localhost:8000/run_sweep";
    const formData = new FormData();
    if (uploadedFile) {
      endpoint = "http://localhost:8000/upload_sweep";
      formData.append("file", uploadedFile);
    }

    try {
      const response = await fetch(endpoint, {
        method: uploadedFile ? "POST" : "GET",
        body: uploadedFile ? formData : null,
      });
      const data = await response.json();
      setAnomalies(data.anomalies);
      setStats({ 
        total: data.totalScanned, 
        found: data.foundCount,
        exposure: data.totalExposure || 0,
        avg: data.avgExposure || 0
      });
      if (data.foundCount > 0) setIsSidebarOpen(true);
    } catch (error) {
      console.error("Audit Failed", error);
    } finally {
      setLoading(false);
    }
  };
// Add this block to keep your data alive when returning from the Command Center
useEffect(() => {
  const savedData = localStorage.getItem('auditData');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    setAnomalies(parsed.anomalies);
    setStats(parsed.stats);
    // This ensures the "Anomaly" verdict stays visible
    if (parsed.anomalies.length > 0) {
      setIsSidebarOpen(false); // Keep it closed but data is there
    }
  }
}, []);
  return (
    /* UPDATED: Added entry animations to match the Auditor page */
    <div className="relative min-h-screen overflow-x-hidden p-12 bg-[#fbfbfb] animate-in fade-in slide-in-from-top-4 duration-1000">
      
      {/* SIDEBAR OVERLAY */}
      <div 
        className={`fixed top-0 right-0 h-full w-[450px] bg-white/90 backdrop-blur-2xl border-l border-black/5 z-50 transform transition-transform duration-500 ease-in-out shadow-[-20px_0_50px_rgba(0,0,0,0.05)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-[-40px] top-1/2 -translate-y-1/2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] py-8 px-2 rounded-l-2xl vertical-text hover:bg-[#222] transition-all shadow-xl"
          style={{ writingMode: 'vertical-rl' }}
        >
          {isSidebarOpen ? "CLOSE PANEL" : "OPEN AUDIT PANEL"}
          {stats.found > 0 && !isSidebarOpen && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        <div className="p-12 h-full flex flex-col">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Preview</p>
              <h3 className="text-3xl font-bold tracking-tighter">Raw Audit</h3>
            </div>
            <button 
              onClick={exportToCSV}
              className="text-[10px] font-bold underline opacity-40 hover:opacity-100 transition-opacity"
            >
              Export .CSV
            </button>
          </div>

          <button 
            onClick={openAuditorView}
            className="w-full mb-8 py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg group"
          >
            Comprehensive Page <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">-</span>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
            {anomalies.map((txn) => (
              <div key={txn.id} className="py-4 border-b border-black/5 group hover:bg-black/[0.02] transition-colors px-2 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-mono opacity-40">{txn.id}</span>
                  <span className={`text-[10px] font-bold ${txn.score > 80 ? 'text-red-600' : 'text-orange-500'}`}>{txn.score}% Match</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold tracking-tight">{txn.amount}</span>
                  <span className="text-[10px] opacity-40 uppercase font-mono">Artf: {txn.artifact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className={`transition-all duration-700 ${isSidebarOpen ? 'pr-[400px] opacity-30 scale-[0.98] pointer-events-none' : ''}`}>
        <section className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-medium tracking-tighter mb-3 text-[#111111]">
              AREOLA<span className="opacity-20">.</span>
            </h1>
            <p className="text-[#666666] font-medium tracking-tight italic">
              {loading ? "ripping through artifacts..." : "fraud?, on my watch?, who decided that?."}
            </p>
          </div>
          
          <div onClick={() => fileInputRef.current?.click()} className="glass-card px-8 py-4 cursor-pointer flex items-center gap-4 border-2 border-dashed border-black/5 hover:bg-black group transition-all">
            <span className="text-xl">{fileName ? "📄" : "📁"}</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">{fileName || "Import Data"}</p>
            <input type="file" ref={fileInputRef} onChange={(e) => {
               const file = e.target.files?.[0];
               if(file) { setFileName(file.name); setUploadedFile(file); }
            }} className="hidden" />
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 glass-card p-12 h-[500px] flex flex-col justify-center items-center relative overflow-hidden">
             {loading ? (
               <div className="text-center animate-pulse">
                 <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4">Scan in Progress</p>
                 <div className="w-64 h-1 bg-black/5 rounded-full overflow-hidden">
                   <div className="h-full bg-black w-1/2" />
                 </div>
               </div>
             ) : (
               <>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-20 mb-4">Ready for Sweep</p>
                <button 
                  onClick={initiateSweep}
                  className="text-6xl font-bold tracking-tighter hover:scale-105 transition-transform"
                >
                  {stats.found > 0 ? "RE-AUDIT" : "AUDIT"}
                </button>
               </>
             )}
          </div>

          <div className="col-span-12 md:col-span-4 glass-card p-8 border-l-4 border-l-black flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-8">Financial Exposure</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Total At Risk</p>
              <h2 className="text-5xl font-bold tracking-tighter mb-8">
                ${stats.exposure.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </h2>
              <div className="pt-8 border-t border-black/5 flex justify-between">
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Avg Theft</p>
                   <p className="text-xl font-bold tracking-tighter">${stats.avg.toFixed(2)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Verdict</p>
                   <p className={`text-xl font-bold tracking-tighter uppercase ${stats.found > 0 ? 'text-red-600' : ''}`}>
                     {stats.found > 0 ? "Anomaly" : "Secure"}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}