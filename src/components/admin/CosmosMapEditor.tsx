"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePanZoom } from "@/hooks/cosmos/usePanZoom";
import { useAuth } from "@/contexts/AuthContext";
import { useCosmosData, CosmosNode } from "@/hooks/cosmos/useCosmosData";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { Save } from "lucide-react";
import { AdminService } from "@/services/admin.service";
import styles from '../dashboard/CosmosMapPreview.module.css';

const CANVAS_SIZE = 20000;
const OFFSET = CANVAS_SIZE / 2;

interface CosmosMapEditorProps {
  targetX: number;
  targetY: number;
  targetScale?: number;
  mapId?: string;
  activeNodeId?: string;
  className?: string;
  refreshKey?: number;
  draftNode?: Partial<CosmosNode>;
  onDraftNodeDrag?: (x: number, y: number) => void;
  onDraftNodeConnectionsChange?: (connections: string[]) => void;
  hideSaveButton?: boolean;
}

/**
 * CosmosMapEditor Component
 * An interactive, cyberpunk-themed 2D map editor for placing and linking celestial nodes (Articles/Anomalies).
 * Supports pan and zoom, drag-and-drop repositioning, and Shift+Click to draw connecting beams.
 */
export default function CosmosMapEditor({ targetX, targetY, targetScale = 0.2, mapId, activeNodeId, className = "", refreshKey, draftNode, onDraftNodeDrag, onDraftNodeConnectionsChange, hideSaveButton = false }: CosmosMapEditorProps) {
  const { user } = useAuth();
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hudScaleRef = useRef<HTMLSpanElement>(null);
  const hudTargetRef = useRef<HTMLDivElement>(null);

  const { mapData, getNodeStatus } = useCosmosData(mapId, refreshKey, true);
  const [localNodes, setLocalNodes] = useState<CosmosNode[]>(mapData ? mapData.nodes : []);
  const currentScaleRef = useRef(targetScale);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [linkingNodeId, setLinkingNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const draftNodeRef = useRef(draftNode);
  // eslint-disable-next-line react-hooks/refs
  draftNodeRef.current = draftNode;
  const onDraftNodeDragRef = useRef(onDraftNodeDrag);
  // eslint-disable-next-line react-hooks/refs
  onDraftNodeDragRef.current = onDraftNodeDrag;
  const onDraftNodeConnectionsChangeRef = useRef(onDraftNodeConnectionsChange);
  // eslint-disable-next-line react-hooks/refs
  onDraftNodeConnectionsChangeRef.current = onDraftNodeConnectionsChange;

  const onUpdate = useCallback((x: number, y: number, s: number, isTransitioning: boolean) => {
    currentScaleRef.current = s;
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
  }, []);

  const { flyTo, handlers } = usePanZoom(viewportRef, { onUpdate });
  const [prevMapData, setPrevMapData] = useState(mapData);

  if (mapData !== prevMapData) {
    setPrevMapData(mapData);
    setLocalNodes(mapData ? mapData.nodes : []);
  }

  useEffect(() => {
    
    const onMouseMove = (e: MouseEvent) => {
      if (draggingNodeId) {
        if (draftNodeRef.current && draggingNodeId === draftNodeRef.current.article_id && onDraftNodeDragRef.current) {
          const dn = draftNodeRef.current;
          let newX = (dn.x || 0) + e.movementX / currentScaleRef.current;
          let newY = (dn.y || 0) + e.movementY / currentScaleRef.current;
          newX = Math.max(-OFFSET, Math.min(OFFSET, newX));
          newY = Math.max(-OFFSET, Math.min(OFFSET, newY));
          onDraftNodeDragRef.current(newX, newY);
        } else {
          setLocalNodes(nodes => nodes.map(n => {
            if (n.article_id === draggingNodeId) {
              let newX = n.x + e.movementX / currentScaleRef.current;
              let newY = n.y + e.movementY / currentScaleRef.current;
              newX = Math.max(-OFFSET, Math.min(OFFSET, newX));
              newY = Math.max(-OFFSET, Math.min(OFFSET, newY));
              return { ...n, x: newX, y: newY };
            }
            return n;
          }));
        }
      }
    };
    
    const onMouseUp = () => {
      if (draggingNodeId) setDraggingNodeId(null);
    };

    if (draggingNodeId) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingNodeId]);

  useEffect(() => {
    if (draggingNodeId) return;

    const doFlyTo = () => {
      if (activeNodeId) {
        let activeNode: CosmosNode | undefined;
        if (draftNode && draftNode.article_id === activeNodeId) {
          activeNode = draftNode as CosmosNode;
        } else {
          activeNode = localNodes.find(n => n.article_id === activeNodeId);
        }
        
        if (activeNode) {
          flyTo(activeNode.x + OFFSET, activeNode.y + OFFSET, targetScale);
          return;
        }
      }
      
      let cx = targetX;
      let cy = targetY;
      
      if (!activeNodeId && localNodes.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        localNodes.forEach(n => {
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

    if (viewportRef.current && viewportRef.current.clientWidth === 0) {
      const t = setTimeout(doFlyTo, 350);
      return () => clearTimeout(t);
    } else {
      doFlyTo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX, targetY, targetScale, flyTo, activeNodeId, localNodes.length, draggingNodeId, draftNode]);

  const handleSaveMap = async () => {
    if (!mapId || localNodes.length === 0 || !user) return;
    setIsSaving(true);
    try {
      await AdminService.saveCosmosMap(mapId, localNodes);
      alert("Map saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving map.");
    }
    setIsSaving(false);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation(); // prevent panning

    if (e.shiftKey) {
      if (!linkingNodeId) {
        setLinkingNodeId(nodeId);
      } else if (linkingNodeId !== nodeId) {
        if (draftNodeRef.current && linkingNodeId === draftNodeRef.current.article_id && onDraftNodeConnectionsChangeRef.current) {
          const dn = draftNodeRef.current;
          const hasConn = (dn.connections || []).includes(nodeId);
          const newConns = hasConn ? (dn.connections || []).filter((c: string) => c !== nodeId) : [...(dn.connections || []), nodeId];
          onDraftNodeConnectionsChangeRef.current(newConns);
        } else {
          setLocalNodes(nodes => nodes.map(n => {
            if (n.article_id === linkingNodeId) {
              const hasConn = n.connections.includes(nodeId);
              return {
                ...n,
                connections: hasConn ? n.connections.filter((c: string) => c !== nodeId) : [...n.connections, nodeId]
              };
            }
            return n;
          }));
        }
        setLinkingNodeId(null);
      } else {
        setLinkingNodeId(null);
      }
    } else {
      setDraggingNodeId(nodeId);
    }
  };

  const renderNodes = [...localNodes];
  if (draftNode && draftNode.article_id) {
    const existingIndex = renderNodes.findIndex(n => n.article_id === draftNode.article_id);
    if (existingIndex !== -1) {
      renderNodes[existingIndex] = { ...renderNodes[existingIndex], ...draftNode };
    } else {
      renderNodes.push(draftNode as CosmosNode);
    }
  }

  return (
    <div className={`relative bg-black/60 border border-white/20 overflow-hidden ${className}`}>
      <CyberBrackets color="border-white/30" />
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-2">
        <span className="bg-black/90 text-white border border-white/30 px-2 py-0.5 text-xs font-mono tracking-widest uppercase">
          MAP_EDITOR
        </span>
        <div className="bg-black/80 border border-white/20 p-2 text-xs font-mono text-white/60">
          <div>DRAG TO MOVE</div>
          <div>SHIFT+CLICK TO LINK</div>
          {linkingNodeId && <div className="text-coral mt-1 animate-pulse">SELECT TARGET...</div>}
        </div>
      </div>
      
      <div className="absolute inset-0">
        <div
          ref={viewportRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden select-none touch-none"
          {...handlers}
      style={{ 
        backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-system) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-system) 5%, transparent) 1px, transparent 1px)',
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
            {renderNodes.flatMap(node =>
              (node.connections || []).map((connId: string) => {
                const target = renderNodes.find(n => n.article_id === connId);
                if (!target) return null;
                const beamType = node.celestial_type === 'anomaly' ? styles.anomaly : styles.beamIlluminated;
                return <line key={`${node.article_id}-${connId}`} x1={node.x + OFFSET} y1={node.y + OFFSET} x2={target.x + OFFSET} y2={target.y + OFFSET} className={`${styles.beam} ${beamType}`} />;
              })
            )}
            {/* Draw temporary line when linking */}
            {linkingNodeId && (
              <line 
                x1={(renderNodes.find(n => n.article_id === linkingNodeId)?.x || 0) + OFFSET} 
                y1={(renderNodes.find(n => n.article_id === linkingNodeId)?.y || 0) + OFFSET} 
                x2={1000} // temporary fallback, actual tracking requires window pointermove logic, which is complex, we just skip dynamic line for simplicity
                y2={1000} 
                className={`${styles.beam} ${styles.anomaly} opacity-50`} 
              />
            )}
          </svg>

          {/* Dynamic Nodes from API */}
          {renderNodes.map((node) => {
              const isCompleted = getNodeStatus(node.article_id);
              const isAnomaly = node.celestial_type === 'anomaly';
              const statusClass = isAnomaly ? styles.anomaly : (isCompleted ? styles.decoded : styles.unknown);

              return (
                <div
                  key={node.article_id}
                  className={`group ${styles.celestialObject} ${statusClass} ${draggingNodeId === node.article_id ? 'opacity-80' : ''}`}
                  style={{ left: node.x + OFFSET, top: node.y + OFFSET }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.article_id)}
                >
                  {draggingNodeId === node.article_id && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 border border-white/50 text-white px-2 py-0.5 text-xs font-mono whitespace-nowrap z-50 pointer-events-none">
                      X: {Math.round(node.x)} Y: {Math.round(node.y)}
                    </div>
                  )}

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
                      <div className={`${styles.objectLabel} text-coral text-xl font-bold animate-pulse flex flex-col items-center gap-1`}>
                        <span>{node.title.toUpperCase()}</span>
                        <span className="text-xs font-mono text-coral/90 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 border border-coral/30 rounded">[{Math.round(node.x)}, {Math.round(node.y)}]</span>
                      </div>
                    </>
                  ) : (
                    <>
                        {isCompleted && (
                          <>
                          <div className="absolute top-1/2 left-1/2 -mt-24 -ml-24 w-48 h-48 border border-white/20 animate-[spin_10s_linear_infinite]" />
                          <div className="absolute top-1/2 left-1/2 -mt-32 -ml-32 w-64 h-64 border border-white/10 animate-[spin_15s_linear_infinite_reverse]" />
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
                      <div className={`${styles.objectLabel} flex flex-col items-center gap-1 ${isCompleted ? 'text-white drop-shadow-[0_0_10px_var(--color-white)]' : ''}`}>
                        <span>{node.title}</span>
                        <span className="text-xs font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 border border-white/20 rounded">[{Math.round(node.x)}, {Math.round(node.y)}]</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

        </div>
      </div>

      {/* HUD Telemetry & Actions */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-none z-30">
        
        {/* Map Actions & Telemetry Container */}
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/20 p-2 pr-2">
          {/* Telemetry Ruler */}
          <div className="flex items-center gap-4 text-white font-mono border-r-2 border-white/20 pr-4 pl-2">
            <div className="flex flex-col items-end">
              <span className="text-xs tracking-widest uppercase opacity-60">Target_Lock</span>
              <span ref={hudTargetRef} className="font-bold text-xs">0, 0</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex flex-col items-end">
              <span className="text-xs tracking-widest uppercase opacity-60">SYS_ZOOM</span>
              <span ref={hudScaleRef} className="font-bold text-xs">0.20x</span>
            </div>
          </div>

          <button
            className="pointer-events-auto border border-white/20 p-2 flex items-center justify-center cursor-pointer group hover:bg-white hover:text-black transition-colors text-white mr-1"
            onClick={(e) => {
              e.stopPropagation();
              flyTo(10000, 10000, 0.2);
            }}
            title="Recenter Map"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M3 3h6v2H5v4H3V3zm18 0h-6v2h4v4h2V3zM3 21h6v-2H5v-4H3v6zm18 0h-6v-2h4v-4h2v6zM9 9h6v6H9V9z" />
            </svg>
          </button>
        </div>

        {!hideSaveButton && (
          <button
            className="pointer-events-auto bg-black/80 border border-white/20 hover:border-white px-6 py-2 hover:bg-white/10 transition-all duration-300 cursor-pointer uppercase font-mono tracking-widest relative group overflow-hidden flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveMap();
            }}
          >
            <CyberBrackets color="border-white/30 group-hover:border-white transition-colors duration-300" />
            <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 font-bold text-xs text-white transition-all duration-300">
              <Save className="w-3.5 h-3.5" /> {isSaving ? "SAVING..." : "SAVE MAP"}
            </span>
          </button>
        )}
      </div>
    </div>
    </div>
    </div>
  );
}
