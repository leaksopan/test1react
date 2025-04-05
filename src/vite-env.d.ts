/// <reference types="vite/client" />

declare module 'react-force-graph' {
  import React from 'react';
  
  interface GraphData {
    nodes: any[];
    links: any[];
  }
  
  interface ForceGraphProps {
    graphData: GraphData;
    nodeLabel?: string | ((node: any) => string);
    nodeColor?: string | ((node: any) => string);
    linkWidth?: number | ((link: any) => number);
    linkColor?: string | ((link: any) => string);
    nodeRelSize?: number;
    onNodeClick?: (node: any) => void;
    enableNodeDrag?: boolean;
    width?: number;
    height?: number;
    cooldownTicks?: number;
    cooldownTime?: number;
    [key: string]: any;
  }
  
  interface ForceGraph3DProps extends ForceGraphProps {
    enableNavigationControls?: boolean;
    showNavInfo?: boolean;
  }
  
  interface ForceGraph2DProps extends ForceGraphProps {
    enableZoomPanInteraction?: boolean;
  }
  
  const ForceGraph3D: React.FC<ForceGraph3DProps>;
  const ForceGraph2D: React.FC<ForceGraph2DProps>;
  
  export { ForceGraph2D, ForceGraph3D };
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import * as THREE from 'three';
  
  export class OrbitControls {
    constructor(camera: THREE.Camera, domElement: HTMLElement);
    
    enableDamping: boolean;
    dampingFactor: number;
    screenSpacePanning: boolean;
    maxDistance: number;
    minDistance: number;
    
    update(): void;
    dispose(): void;
  }
}
