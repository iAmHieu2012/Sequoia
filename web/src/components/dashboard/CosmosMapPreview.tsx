"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePanZoom } from "@/hooks/cosmos/usePanZoom";
import { useCosmosData } from "@/hooks/cosmos/useCosmosData";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CyberBadge from "@/components/ui/CyberBadge";
import styles from './CosmosMapPreview.module.css';

const CANVAS_SIZE = 20000;
const OFFSET = CANVAS_SIZE / 2;

interface CosmosMapPreviewProps {
  /** Target X coordinate to fly to initially */
  targetX: number;
  /** Target Y coordinate to fly to initially */
  targetY: number;
  /** Zoom scale, defaults to 0.2 */
  targetScale?: number;
  /** The map data ID to load and render */
  mapId?: string;
  /** If provided, overrides targetX/targetY and flies to this specific node's coordinates */
  activeNodeId?: string;
  className?: string;
}

/**
 * A high-performance 2D canvas that renders Cosmos Map nodes and connections.
 * Bypasses React state for pan/zoom rendering to achieve 60fps via usePanZoom hook.
 */
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
      if (hudTargetRef.current && viewportRef.current) {
        const w = viewportRef.current.clientWidth;
        const h = viewportRef.current.clientHeight;
        const canvasX = (w / 2 - x) / s;
        const canvasY = (h / 2 - y) / s;
        hudTargetRef.current.textContent = `${Math.round(canvasX - OFFSET)}, ${Math.round(canvasY - OFFSET)}`;
      }
    }
  });
  const { mapData, getNodeStatus } = useCosmosData(mapId);

  useEffect(() => {
    const doFlyTo = () => {
      const OFFSET = CANVAS_SIZE / 2;
      if (activeNodeId && mapData) {
        const activeNode = mapData.nodes.find(n => n.article_id === activeNodeId);
        if (activeNode) {
          flyTo(activeNode.x + OFFSET, activeNode.y + OFFSET, targetScale);
          return;
        }
      }
      
      let cx = targetX;
      let cy = targetY;
      
      if (!activeNodeId && mapData && mapData.nodes.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        mapData.nodes.forEach(n => {
          if (n.x < minX) minX = n.x;
          if (n.x > maxX) maxX = n.x;
          if (n.y < minY) minY = n.y;
          if (n.y > maxY) maxY = n.y;
        });
        cx = (minX + maxX) / 2;
        cy = (minY + maxY) / 2;
      }
      
      flyTo(cx + OFFSET, cy + OFFSET, targetScale);
    };
    doFlyTo();
  }, [targetX, targetY, targetScale, flyTo, activeNodeId, mapData]);

  return (
    <div className={`relative bg-black/60 border border-white/20 overflow-hidden ${className}`}>
      <CyberBrackets color="border-white/40" />
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <CyberBadge variant="outline" className="opacity-40">COSMOS MAP</CyberBadge>
      </div>
      <div className="absolute inset-0">
        <div
          ref={viewportRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden select-none"
          {...handlers}
      style={{ 
        backgroundImage: 'linear-gradient(color-mix(in srgb, #ffffff 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, #ffffff 5%, transparent) 1px, transparent 1px)',
      } as React.CSSProperties}
    >
      <div
        ref={canvasRef}
        className={`${styles.mapCanvas} origin-top-left absolute will-change-transform z-2`}
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
        }}
      >
        <div className={`${styles.contentLayer} absolute inset-0 z-5`}>

          <svg className={`${styles.lightBeams} absolute inset-0 w-full h-full overflow-visible z-2`}>
            {mapData &&
              mapData.nodes.flatMap(node =>
                node.connections.map(connId => {
                  const target = mapData.nodes.find(n => n.article_id === connId);
                  if (!target) return null;
                  const beamType = node.celestial_type === 'anomaly' ? styles.anomaly : styles.beamIlluminated;
                  return <line key={`${node.article_id}-${connId}`} x1={node.x + OFFSET} y1={node.y + OFFSET} x2={target.x + OFFSET} y2={target.y + OFFSET} className={`${styles.beam} ${beamType}`} />;
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
                  style={{ left: node.x + OFFSET, top: node.y + OFFSET }}
                  onClick={() => router.push(`/articles/${node.article_id}`)}
                >
                  {isAnomaly ? (
                    <>
                      <div className="absolute top-1/2 left-1/2 -mt-16 -ml-16 w-32 h-32 rotate-45">
                        <div className="w-full h-full border border-coral/30 bg-coral/5 animate-ping" />
                      </div>
                      <div className={`${styles.star} text-coral`}>
                        <div className={styles.glowWrapper}>
                          <div className={styles.maskRotator}>
                            <div className={styles.outerDiamond}></div>
                          </div>
                        </div>
                        <div className={styles.coreDiamond}></div>
                      </div>
                      <div className={`${styles.objectLabel} font-mono text-xl text-coral font-bold animate-pulse`}>{node.title.replace(/ /g, '_').toUpperCase()}</div>
                    </>
                  ) : (
                    <>
                        {isCompleted && (
                          <>
                          <div className="absolute top-1/2 left-1/2 -mt-24 -ml-24 w-48 h-48 border border-teal-400/20 animate-[spin_10s_linear_infinite]" />
                          <div className="absolute top-1/2 left-1/2 -mt-32 -ml-32 w-64 h-64 border border-teal-400/10 animate-[spin_15s_linear_infinite_reverse]" />
                          </>
                        )}
                      <div className={styles.star}>
                        <div className={styles.glowWrapper}>
                          <div className={styles.maskRotator}>
                            <div className={styles.outerDiamond}></div>
                          </div>
                        </div>
                        <div className={styles.coreDiamond}></div>
                      </div>
                      <div className={`${styles.objectLabel} font-mono text-xl ${isCompleted ? 'text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]' : ''}`}>{node.title}</div>
                    </>
                  )}


                </div>
              );
            })
          }

        </div>
      </div>

      {/* HUD Telemetry & Actions */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 pointer-events-none z-1000 bg-black/40 backdrop-blur-md border border-white/10 p-3 pr-4">
        
        {/* Telemetry Ruler */}
        <div className="flex items-center gap-4 text-white font-mono border-r-2 border-white pr-4">
          <div className="flex flex-col items-end">
            <span className="text-xs tracking-widest uppercase">Target_Lock</span>
            <span ref={hudTargetRef} className="font-bold text-xs">0, 0</span>
          </div>
          <div className="w-px h-6 bg-white/40" />
          <div className="flex flex-col items-end">
            <span className="text-xs tracking-widest uppercase">SYS_ZOOM</span>
            <span ref={hudScaleRef} className="font-bold text-sm">0.20x</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="pointer-events-auto border border-white p-2 flex items-center justify-center cursor-pointer group hover:bg-white hover:text-black transition-none text-white"
          onClick={(e) => {
            e.stopPropagation();
            flyTo(0, 0, 0.2);
          }}
          title="Recenter Map"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <path d="M3 3h6v2H5v4H3V3zm18 0h-6v2h4v4h2V3zM3 21h6v-2H5v-4H3v6zm18 0h-6v-2h4v-4h2v6zM9 9h6v6H9V9z" />
          </svg>
        </button>
      </div>
    </div>
    </div>
    </div>
  );
}
