import React, { useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { Route } from '../types/transport';
import { MAJOR_HUBS, Hub } from '../constants/hubs';

interface GlobeViewProps {
  routes: Route[];
  onRouteClick?: (route: Route) => void;
}

const GlobeView: React.FC<GlobeViewProps> = ({ routes, onRouteClick }) => {
  const globeEl = useRef<any>(null);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const arcData = useMemo(() => {
    return routes.map(r => ({
      startLat: r.fromCoords.lat,
      startLng: r.fromCoords.lng,
      endLat: r.toCoords.lat,
      endLng: r.toCoords.lng,
      color: r.type === 'plane' ? '#06b6d4' : r.type === 'ship' ? '#f59e0b' : '#10b981',
      name: `${r.fromName} → ${r.toName}`,
      arcAlt: r.type === 'plane' ? 0.5 : r.type === 'ship' ? 0.05 : 0.1,
      ...r
    }));
  }, [routes]);

  const currentPoints = useMemo(() => {
    return routes.map(r => {
      // Linear interpolation based on progress
      const lat = r.fromCoords.lat + (r.toCoords.lat - r.fromCoords.lat) * r.progress;
      const lng = r.fromCoords.lng + (r.toCoords.lng - r.fromCoords.lng) * r.progress;
      return {
        lat,
        lng,
        size: r.type === 'plane' ? 0.3 : 0.5,
        color: r.type === 'plane' ? '#22d3ee' : r.type === 'ship' ? '#fbbf24' : '#34d399',
        label: r.type.toUpperCase(),
        ...r
      };
    });
  }, [routes]);

  return (
    <div className="w-full h-full bg-[#02040a]">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        arcsData={arcData}
        arcColor="color"
        arcAltitude="arcAlt"
        arcDashLength={0.5}
        arcDashGap={1}
        arcDashAnimateTime={1500}
        labelsData={currentPoints}
        labelLat={d => (d as any).lat}
        labelLng={d => (d as any).lng}
        labelText={d => (d as any).label}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={d => (d as any).color}
        labelResolution={2}
        onLabelClick={(d: any) => onRouteClick?.(d)}
        onArcClick={(d: any) => onRouteClick?.(d)}
        
        pointsData={MAJOR_HUBS}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d: any) => (d as Hub).type === 'airport' ? '#06b6d4' : (d as Hub).type === 'port' ? '#f59e0b' : '#ffffff'}
        pointRadius={0.2}
        pointAltitude={0.01}
        pointLabel={(d: any) => `Hub: ${(d as Hub).name} (${(d as Hub).type.toUpperCase()})`}
      />
    </div>
  );
};

export default GlobeView;
