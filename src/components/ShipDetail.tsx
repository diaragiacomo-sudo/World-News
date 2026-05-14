import React from 'react';
import { Route } from '../types/transport';
import { Ship, Anchor, Package, MapPin, Navigation, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface ShipDetailProps {
  ship: Route;
  onClose: () => void;
}

const ShipDetail: React.FC<ShipDetailProps> = ({ ship, onClose }) => {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute top-0 right-0 h-full w-full max-w-md glass z-50 p-6 overflow-y-auto"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl">
            <Ship size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{ship.id}</h2>
            <div className="flex items-center gap-1 opacity-50 text-xs font-mono">
              <Anchor size={12} />
              <span>MARITIME VESSEL</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors font-mono text-xl">×</button>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-40">
            <Navigation size={14} />
            <span>Navigation Data</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-[10px] uppercase opacity-40 mb-1">Departure</p>
              <p className="font-bold text-sm">{ship.fromName}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-[10px] uppercase opacity-40 mb-1">Destination</p>
              <p className="font-bold text-sm">{ship.toName}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="opacity-50 italic">Route Progress</span>
              <span className="font-mono">{Math.round(ship.progress * 100)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${ship.progress * 100}%` }} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-40">
            <Package size={14} />
            <span>Cargo Manifest</span>
          </div>
          <div className="glass p-4 rounded-2xl border-amber-500/20">
            <p className="text-sm italic opacity-80 leading-relaxed">
              {ship.cargo || "Nessun manifesto di carico disponibile per questa tratta."}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-40">
            <Clock size={14} />
            <span>Schedule</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div>
                <p className="text-[10px] uppercase opacity-40">Partenza Stimata</p>
                <p className="text-sm font-medium">{format(new Date(ship.departureTime), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div>
                <p className="text-[10px] uppercase opacity-40">Arrivo Stimato</p>
                <p className="text-sm font-medium">{format(new Date(ship.arrivalTime), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12">
        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
          DOWNLOAD MANIFEST PDF
        </button>
      </div>
    </motion.div>
  );
};

export default ShipDetail;
