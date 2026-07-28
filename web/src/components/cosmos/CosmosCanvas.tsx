"use client";

import React, { useRef, useState, useEffect } from 'react';
import styles from './CosmosMap.module.css';
import CelestialNode from './CelestialNode';

interface CosmosNode {
    articleId: string;
    title: string;
    celestialType: string;
    x: number;
    y: number;
    connections: string[];
}

interface MapData {
    nodes?: CosmosNode[];
}

interface ProgressData {
    progressMap?: Record<string, string>;
}

interface CosmosCanvasProps {
    mapData: MapData;
    progressData: ProgressData;
}

/**
 * CosmosCanvas Component
 * Implements the infinite panning/zooming canvas for the Galaxy Map.
 */
export default function CosmosCanvas({ mapData, progressData }: CosmosCanvasProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    
    const [scale, setScale] = useState(0.5);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Center on cluster 1 initially
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const initialScale = 0.5;
            setScale(initialScale);
            setTranslateX((window.innerWidth / 2) - (5000 * initialScale));
            setTranslateY((window.innerHeight / 2) - (5000 * initialScale));
        }
    }, []);

    const updateLabelOpacity = (currentScale: number) => {
        if (typeof document !== 'undefined') {
            if (currentScale < 0.3) {
                document.documentElement.style.setProperty('--label-opacity', '0');
            } else {
                document.documentElement.style.setProperty('--label-opacity', '1');
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as Element).closest(`.${styles.uiLayer}`) || (e.target as Element).closest(`.${styles.celestialObject}`)) return;
        setIsDragging(true);
        setStartPos({ x: e.clientX - translateX, y: e.clientY - translateY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setTranslateX(e.clientX - startPos.x);
        setTranslateY(e.clientY - startPos.y);
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY * 0.002;
        let newScale = scale * Math.exp(delta);
        newScale = Math.max(0.05, Math.min(newScale, 2));

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const newTranslateX = mouseX - (mouseX - translateX) * (newScale / scale);
        const newTranslateY = mouseY - (mouseY - translateY) * (newScale / scale);
        
        setScale(newScale);
        setTranslateX(newTranslateX);
        setTranslateY(newTranslateY);
        updateLabelOpacity(newScale);
    };

    // Attach passive: false event listener for wheel
    useEffect(() => {
        const viewport = viewportRef.current;
        if (viewport) {
            viewport.addEventListener('wheel', handleWheel, { passive: false });
            return () => viewport.removeEventListener('wheel', handleWheel);
        }
    }, [scale, translateX, translateY]);

    const flyTo = (x: number, y: number) => {
        const targetScale = 0.6;
        const targetX = (window.innerWidth / 2) - (x * targetScale);
        const targetY = (window.innerHeight / 2) - (y * targetScale);
        
        setScale(targetScale);
        setTranslateX(targetX);
        setTranslateY(targetY);
        updateLabelOpacity(targetScale);
    };

    // Calculate center coordinates
    const centerX = typeof window !== 'undefined' ? Math.round(((window.innerWidth / 2) - translateX) / scale) : 5000;
    const centerY = typeof window !== 'undefined' ? Math.round(((window.innerHeight / 2) - translateY) / scale) : 5000;

    return (
        <div className={styles.universeWrapper}>
            {/* UI Overlay */}
            <div className={styles.uiLayer}>
                <header className={styles.header}>
                    <div className={styles.brand}>
                        <h1>SEQUOIA</h1>
                        <div className={styles.subtitle}>The Neural Cosmos</div>
                    </div>
                </header>

                <div className={styles.searchContainer}>
                    <input type="text" className={styles.searchBox} placeholder="Search constellations, algorithms..." />
                </div>

                <div className={styles.navigationSidebar}>
                    <div className={styles.navHeader}>Galaxy Navigation</div>
                    <div className={styles.navItem} onClick={() => flyTo(5000, 5000)}>
                        <div className={styles.navTitle}>Ch. 1: Foundation Sector</div>
                        <div className={styles.navDesc}>Basic paradigms of learning.</div>
                    </div>
                    <div className={styles.navItem} onClick={() => flyTo(7500, 2500)}>
                        <div className={styles.navTitle}>Ch. 2: Deep Neural Expanse</div>
                        <div className={styles.navDesc}>Advanced multi-layered architectures.</div>
                    </div>
                    <div className={styles.navItem} onClick={() => flyTo(3000, 7500)}>
                        <div className={styles.navTitle}>Ch. 3: Visual Cortex</div>
                        <div className={styles.navDesc}>Image processing and CNNs.</div>
                    </div>
                </div>

                <div className={styles.zoomHud}>
                    <div>X: {centerX}, Y: {centerY}</div>
                    <div>ZOOM: {scale.toFixed(2)}x</div>
                    <button className={styles.btnReset} onClick={() => flyTo(5000, 5000)}>RECENTER</button>
                </div>
            </div>

            {/* Viewport & Canvas */}
            <div 
                ref={viewportRef}
                className={styles.viewport}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div 
                    ref={canvasRef}
                    className={styles.mapCanvas}
                    style={{
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    <div className={styles.fogOfWar}></div>
                    
                    <div className={styles.contentLayer}>
                        {/* Region Titles */}
                        <div className={styles.regionTitle} style={{ top: '4000px', left: '4000px', transform: 'rotate(-5deg)' }}>Foundation Sector</div>
                        <div className={styles.regionTitle} style={{ top: '2000px', left: '7000px', transform: 'rotate(10deg)' }}>Deep Neural Expanse</div>
                        <div className={styles.regionTitle} style={{ top: '7000px', left: '2000px', transform: 'rotate(-15deg)' }}>Visual Cortex</div>

                        {/* Beams connecting nodes */}
                        <svg className={styles.lightBeams}>
                            {mapData?.nodes?.flatMap(node => 
                                node.connections.map(targetId => {
                                    const targetNode = mapData.nodes?.find(n => n.articleId === targetId);
                                    if (!targetNode) return null;
                                    
                                    const sourceState = progressData?.progressMap?.[node.articleId] || 'locked';
                                    const targetState = progressData?.progressMap?.[targetId] || 'locked';
                                    
                                    let beamClass = styles.beam;
                                    if (sourceState === 'decoded' && targetState === 'decoded') {
                                        beamClass = `${styles.beam} ${styles.beamIlluminated}`;
                                    } else if (sourceState === 'decoded' && targetState === 'decoding') {
                                        beamClass = `${styles.beam} ${styles.beamDecoding}`;
                                    }

                                    return (
                                        <line 
                                            key={`${node.articleId}-${targetId}`}
                                            x1={node.x} y1={node.y} 
                                            x2={targetNode.x} y2={targetNode.y} 
                                            className={beamClass}
                                        />
                                    );
                                })
                            )}
                        </svg>

                        {/* Render Nodes */}
                        {mapData?.nodes?.map(node => (
                            <CelestialNode 
                                key={node.articleId}
                                articleId={node.articleId}
                                title={node.title}
                                x={node.x}
                                y={node.y}
                                type={node.celestialType}
                                state={progressData?.progressMap?.[node.articleId] || 'locked'}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
