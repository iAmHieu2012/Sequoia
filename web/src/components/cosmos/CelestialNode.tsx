"use client";

import React from 'react';
import styles from './CosmosMap.module.css';

interface CelestialNodeProps {
    articleId: string;
    title: string;
    x: number;
    y: number;
    state: string;
    type?: string;
    summary?: string;
    chapter?: string;
}

/**
 * CelestialNode Component
 * Represents a single article/node on the Cosmos Map.
 */
export default function CelestialNode({ 
    articleId, 
    title, 
    x, 
    y, 
    state, 
    type = 'star', 
    summary = '', 
    chapter = 'Unknown Sector' 
}: CelestialNodeProps) {
    // Determine the state class
    const stateClass = state === 'decoded' ? styles.decoded :
                       state === 'decoding' ? styles.decoding :
                       state === 'anomaly' ? styles.anomaly :
                       styles.hiddenNode;

    const getStatusText = () => {
        if (state === 'decoded') return "SIGNAL DECODED";
        if (state === 'decoding') return "TUNING SIGNAL...";
        if (state === 'anomaly') return "ANOMALY DETECTED";
        return "UNKNOWN SIGNAL";
    };

    return (
        <div 
            className={`${styles.celestialObject} ${stateClass}`} 
            style={{ left: `${x}px`, top: `${y}px` }}
        >
            <div className={styles.star}></div>
            <div className={styles.objectLabel}>{title}</div>
            
            {/* Observation Log Hover Panel */}
            <div className={styles.observationLog}>
                <div className={styles.logHeader}>
                    <span>Log #{articleId}</span>
                    <span>{chapter}</span>
                </div>
                <div className={styles.logTitle}>{title}</div>
                <div className={styles.logDesc}>
                    {summary || "A mysterious signal originating from deep space. Further observation required to decode its meaning."}
                </div>
                <div className={styles.signalStatus}>
                    {state === 'decoding' ? (
                        <>
                            <span>{getStatusText()}</span>
                            <div className={styles.signalWave}></div>
                        </>
                    ) : (
                        <span>{getStatusText()}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
