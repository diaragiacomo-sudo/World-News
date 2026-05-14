import React from 'react';
import { Route, TransportNotification } from '../types/transport';
import { Bell, Clock, Info, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface NotificationsProps {
  notifications: TransportNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkAsRead, onClearAll }) => {
  return (
    <div className="flex flex-col h-full bg-bg p-6 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Centro Notifiche</h2>
          <p className="font-mono text-xs opacity-50 uppercase mt-1">Aggiornamenti di stato in tempo reale</p>
        </div>
        <button 
          onClick={onClearAll}
          className="text-xs font-bold uppercase text-accent hover:underline"
        >
          Cancella tutto
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass p-12 rounded-3xl text-center space-y-4"
            >
              <Bell className="mx-auto opacity-20" size={48} />
              <p className="opacity-40 italic">Nessuna nuova notifica.</p>
            </motion.div>
          ) : (
            notifications.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "glass p-4 rounded-xl relative group transition-all",
                  !n.isRead ? "border-l-4 border-l-accent" : "opacity-60"
                )}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "p-2 rounded-lg h-fit",
                    n.type === 'departure' ? "bg-accent/20 text-accent" : 
                    n.type === 'delay' ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
                  )}>
                    {n.type === 'departure' ? <Info size={18} /> : n.type === 'delay' ? <Info size={18} /> : <CheckCircle size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-50 text-[10px] font-mono">
                      <Clock size={12} />
                      <span>{format(new Date(n.createdAt), 'HH:mm • dd MMM')}</span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button 
                      onClick={() => onMarkAsRead(n.id)}
                      className="p-1 hover:bg-white/10 rounded absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
