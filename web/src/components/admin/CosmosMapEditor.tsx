"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import usePanZoom from "@/hooks/cosmos/usePanZoom";
import { useAuth } from "@/contexts/AuthContext";
import useCosmosData, { CosmosNode } from "@/hooks/cosmos/useCosmosData";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { Save } from "lucide-react";
import { AdminService } from "@/services/admin.service";
import styles from '../dashboard/CosmosMapPreview.module.css';

const CANVAS_SIZE = 10000;

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
      hudTargetRef.current.textContent = `${Math.round(canvasX)}, ${Math.round(canvasY)}`;
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
          newX = Math.max(0, Math.min(CANVAS_SIZE, newX));
          newY = Math.max(0, Math.min(CANVAS_SIZE, newY));
          onDraftNodeDragRef.current(newX, newY);
        } else {
          setLocalNodes(nodes => nodes.map(n => {
            if (n.article_id === draggingNodeId) {
              let newX = n.x + e.movementX / currentScaleRef.current;
              let newY = n.y + e.movementY / currentScaleRef.current;
              newX = Math.max(0, Math.min(CANVAS_SIZE, newX));
              newY = Math.max(0, Math.min(CANVAS_SIZE, newY));
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
          flyTo(activeNode.x, activeNode.y, targetScale);
          return;
        }
      }
      
      flyTo(targetX, targetY, targetScale);
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
    <div className={`relative bg-black/60 border border-panel-border overflow-hidden ${className}`}>
      <CyberBrackets color="border-/30" />
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-2">
        <span className="bg-black/90 text-white border border-white/30 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase">
          MAP_EDITOR
        </span>
        <div className="bg-black/80 border border-white/20 p-2 text-[9px] font-mono text-white/60">
          <div>DRAG TO MOVE</div>
          <div>SHIFT+CLICK TO LINK</div>
          {linkingNodeId && <div className="text-coral mt-1 animate-pulse">SELECT TARGET...</div>}
        </div>
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
            {renderNodes.flatMap(node =>
              (node.connections || []).map((connId: string) => {
                const target = renderNodes.find(n => n.article_id === connId);
                if (!target) return null;
                const beamType = node.celestial_type === 'anomaly' ? styles.anomaly : styles.beamIlluminated;
                return <line key={`${node.article_id}-${connId}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} className={`${styles.beam} ${beamType}`} />;
              })
            )}
            {/* Draw temporary line when linking */}
            {linkingNodeId && (
              <line 
                x1={renderNodes.find(n => n.article_id === linkingNodeId)?.x || 0} 
                y1={renderNodes.find(n => n.article_id === linkingNodeId)?.y || 0} 
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
                  style={{ left: node.x, top: node.y }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.article_id)}
                >
                  {draggingNodeId === node.article_id && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 border border-white/50 text-white px-2 py-0.5 text-[8px] font-mono whitespace-nowrap z-50 pointer-events-none">
                      X: {Math.round(node.x)} Y: {Math.round(node.y)}
                    </div>
                  )}

                  {isAnomaly ? (
                    <>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-coral/10 rounded-full animate-ping" />
                      <div className={`${styles.star} bg-coral shadow-[0_0_20px_var(--color-coral)]`} />
                      <div className={`${styles.objectLabel} text-coral text-xl font-bold animate-pulse flex flex-col items-center gap-1`}>
                        <span>{node.title.replace(/ /g, '_').toUpperCase()}</span>
                        <span className="text-[11px] font-mono text-coral/90 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 border border-coral/30 rounded">[{Math.round(node.x)}, {Math.round(node.y)}]</span>
                      </div>
                    </>
                  ) : (
                    <>
                        {isCompleted && (
                          <>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                          </>
                        )}
                      <div className={styles.star} />
                      <div className={`${styles.objectLabel} flex flex-col items-center gap-1 ${isCompleted ? 'text-white drop-shadow-[0_0_10px_var(--color-white)]' : ''}`}>
                        <span>{node.title}</span>
                        <span className="text-[10px] font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 border border-white/20 rounded">[{Math.round(node.x)}, {Math.round(node.y)}]</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

        </div>
      </div>

      {/* Zoom HUD */}
      <div className="absolute bottom-6 right-6 font-mono text-[10px] flex flex-col items-end gap-2 pointer-events-none z-[1000]">
        <div className="relative bg-black/80 border border-white/30 px-4 py-2 flex flex-col items-end backdrop-blur-sm">
          <CyberBrackets color="border-white/30" />
          <div className="flex items-center gap-3 text-white mb-1">
            <span className="tracking-widest opacity-60">SYS_ZOOM</span>
            <span ref={hudScaleRef} className="font-bold text-sm">0.20x</span>
          </div>
          <div className="w-full h-[1px] bg-white/20 mb-2" />
          <div className="flex items-center gap-2">
            <div className="text-[8px] text-text-dim tracking-widest uppercase">Target_Lock</div>
            <div ref={hudTargetRef} className="text-white font-bold">0, 0</div>
          </div>
        </div>

        <button
          className="pointer-events-auto bg-black/80 border border-panel-border hover:border-white/50 px-4 py-2 hover:bg-white/5 transition-all duration-300 cursor-pointer uppercase tracking-widest relative group overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            flyTo(5000, 5000, 0.2);
          }}
        >
          <CyberBrackets color="border-white/30 group-hover:border-white transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-white)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <span className="relative z-10 flex items-center gap-2 font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-white)] group-hover:text-white transition-all duration-300">
            <div className="w-1.5 h-1.5 bg-white shadow-[0_0_8px_var(--color-white)] animate-pulse transition-colors duration-300" />
            RECENTER_MAP
          </span>
        </button>
        {!hideSaveButton && (
          <button
            className="pointer-events-auto bg-black/80 border border-panel-border hover:border-white px-4 py-2 hover:bg-white/10 transition-all duration-300 cursor-pointer uppercase tracking-widest relative group overflow-hidden mt-2 flex items-center justify-center w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveMap();
            }}
          >
            <CyberBrackets color="border-white/30 group-hover:border-white transition-colors duration-300" />
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 font-bold text-white transition-all duration-300">
              <Save className="w-4 h-4" /> {isSaving ? "SAVING..." : "SAVE MAP"}
            </span>
          </button>
        )}
      </div>
    </div>
    </div>
    </div>
  );
}
