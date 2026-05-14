import React from 'react';
import { Plane, Train, Ship, LayoutDashboard, Heart, Bell, Plus, Search, LogIn, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchClick: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSearchClick, user }) => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Live Overview' },
    { id: 'favorites', icon: Heart, label: 'Saved Routes' },
    { id: 'notifications', icon: Bell, label: 'Alerts' },
  ];

  return (
    <div className="w-16 md:w-64 h-full bg-bg-dark border-r border-accent/10 flex flex-col items-center md:items-stretch z-40 shadow-2xl relative">
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      
      <div className="flex items-center gap-3 h-16 px-6 technical-border">
        <div className="w-8 h-8 bg-accent rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center shrink-0">
          <Plane className="text-white w-5 h-5" />
        </div>
        <h1 className="font-bold text-xl hidden md:block tracking-tighter text-white italic uppercase">NEXUS<span className="text-accent-bright">GLOBAL</span></h1>
      </div>

      <nav className="flex-1 space-y-6 pt-6 px-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 hidden md:block">Navigation</p>
          <div className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-md transition-all group",
                  activeTab === item.id 
                    ? "bg-accent/10 text-cyan-100 border-l-2 border-accent" 
                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(activeTab === item.id ? "text-accent" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="hidden md:block text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Hot Sectors</p>
          <div className="space-y-3 px-1">
            <div className="bg-bg-card border border-accent/10 p-3 rounded-lg group hover:border-accent/30 transition-all cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-accent">ATL-07</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold">Stable</span>
              </div>
              <div className="text-[10px] text-white/80 flex justify-between items-center gap-2">
                 <span>NYC</span>
                 <div className="flex-1 h-[1px] bg-white/10 relative">
                   <div className="absolute inset-0 bg-accent w-1/2" />
                 </div>
                 <span>LON</span>
              </div>
            </div>
            
            <div className="bg-bg-card border border-accent/10 p-3 rounded-lg group hover:border-accent/30 transition-all cursor-pointer opacity-60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-amber-500">PAC-NW</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">Congested</span>
              </div>
              <div className="text-[10px] text-white/80 flex justify-between items-center gap-2">
                 <span>TKO</span>
                 <div className="flex-1 h-[1px] bg-white/10" />
                 <span>LAX</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-accent/10 bg-black/20 space-y-3">
        {user ? (
          <div className="flex items-center gap-3 p-2 h-12">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 overflow-hidden">
              {user.photoURL ? <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" /> : <UserIcon size={16} />}
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-[10px] font-bold text-white truncate">{user.displayName || 'Operatore'}</p>
              <button onClick={() => signOut(auth)} className="text-[9px] text-accent hover:underline uppercase tracking-widest">Logout</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 glass text-white rounded-lg font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
          >
            <LogIn size={18} />
            <span className="hidden md:block text-[10px]">Staff Login</span>
          </button>
        )}

        <button 
          onClick={onSearchClick}
          className="w-full flex items-center justify-center md:justify-start gap-3 p-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <Search size={18} />
          <span className="hidden md:block">AI Core Engine</span>
        </button>

        <div className="mt-4 hidden md:block">
           <div className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 p-3 rounded-lg border border-cyan-500/20">
             <p className="text-[10px] leading-relaxed text-cyan-200/70 italic">
               Note: All vectors currently operating within safety parameters.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
