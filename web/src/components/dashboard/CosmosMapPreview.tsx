"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import usePanZoom from "@/hooks/cosmos/usePanZoom";
import useCosmosData from "@/hooks/cosmos/useCosmosData";
import CyberBrackets from "@/components/ui/CyberBrackets";
import styles from './CosmosMapPreview.module.css';

const CANVAS_SIZE = 10000;

interface CosmosMapPreviewProps {
  targetX: number;
  targetY: number;
  targetScale?: number;
  mapId?: string;
  activeNodeId?: string;
  className?: string;
}

export default function CosmosMapPreview({ targetX, targetY, targetScale = 0.2, mapId, activeNodeId, className = "" }: CosmosMapPreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hudScaleRef = useRef<HTMLSpanElement>(null);
  const hudTargetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { flyTo, handlers } = usePanZoom(viewportRef, {
    onUpdate: (x, y, s, isTransitioning) => {
      if (viewportRef.current) {
        viewportRef.current.style.setProperty('--label-opacity', s < 0.3 ? '0' : '1');
        viewportRef.current.style.backgroundSize = `${200 * s}px ${200 * s}px`;
        viewportRef.current.style.backgroundPosition = `${x}px ${y}px`;
        viewportRef.current.style.transition = isTransitioning ? 'background-position 0.8s cubic-bezier(0.25, 1, 0.5, 1), background-size 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
      }
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
        canvasRef.current.style.transition = isTransitioning ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
      }
      if (hudScaleRef.current) {
        hudScaleRef.current.textContent = `${s.toFixed(2)}x`;
      }
      if (hudTargetRef.current) {
        hudTargetRef.current.textContent = `${Math.round(-x)}, ${Math.round(-y)}`;
      }
    }
  });
  const { mapData, getNodeStatus } = useCosmosData(mapId);

  useEffect(() => {
    if (activeNodeId && mapData) {
      const activeNode = mapData.nodes.find(n => n.article_id === activeNodeId);
      if (activeNode) {
        flyTo(activeNode.x, activeNode.y, targetScale);
        return;
      }
    }
    flyTo(targetX, targetY, targetScale);
  }, [targetX, targetY, targetScale, flyTo, activeNodeId, mapData]);

  return (
    <div className={`relative bg-black/60 border border-panel-border overflow-hidden ${className}`}>
      <CyberBrackets color="border-cyan/30" />
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <span className="bg-black/90 text-cyan border border-cyan/30 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase">
          MAP_PREVIEW
        </span>
      </div>
      
      <div className="absolute inset-0">
        <div
          ref={viewportRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden select-none"
          {...handlers}
      style={{ 
        backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-system) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-system) 5%, transparent) 1px, transparent 1px)',
      } as React.CSSProperties}
    >
      <div
        ref={canvasRef}
        className={`${styles.mapCanvas} origin-top-left absolute will-change-transform z-[2]`}
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
        }}
      >
        <div className={`${styles.contentLayer} absolute inset-0 z-[5]`}>

          <svg className={`${styles.lightBeams} absolute inset-0 w-full h-full overflow-visible z-[2]`}>
            {mapData &&
              mapData.nodes.flatMap(node =>
                node.connections.map(connId => {
                  const target = mapData.nodes.find(n => n.article_id === connId);
                  if (!target) return null;
                  const beamType = node.celestial_type === 'anomaly' ? styles.anomaly : styles.beamIlluminated;
                  return <line key={`${node.article_id}-${connId}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} className={`${styles.beam} ${beamType}`} />;
                })
              )
            }
          </svg>

          {/* Dynamic Nodes from API */}
          {mapData &&
            mapData.nodes.map((node) => {
              const isCompleted = getNodeStatus(node.article_id);
              const isAnomaly = node.celestial_type === 'anomaly';
              const statusClass = isAnomaly ? styles.anomaly : (isCompleted ? styles.decoded : styles.unknown);

              return (
                <div
                  key={node.article_id}
                  className={`${styles.celestialObject} ${statusClass}`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => router.push(`/articles/${node.article_id}`)}
                >
                  {isAnomaly ? (
                    <>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-coral/10 rounded-full animate-ping" />
                      <div className={`${styles.star} bg-coral shadow-[0_0_20px_var(--color-coral)]`} />
                      <div className={`${styles.objectLabel} text-coral text-xl font-bold animate-pulse`}>{node.title.replace(/ /g, '_').toUpperCase()}</div>
                    </>
                  ) : (
                    <>
                        {isCompleted && (
                          <>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan/20 rounded-full animate-[spin_10s_linear_infinite]" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                          </>
                        )}
                      <div className={styles.star} />
                      <div className={`${styles.objectLabel} ${isCompleted ? 'text-cyan drop-shadow-[0_0_10px_var(--color-cyan)]' : ''}`}>{node.title}</div>
                    </>
                  )}

                  <div className={`${styles.observationLog} scale-150 transform-origin-top-left`}>
                    <div className={styles.logHeader}>
                      <span>{node.celestial_type} //</span>
                      <span className="opacity-40">ID: {node.article_id.length > 10 ? node.article_id.substring(0, 10) + '...' : node.article_id}</span>
                    </div>
                    <div className={styles.logTitle}>{node.title}</div>
                    <div className={styles.signalStatus}>
                      <div className={styles.statusIndicator}>
                        <div className={styles.statusDot} />
                        <span className={styles.statusText}>
                          {isAnomaly ? 'ANALYZING' : (isCompleted ? 'DECODED' : 'DETECTED')}
                        </span>
                      </div>
                      <span className="text-[0.65rem] text-text-dim">{isCompleted ? 'SYS_SYNCED' : 'SYS_READY'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          }

        </div>
      </div>

      {/* Zoom HUD */}
      <div className="absolute bottom-6 right-6 font-mono text-[10px] flex flex-col items-end gap-2 pointer-events-none z-[1000]">
        <div className="relative bg-black/80 border border-cyan/30 px-4 py-2 flex flex-col items-end backdrop-blur-sm">
          <CyberBrackets color="border-cyan/30" />
          <div className="flex items-center gap-3 text-cyan mb-1">
            <span className="tracking-widest opacity-60">SYS_ZOOM</span>
            <span ref={hudScaleRef} className="font-bold text-sm">0.20x</span>
          </div>
          <div className="w-full h-[1px] bg-cyan/20 mb-2" />
          <div className="flex items-center gap-2">
            <div className="text-[8px] text-text-dim tracking-widest uppercase">Target_Lock</div>
            <div ref={hudTargetRef} className="text-white font-bold">0, 0</div>
          </div>
        </div>

        <button
          className="pointer-events-auto bg-black/80 border border-panel-border hover:border-cyan/50 px-4 py-2 hover:bg-cyan/5 transition-all duration-300 cursor-pointer uppercase tracking-widest relative group overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            flyTo(5000, 5000, 0.2);
          }}
        >
          <CyberBrackets color="border-cyan/30 group-hover:border-cyan transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-cyan scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-cyan)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-cyan/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <span className="relative z-10 flex items-center gap-2 font-bold text-cyan group-hover:drop-shadow-[0_0_8px_var(--color-cyan)] group-hover:text-cyan transition-all duration-300">
            <div className="w-1.5 h-1.5 bg-cyan shadow-[0_0_8px_var(--color-cyan)] animate-pulse transition-colors duration-300" />
            RECENTER_MAP
          </span>
        </button>
      </div>
    </div>
    </div>
    </div>
  );
}
