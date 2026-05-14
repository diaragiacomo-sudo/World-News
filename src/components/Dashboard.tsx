import React, { useState } from 'react';
import { Route } from '../types/transport';
import { Plane, Ship, Train, MoreVertical, Heart, AlertCircle, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  routes: Route[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onViewRoute: (route: Route) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ routes, favorites, toggleFavorite, onViewRoute }) => {
  const [filter, setFilter] = useState<'all' | 'plane' | 'ship' | 'train'>('all');

  const filteredRoutes = routes.filter(r => filter === 'all' || r.type === filter);

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white uppercase italic">Status<span className="text-accent">Monitor</span></h2>
          <p className="font-mono text-[10px] opacity-40 uppercase tracking-[0.2em] mt-1">Live Global Analytics • {routes.length} Active System Nodes</p>
        </div>
        <div className="flex gap-2 bg-bg-dark border border-accent/10 p-1 rounded-lg">
          {(['all', 'plane', 'ship', 'train'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === f ? "bg-accent text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "opacity-40 hover:opacity-100"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {filter === 'ship' ? (
        <div className="flex-1 overflow-hidden flex flex-col bg-bg-dark border border-accent/10 rounded-2xl">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Vessel Manifest & Cargo Data</h4>
            <div className="flex gap-4 text-[9px] uppercase tracking-wider font-bold">
               <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> Operational</span>
               <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> In Transit</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-bg-dark text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-white/5 z-10">
                <tr>
                  <th className="px-6 py-4">Vessel ID</th>
                  <th className="px-6 py-4">Origin</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Cargo Load</th>
                  <th className="px-6 py-4 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRoutes.map(route => (
                  <tr key={route.id} onClick={() => onViewRoute(route)} className="hover:bg-accent/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-mono text-accent-bright group-hover:text-white transition-colors">{route.id}</td>
                    <td className="px-6 py-4 opacity-70">{route.fromName}</td>
                    <td className="px-6 py-4 opacity-70">{route.toName}</td>
                    <td className="px-6 py-4 font-italic text-slate-400">{route.cargo || 'General Logistics'}</td>
                    <td className="px-6 py-4 text-right">
                       <span className="font-mono text-emerald-400">{Math.round(route.progress * 100)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredRoutes.map(route => (
              <motion.div
                key={route.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-bg-card border border-accent/10 p-5 rounded-2xl group hover:border-accent/40 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-accent/10 transition-all" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={cn(
                    "p-2.5 rounded-xl tech-border",
                    route.type === 'plane' ? "bg-accent/10 text-accent" : 
                    route.type === 'ship' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  )}>
                    {route.type === 'plane' ? <Plane size={20} /> : route.type === 'ship' ? <Ship size={20} /> : <Train size={20} />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleFavorite(route.id)} className={cn("p-1.5 rounded-lg hover:bg-white/5 transition-all", favorites.includes(route.id) ? "text-red-500" : "opacity-30 hover:opacity-100")}>
                      <Heart size={16} fill={favorites.includes(route.id) ? "currentColor" : "none"} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 opacity-30 hover:opacity-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <h3 className="font-mono text-sm tracking-widest text-white group-hover:text-accent-bright transition-colors uppercase">{route.id}</h3>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                       <span className="text-xs font-bold">{route.fromName}</span>
                       <span className="opacity-20 text-[10px]">⎯⎯⎯⎯</span>
                       <span className="text-xs font-bold">{route.toName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-bold tracking-[0.2em] opacity-40">
                      <span>Vector Status</span>
                      <span>SPD: {Math.floor(Math.random() * 500) + 10} units</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={cn(
                          "h-full",
                          route.type === 'plane' ? "bg-accent" : route.type === 'ship' ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${route.progress * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]", route.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 italic">{route.status}</span>
                    </div>
                    <button 
                      onClick={() => onViewRoute(route)}
                      className="text-[10px] uppercase font-bold text-accent-bright hover:text-white transition-colors tracking-widest"
                    >
                      Focus Node
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
