import React, { useState } from 'react';
import OCRScanner from './components/OCRScanner';
import FuelForm from './components/FuelForm';

function App() {
  const [scannedKm, setScannedKm] = useState("");
  const [activeTab, setActiveTab] = useState("bbm");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20" data-theme="winter">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">SpidoNote</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-semibold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              System Online
            </div>
            <span className="badge badge-primary badge-outline font-bold px-3 py-2">v1.2.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-3">
              Vehicle Health <span className="text-primary italic">Sync</span>
            </h1>
            <p className="text-base text-slate-500 font-medium leading-relaxed">
              Automated OCR logs for fuel & maintenance maintenance.
            </p>
          </header>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="tabs tabs-boxed bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200">
              <button
                className={`tab tab-lg rounded-xl h-14 font-bold transition-all px-8 p-4 ${activeTab === 'bbm' ? 'tab-active bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                onClick={() => setActiveTab('bbm')}
              >
                <span className="p-4">⛽ Fuel Log</span>
              </button>
              <button
                className={`tab tab-lg rounded-xl h-14 font-bold transition-all px-8 p-4 ${activeTab === 'oli' ? 'tab-active bg-white text-secondary shadow-sm' : 'text-slate-500'}`}
                onClick={() => setActiveTab('oli')}
              >
                <span className="p-4">🛢️ Oil Log</span>
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <OCRScanner onScanComplete={setScannedKm} />
            <FuelForm scannedKm={scannedKm} activeType={activeTab} />
          </div>

          <footer className="mt-20 py-10 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 SpidoNote • Advanced Fleet Sync</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
