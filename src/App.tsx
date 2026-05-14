import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, query, setDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { Route, UserProfile, TransportNotification } from './types/transport';
import { cn } from './lib/utils';
import GlobeView from './components/GlobeView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Notifications from './components/Notifications';
import { Search, Loader2, Sparkles, X } from 'lucide-react';
import { generateRouteSuggestions } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';

import ShipDetail from './components/ShipDetail';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'globe' | 'dashboard'>('globe');
  const [selectedShip, setSelectedShip] = useState<Route | null>(null);
  const [notifications, setNotifications] = useState<TransportNotification[]>([]);

  // Notifications Sync
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as TransportNotification))
        .filter(n => n.userId === user.uid);
      setNotifications(docs);
    });
    return unsub;
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'notifications');
    }
  };

  const clearNotifications = async () => {
    // Basic bulk mock delete or update
    for (const n of notifications) {
      await updateDoc(doc(db, 'notifications', n.id), { isRead: true });
    }
  };

  // Auth & Profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const pRef = doc(db, 'users', u.uid);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          setProfile(pSnap.data() as UserProfile);
        } else {
          const newProfile = { uid: u.uid, email: u.email || 'anon@nexus.io', favorites: [] };
          await setDoc(pRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  // Sync Routes from Firestore
  useEffect(() => {
    const q = query(collection(db, 'routes'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Route));
      setRoutes(docs);
    });
    return unsub;
  }, []);

  // Simulation Engine (Local progress update for smooth rendering)
  useEffect(() => {
    const interval = setInterval(() => {
      setRoutes(prev => prev.map(r => {
        if (r.status !== 'active') return r;
        let newProgress = r.progress + (r.speed || 0.001);
        if (newProgress > 1) {
          // Restart or stop
          newProgress = 0;
          // In a real app we'd trigger an arrival notification here
        }
        return { ...r, progress: newProgress };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const suggestions = await generateRouteSuggestions(searchQuery);
    
    // Create new routes in Firestore
    for (const s of suggestions) {
      const id = `${s.type}-${Math.random().toString(36).substr(2, 6)}`;
      const newRoute: Route = {
        id,
        ...s,
        status: 'active',
        progress: 0,
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      };
      
      try {
        await setDoc(doc(db, 'routes', id), newRoute);
        
        // Create departure notification
        if (user) {
          const notifId = `notif-${Math.random().toString(36).substr(2, 6)}`;
          await setDoc(doc(db, 'notifications', notifId), {
            id: notifId,
            userId: user.uid,
            message: `Nuova rotta ${s.type.toUpperCase()} inizializzata: ${s.fromName} → ${s.toName}`,
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'departure'
          });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'routes');
      }
    }
    
    setIsSearching(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setViewMode('globe');
  };

  const toggleFavorite = async (routeId: string) => {
    if (!user) return;
    const isFav = profile?.favorites.includes(routeId);
    const pRef = doc(db, 'users', user.uid);
    
    try {
      if (isFav) {
        await updateDoc(pRef, { favorites: arrayRemove(routeId) });
        setProfile(prev => prev ? { ...prev, favorites: prev.favorites.filter(id => id !== routeId) } : null);
      } else {
        await updateDoc(pRef, { favorites: arrayUnion(routeId) });
        setProfile(prev => prev ? { ...prev, favorites: [...prev.favorites, routeId] } : null);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-bg text-ink selection:bg-accent selection:text-bg font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => {
          setActiveTab(t);
          setViewMode(t === 'dashboard' ? 'dashboard' : 'globe');
        }} 
        onSearchClick={() => setIsSearchOpen(true)}
        user={user}
      />

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* Immersive Header */}
        <header className="h-16 border-b border-accent/10 bg-bg-dark flex items-center px-6 justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">Nexus<span className="text-accent">Global</span></h2>
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <span className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">{activeTab} Interface</span>
          </div>
          
          <div className="flex gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-accent/70 font-bold">Vector Traffic</span>
              <span className="text-xs font-mono text-cyan-200">{routes.filter(r => r.type === 'plane').length} Active</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-amber-500/70 font-bold">Maritime</span>
              <span className="text-xs font-mono text-amber-200">{routes.filter(r => r.type === 'ship').length} Vessels</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-emerald-500/70 font-bold">Rail Systems</span>
              <span className="text-xs font-mono text-emerald-200">{routes.filter(r => r.type === 'train').length} Nodes</span>
            </div>
          </div>

          <div className="flex gap-2 ml-8 bg-black/40 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setViewMode('globe')}
              className={cn("px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all tracking-widest", viewMode === 'globe' ? "bg-accent text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "opacity-40 hover:opacity-100")}
            >
              Globe
            </button>
            <button 
              onClick={() => setViewMode('dashboard')}
              className={cn("px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all tracking-widest", viewMode === 'dashboard' ? "bg-accent text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "opacity-40 hover:opacity-100")}
            >
              Data
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#0a0f1d_0%,_#02040a_100%)]">
          {/* HUD Elements */}
          {viewMode === 'globe' && (
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
              <div className="hud-bg px-3 py-1.5 rounded-md">
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-mono">LAT: 34.0522° N</span>
              </div>
              <div className="hud-bg px-3 py-1.5 rounded-md">
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-mono">LON: 118.2437° W</span>
              </div>
            </div>
          )}

          {viewMode === 'globe' ? (
            <>
              <GlobeView routes={routes} onRouteClick={(r) => {
                if (r.type === 'ship') setSelectedShip(r);
                setViewMode('globe'); 
              }} />
              {routes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-[2rem] text-center max-w-lg pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.1)] border-accent/20"
                  >
                    <Sparkles className="mx-auto text-accent mb-6 animate-pulse" size={48} />
                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-white uppercase italic">Nexus<span className="text-accent">Global</span></h1>
                    <p className="opacity-60 leading-relaxed mb-8 text-sm">Nessun vettore attivo nel sistema. Inizializza il Core AI per generare rotte globali in tempo reale.</p>
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className="px-8 py-4 bg-accent text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                      Initialize System
                    </button>
                  </motion.div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full">
              {activeTab === 'dashboard' ? (
                <Dashboard 
                  routes={routes} 
                  favorites={profile?.favorites || []} 
                  toggleFavorite={toggleFavorite}
                  onViewRoute={(r) => {
                    if (r.type === 'ship') setSelectedShip(r);
                    setViewMode('globe');
                  }}
                />
              ) : activeTab === 'notifications' ? (
                <Notifications 
                  notifications={notifications} 
                  onMarkAsRead={markAsRead} 
                  onClearAll={clearNotifications}
                />
              ) : activeTab === 'favorites' ? (
                <Dashboard 
                  routes={routes.filter(r => profile?.favorites.includes(r.id))} 
                  favorites={profile?.favorites || []} 
                  toggleFavorite={toggleFavorite}
                  onViewRoute={(r) => {
                    if (r.type === 'ship') setSelectedShip(r);
                    setViewMode('globe');
                  }}
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Info Bar */}
        <footer className="h-8 bg-cyan-950/30 px-6 flex items-center justify-between text-[10px] text-cyan-200/60 shrink-0 border-t border-accent/10">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> SYSTEM STATUS: ONLINE</span>
            <div className="w-[1px] h-3 bg-white/5" />
            <span>DATA REFRESH: <span className="font-mono">REAL-TIME</span></span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="opacity-60 italic tracking-widest uppercase">© NEXUS GLOBAL LOGISTICS</span>
            <div className="w-[1px] h-3 bg-white/5" />
            <span className="font-mono opacity-40">v4.8.5-STABLE</span>
          </div>
        </footer>

        {/* Overlays */}
        <AnimatePresence>
          {selectedShip && (
            <ShipDetail ship={selectedShip} onClose={() => setSelectedShip(null)} />
          )}
        </AnimatePresence>

        {/* AI Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-bg/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass w-full max-w-2xl p-8 rounded-3xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setIsSearchOpen(false)} className="opacity-50 hover:opacity-100">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent/20 rounded-lg text-accent">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Ricerca Rotte AI</h3>
                    <p className="opacity-50 text-sm">Descrivi i percorsi che vuoi simulare o cerca dati reali.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="es. Navi container da Shanghai a Rotterdam o Voli New York..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent/50 transition-all font-medium"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  
                  <button 
                    disabled={isSearching || !searchQuery.trim()}
                    onClick={handleSearch}
                    className="w-full py-4 bg-accent text-bg rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                  >
                    {isSearching ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    {isSearching ? "Analisi dati in corso..." : "Genera Simulazione"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
