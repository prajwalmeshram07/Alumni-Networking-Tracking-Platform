import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export function Globe3D({ markers, config, onMarkerClick, onMarkerHover }) {
  const globeEl = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight - 64 });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight - 64 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = config?.autoRotateSpeed || 0.3;
      globeEl.current.pointOfView({ altitude: 2 });
    }
  }, [config]);

  return (
    <Globe
      ref={globeEl}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundColor="rgba(17, 24, 39, 1)"
      htmlElementsData={markers}
      htmlElement={d => {
        const el = document.createElement('div');
        
        // Critical: React-Globe overrides pointer events natively on the canvas. 
        // We must formally enforce DOM interaction on our generated markers!
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        
        el.innerHTML = `
          <div class="relative group cursor-pointer transform hover:scale-125 hover:z-50 transition-all duration-300 flex flex-col items-center justify-center">
            
            <div class="opacity-0 group-hover:opacity-100 absolute bottom-[110%] mb-2 whitespace-nowrap transition-all pointer-events-none flex flex-col items-center z-50">
              <div class="bg-gray-900 border border-gray-700 text-white rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                <div class="bg-primary/20 px-4 py-2 border-b border-gray-700">
                   <div class="font-black text-[13px] text-blue-400 tracking-wide">${d.name || d.label}</div>
                </div>
                <div class="px-4 py-2.5 flex flex-col gap-1.5 text-xs font-medium text-gray-300">
                   ${d.company ? `<div class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2 flex-shrink-0"></span><span class="truncate max-w-[150px]">${d.company}</span></div>` : ''}
                   ${d.location ? `<div class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span><span class="truncate max-w-[150px]">${d.location}</span></div>` : ''}
                </div>
              </div>
              <div class="w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-gray-700 -mt-[7px]"></div>
            </div>

            <img src="${d.src}" class="w-10 h-10 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(77,166,255,0.8)] object-cover bg-gray-800 pointer-events-auto" />
            
          </div>
        `;
        
        // Force bind the click events safely routing back to react native hooks
        el.addEventListener('mousedown', (e) => {
             e.stopPropagation();
        });
        el.addEventListener('click', (e) => {
             e.stopPropagation();
             onMarkerClick && onMarkerClick(d);
        });
        
        return el;
      }}
      atmosphereColor={config?.atmosphereColor || "#4da6ff"}
      atmosphereAltitude={config?.atmosphereIntensity ? config.atmosphereIntensity / 100 : 0.25}
    />
  );
}
