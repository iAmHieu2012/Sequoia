"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import usePanZoom from "@/hooks/usePanZoom";
import useCosmosData from "@/hooks/useCosmosData";
import CyberBrackets from "@/components/ui/CyberBrackets";
import styles from './CosmosMapPreview.module.css';

const CANVAS_SIZE = 10000;

interface CosmosMapPreviewProps {
  targetX: number;
  targetY: number;
  targetScale?: number;
  mapId?: string;
  activeNodeId?: string;
}

export default function CosmosMapPreview({ targetX, targetY, targetScale = 0.2, mapId, activeNodeId }: CosmosMapPreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { scale, translateX, translateY, isTransitioning, flyTo, handlers } = usePanZoom(viewportRef);
  const { mapData, getNodeStatus } = useCosmosData(mapId);

  useEffect(() => {
    if (activeNodeId && mapData) {
      const activeNode = mapData.nodes.find(n => n.articleId === activeNodeId);
      if (activeNode) {
        flyTo(activeNode.x, activeNode.y, targetScale);
        return;
      }
    }
    flyTo(targetX, targetY, targetScale);
  }, [targetX, targetY, targetScale, flyTo, activeNodeId, mapData]);

  const labelOpacity = scale < 0.3 ? 0 : 1;

  return (
    <div
      ref={viewportRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden select-none"
      {...handlers}
      style={{ 
        '--label-opacity': labelOpacity,
        backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-system) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-system) 5%, transparent) 1px, transparent 1px)',
        backgroundSize: `${200 * scale}px ${200 * scale}px`,
        backgroundPosition: `${translateX}px ${translateY}px`,
        transition: isTransitioning ? 'background-position 0.8s cubic-bezier(0.25, 1, 0.5, 1), background-size 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
      } as React.CSSProperties}
    >
      <div
        className={`${styles.mapCanvas} origin-top-left absolute will-change-transform z-[2]`}
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
        }}
      >
        <div className={`${styles.contentLayer} absolute inset-0 z-[5]`}>

          <svg className={`${styles.lightBeams} absolute inset-0 w-full h-full overflow-visible z-[2]`}>
            {mapData &&
              mapData.nodes.flatMap(node =>
                node.connections.map(connId => {
                  const target = mapData.nodes.find(n => n.articleId === connId);
                  if (!target) return null;
                  const beamType = node.celestialType === 'anomaly' ? styles.anomaly : styles.beamIlluminated;
                  return <line key={`${node.articleId}-${connId}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} className={`${styles.beam} ${beamType}`} />;
                })
              )
            }
          </svg>

          {/* Dynamic Nodes from API */}
          {mapData &&
            mapData.nodes.map((node) => {
              const isCompleted = getNodeStatus(node.articleId);
              const isAnomaly = node.celestialType === 'anomaly';
              const statusClass = isAnomaly ? styles.anomaly : (isCompleted ? styles.decoded : styles.unknown);

              return (
                <div
                  key={node.articleId}
                  className={`${styles.celestialObject} ${statusClass}`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => router.push(`/articles/${node.articleId}`)}
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
                      <span>{node.celestialType} //</span>
                      <span className="opacity-40">ID: {node.articleId.length > 10 ? node.articleId.substring(0, 10) + '...' : node.articleId}</span>
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
        <div className="relative bg-black/80 border border-red/30 px-4 py-2 flex flex-col items-end backdrop-blur-sm">
          <CyberBrackets color="border-red/30" />
          <div className="flex items-center gap-3 text-red mb-1">
            <span className="tracking-widest opacity-60">SYS_ZOOM</span>
            <span className="font-bold text-sm">{scale.toFixed(2)}x</span>
          </div>
          <div className="w-full h-[1px] bg-red/20 mb-2" />
          <div className="flex items-center gap-2">
            <div className="text-[8px] text-text-dim tracking-widest uppercase">Target_Lock</div>
            <div className="text-white font-bold">{Math.round(-translateX)}, {Math.round(-translateY)}</div>
          </div>
        </div>

        <button
          className="pointer-events-auto bg-red/10 border border-red/30 text-red px-4 py-2 hover:bg-red/20 hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-widest relative group"
          onClick={(e) => {
            e.stopPropagation();
            flyTo(5000, 5000, 0.2);
          }}
        >
          <CyberBrackets color="border-red/50 group-hover:border-white transition-colors duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red group-hover:bg-white animate-pulse transition-colors duration-300" />
            RECENTER_MAP
          </span>
        </button>
      </div>
    </div>
  );
}
