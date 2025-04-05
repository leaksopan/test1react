import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { MapPin, MapPinOff, Link as LinkIcon, ExternalLink } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { ForceGraph2D } from 'react-force-graph';

// Fix for default marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Bali points of interest
const initialPoints = [
  {
    name: 'Ubud',
    position: [-8.5069, 115.2624] as [number, number],
    description: 'Cultural heart of Bali, known for traditional crafts, dance and temples',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    link: 'https://www.indonesia.travel/gb/en/destinations/bali-nusa-tenggara/bali/ubud'
  },
  {
    name: 'Kuta Beach',
    position: [-8.7185, 115.1686] as [number, number],
    description: 'Famous beach known for surfing, shopping, and nightlife',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    link: 'https://www.indonesia.travel/gb/en/destinations/bali-nusa-tenggara/bali/kuta'
  },
  {
    name: 'Tanah Lot',
    position: [-8.6216, 115.0868] as [number, number],
    description: 'Ancient Hindu temple set on a rock formation in the sea',
    image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=800&q=80',
    link: 'https://www.indonesia.travel/gb/en/destinations/bali-nusa-tenggara/bali/tanah-lot'
  }
];

interface Point {
  name: string;
  position: [number, number];
  description: string;
  image?: string;
  link?: string;
}

// Tipe untuk node dan link
interface HospitalNode {
  id: string;
  name: string;
  group: number;
}

// Network Graph data untuk rumah sakit
const hospitalData = {
  nodes: [
    { id: 'RS BUNDA', name: 'RS BUNDA', group: 1 },
    { id: 'RSCM', name: 'RSCM', group: 1 },
    { id: 'RS UNUD', name: 'RS UNUD', group: 2 },
    { id: 'RSUP SANGLAH', name: 'RSUP SANGLAH', group: 2 },
    { id: 'RS SILOAM', name: 'RS SILOAM', group: 3 },
    { id: 'RS BALI MED', name: 'RS BALI MED', group: 3 },
    { id: 'RS KASIH IBU', name: 'RS KASIH IBU', group: 4 },
    { id: 'RS BHAKTI RAHAYU', name: 'RS BHAKTI RAHAYU', group: 4 },
    { id: 'RS WANGAYA', name: 'RS WANGAYA', group: 5 },
    { id: 'RS PRIMA MEDIKA', name: 'RS PRIMA MEDIKA', group: 5 },
    { id: 'RS SURYA HUSADA', name: 'RS SURYA HUSADA', group: 6 },
    { id: 'RS DHARMA YADNYA', name: 'RS DHARMA YADNYA', group: 6 },
    // Tambahan 38 rumah sakit baru (total 50)
    { id: 'RS SEJAHTERA', name: 'RS SEJAHTERA', group: 1 },
    { id: 'RS HARMONI', name: 'RS HARMONI', group: 2 },
    { id: 'RS BALI INDAH', name: 'RS BALI INDAH', group: 3 },
    { id: 'RS SENTOSA', name: 'RS SENTOSA', group: 4 },
    { id: 'RS MITRA SEHAT', name: 'RS MITRA SEHAT', group: 5 },
    { id: 'RS CAHAYA', name: 'RS CAHAYA', group: 6 },
    { id: 'RS ASIH MEDIKA', name: 'RS ASIH MEDIKA', group: 1 },
    { id: 'RS PRATAMA', name: 'RS PRATAMA', group: 2 },
    { id: 'RS BUANA', name: 'RS BUANA', group: 3 },
    { id: 'RS HARAPAN', name: 'RS HARAPAN', group: 4 },
    { id: 'RS MULIA', name: 'RS MULIA', group: 5 },
    { id: 'RS PELITA', name: 'RS PELITA', group: 6 },
    { id: 'RS KUTA', name: 'RS KUTA', group: 1 },
    { id: 'RS DENPASAR', name: 'RS DENPASAR', group: 2 },
    { id: 'RS SINGARAJA', name: 'RS SINGARAJA', group: 3 },
    { id: 'RS TABANAN', name: 'RS TABANAN', group: 4 },
    { id: 'RS GIANYAR', name: 'RS GIANYAR', group: 5 },
    { id: 'RS KARANGASEM', name: 'RS KARANGASEM', group: 6 },
    { id: 'RS BANGLI', name: 'RS BANGLI', group: 1 },
    { id: 'RS KLUNGKUNG', name: 'RS KLUNGKUNG', group: 2 },
    { id: 'RS JEMBRANA', name: 'RS JEMBRANA', group: 3 },
    { id: 'RS BULELENG', name: 'RS BULELENG', group: 4 },
    { id: 'RS BADUNG', name: 'RS BADUNG', group: 5 },
    { id: 'RS UBUD', name: 'RS UBUD', group: 6 },
    { id: 'RS SEMINYAK', name: 'RS SEMINYAK', group: 1 },
    { id: 'RS LEGIAN', name: 'RS LEGIAN', group: 2 },
    { id: 'RS CANGGU', name: 'RS CANGGU', group: 3 },
    { id: 'RS NUSA DUA', name: 'RS NUSA DUA', group: 4 },
    { id: 'RS JIMBARAN', name: 'RS JIMBARAN', group: 5 },
    { id: 'RS ULUWATU', name: 'RS ULUWATU', group: 6 },
    { id: 'RS SANUR', name: 'RS SANUR', group: 1 },
    { id: 'RS TANJUNG BENOA', name: 'RS TANJUNG BENOA', group: 2 },
    { id: 'RS LOVINA', name: 'RS LOVINA', group: 3 },
    { id: 'RS BEDUGUL', name: 'RS BEDUGUL', group: 4 },
    { id: 'RS KINTAMANI', name: 'RS KINTAMANI', group: 5 },
    { id: 'RS MUNDUK', name: 'RS MUNDUK', group: 6 },
    { id: 'RS MENJANGAN', name: 'RS MENJANGAN', group: 1 },
    { id: 'RS PEMUTERAN', name: 'RS PEMUTERAN', group: 2 },
    { id: 'RS NEGARA', name: 'RS NEGARA', group: 3 },
    { id: 'RS MELAYA', name: 'RS MELAYA', group: 4 },
    { id: 'RS GILIMANUK', name: 'RS GILIMANUK', group: 5 },
    { id: 'RS AMED', name: 'RS AMED', group: 6 },
    { id: 'RS PADANG BAI', name: 'RS PADANG BAI', group: 1 },
    { id: 'RS CANDIDASA', name: 'RS CANDIDASA', group: 2 },
  ],
  links: [
    { source: 'RS BUNDA', target: 'RSCM' },
    { source: 'RS BUNDA', target: 'RS UNUD' },
    { source: 'RSCM', target: 'RSUP SANGLAH' },
    { source: 'RS UNUD', target: 'RSUP SANGLAH' },
    { source: 'RSUP SANGLAH', target: 'RS SILOAM' },
    { source: 'RS SILOAM', target: 'RS BALI MED' },
    { source: 'RS BALI MED', target: 'RS KASIH IBU' },
    { source: 'RS KASIH IBU', target: 'RS BHAKTI RAHAYU' },
    { source: 'RS BHAKTI RAHAYU', target: 'RS WANGAYA' },
    { source: 'RS WANGAYA', target: 'RS PRIMA MEDIKA' },
    { source: 'RS PRIMA MEDIKA', target: 'RS SURYA HUSADA' },
    { source: 'RS SURYA HUSADA', target: 'RS DHARMA YADNYA' },
    { source: 'RS DHARMA YADNYA', target: 'RS BUNDA' },
    { source: 'RS UNUD', target: 'RS BALI MED' },
    { source: 'RSCM', target: 'RS KASIH IBU' },
    { source: 'RS SILOAM', target: 'RS WANGAYA' },
    { source: 'RS KASIH IBU', target: 'RS SURYA HUSADA' },
    { source: 'RS WANGAYA', target: 'RS BUNDA' },
    // Tambahkan koneksi untuk rumah sakit baru
    { source: 'RS SEJAHTERA', target: 'RS HARMONI' },
    { source: 'RS HARMONI', target: 'RS BALI INDAH' },
    { source: 'RS BALI INDAH', target: 'RS SENTOSA' },
    { source: 'RS SENTOSA', target: 'RS MITRA SEHAT' },
    { source: 'RS MITRA SEHAT', target: 'RS CAHAYA' },
    { source: 'RS CAHAYA', target: 'RS ASIH MEDIKA' },
    { source: 'RS ASIH MEDIKA', target: 'RS PRATAMA' },
    { source: 'RS PRATAMA', target: 'RS BUANA' },
    { source: 'RS BUANA', target: 'RS HARAPAN' },
    { source: 'RS HARAPAN', target: 'RS MULIA' },
    { source: 'RS MULIA', target: 'RS PELITA' },
    { source: 'RS PELITA', target: 'RS KUTA' },
    { source: 'RS KUTA', target: 'RS DENPASAR' },
    { source: 'RS DENPASAR', target: 'RS SINGARAJA' },
    { source: 'RS SINGARAJA', target: 'RS TABANAN' },
    { source: 'RS TABANAN', target: 'RS GIANYAR' },
    { source: 'RS GIANYAR', target: 'RS KARANGASEM' },
    { source: 'RS KARANGASEM', target: 'RS BANGLI' },
    { source: 'RS BANGLI', target: 'RS KLUNGKUNG' },
    { source: 'RS KLUNGKUNG', target: 'RS JEMBRANA' },
    { source: 'RS JEMBRANA', target: 'RS BULELENG' },
    { source: 'RS BULELENG', target: 'RS BADUNG' },
    { source: 'RS BADUNG', target: 'RS UBUD' },
    { source: 'RS UBUD', target: 'RS SEMINYAK' },
    { source: 'RS SEMINYAK', target: 'RS LEGIAN' },
    { source: 'RS LEGIAN', target: 'RS CANGGU' },
    { source: 'RS CANGGU', target: 'RS NUSA DUA' },
    { source: 'RS NUSA DUA', target: 'RS JIMBARAN' },
    { source: 'RS JIMBARAN', target: 'RS ULUWATU' },
    { source: 'RS ULUWATU', target: 'RS SANUR' },
    // Koneksi silang untuk membuat jaringan lebih kaya
    { source: 'RS BUNDA', target: 'RS SEJAHTERA' },
    { source: 'RSCM', target: 'RS HARMONI' },
    { source: 'RS UNUD', target: 'RS BALI INDAH' },
    { source: 'RSUP SANGLAH', target: 'RS SENTOSA' },
    { source: 'RS SILOAM', target: 'RS MITRA SEHAT' },
    { source: 'RS BALI MED', target: 'RS CAHAYA' },
    { source: 'RS KASIH IBU', target: 'RS ASIH MEDIKA' },
    { source: 'RS BHAKTI RAHAYU', target: 'RS PRATAMA' },
    { source: 'RS WANGAYA', target: 'RS BUANA' },
    { source: 'RS PRIMA MEDIKA', target: 'RS HARAPAN' },
    { source: 'RS SURYA HUSADA', target: 'RS MULIA' },
    { source: 'RS DHARMA YADNYA', target: 'RS PELITA' },
    { source: 'RS KUTA', target: 'RS SANUR' },
    { source: 'RS DENPASAR', target: 'RS TANJUNG BENOA' },
    { source: 'RS SINGARAJA', target: 'RS LOVINA' },
    { source: 'RS TABANAN', target: 'RS BEDUGUL' },
    { source: 'RS GIANYAR', target: 'RS KINTAMANI' },
    { source: 'RS KARANGASEM', target: 'RS MUNDUK' },
    { source: 'RS BANGLI', target: 'RS MENJANGAN' },
    { source: 'RS KLUNGKUNG', target: 'RS PEMUTERAN' },
    { source: 'RS JEMBRANA', target: 'RS NEGARA' },
    { source: 'RS BULELENG', target: 'RS MELAYA' },
    { source: 'RS BADUNG', target: 'RS GILIMANUK' },
    { source: 'RS UBUD', target: 'RS AMED' },
    { source: 'RS SEMINYAK', target: 'RS PADANG BAI' },
    { source: 'RS LEGIAN', target: 'RS CANDIDASA' },
  ]
};

// Fungsi throttle untuk mengoptimalkan event handlers
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func(...args);
    }
  };
}

function AddMarkerControl({ isAddingMarker, onClick }: { isAddingMarker: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-4 right-4 z-[1000] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
        isAddingMarker 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      {isAddingMarker ? (
        <>
          <MapPinOff size={20} /> Cancel
        </>
      ) : (
        <>
          <MapPin size={20} /> Add Marker
        </>
      )}
    </button>
  );
}

function MapEvents({ isAddingMarker, onMapClick }: { isAddingMarker: boolean; onMapClick: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      if (isAddingMarker) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

function NetworkGraph() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<HospitalNode | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeObjectsRef = useRef<Record<string, THREE.Mesh>>({});
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(10, 12, 12), []);

  useEffect(() => {
    if (!chartRef.current) return;

    // Bersihkan sebelum render
    if (rendererRef.current && chartRef.current.contains(rendererRef.current.domElement)) {
      chartRef.current.removeChild(rendererRef.current.domElement);
    }

    // Ukuran container
    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;

    // Manajemen performa
    let frameSkipCounter = 0;
    const frameSkipThreshold = 2; // Render setiap 3 frame untuk performa
    let lastFrameTime = 0;
    let fpsLimit = 30; // Batasi ke 30 FPS untuk performa
    let isUserInteracting = false;
    let lastRenderTime = 0;
    let animationFrame: number | null = null; // Deklarasi animationFrame

    // Setup Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 200;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true // Membantu dengan masalah Z-fighting pada hardware terbatas
    });
    renderer.setSize(width, height);
    // Batasi pixel ratio untuk meningkatkan performa
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    chartRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls untuk interaksi
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxDistance = 500;
    controls.minDistance = 50;
    
    // Casting untuk akses properti yang tidak ada di tipe
    const orbitControlsAny = controls as any;
    orbitControlsAny.rotateSpeed = 0.75;
    orbitControlsAny.zoomSpeed = 0.8;
    
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 200, 200);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Posisi node dalam ruang 3D
    const nodePositions: Record<string, THREE.Vector3> = {};
    const nodeObjects: Record<string, THREE.Mesh> = {};
    
    // Buat posisi node dalam formasi bola 3D
    hospitalData.nodes.forEach((node, i) => {
      // Buat angka phi dan theta untuk posisi di permukaan bola
      const phi = Math.acos(-1 + (2 * i) / hospitalData.nodes.length);
      const theta = Math.sqrt(hospitalData.nodes.length * Math.PI) * phi;
      
      // Konversi ke posisi kartesian
      const radius = 80;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      nodePositions[node.id] = new THREE.Vector3(x, y, z);
    });
    
    // Buat material untuk node berdasarkan grup
    const getNodeMaterial = (group: number) => {
      const colors = [
        0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 0x8c564b
      ];
      // Material untuk performa optimal
      const material = new THREE.MeshBasicMaterial({ 
        color: colors[(group - 1) % colors.length],
      });
      
      // Optimalkan material - gunakan type assertion untuk properti flatShading
      material.side = THREE.FrontSide; // Render hanya bagian depan untuk performa
      (material as any).flatShading = true; // Type casting untuk menghindari error TypeScript
      
      return material;
    };
    
    // Buat mesh untuk node dengan geometri yang dibuat dari useMemo di luar useEffect
    hospitalData.nodes.forEach(node => {
      const position = nodePositions[node.id];
      const material = getNodeMaterial(node.group);
      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.position.copy(position);
      mesh.userData = { id: node.id, node };
      
      scene.add(mesh);
      nodeObjects[node.id] = mesh;
      
      // Tambahkan label teks (menggunakan sprite)
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 512;
        canvas.height = 512;
        
        // Hapus background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'destination-out';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';
        
        // Atur font
        context.font = 'Bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const centerX = 256;
        const centerY = 256;
        
        // Tambahkan outline luar putih tebal
        context.strokeStyle = 'white';
        context.lineWidth = 10;
        context.strokeText(node.name, centerX, centerY);
        
        // Tambahkan outline dalam merah
        context.strokeStyle = '#ff0000';
        context.lineWidth = 5;
        context.strokeText(node.name, centerX, centerY);
        
        // Tambahkan bayangan
        context.shadowColor = 'rgba(0, 0, 0, 0.7)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        
        // Isi teks dengan warna hitam
        context.fillStyle = '#000000';
        context.fillText(node.name, centerX, centerY);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Hitung posisi label berdasarkan posisi node
        const directionVector = position.clone().normalize();
        const labelOffset = 25; // Jarak label dari node
        
        // Perhitungan posisi label yang lebih dinamis berdasarkan posisi node
        if (position.y < -30) {
          // Node di bawah, label dibawah
          sprite.position.copy(position);
          sprite.position.y -= labelOffset;
        } else if (position.y > 30) {
          // Node di atas, label di atas
          sprite.position.copy(position);
          sprite.position.y += labelOffset;
        } else if (position.x < -30) {
          // Node di kiri, label di kiri
          sprite.position.copy(position);
          sprite.position.x -= labelOffset;
        } else if (position.x > 30) {
          // Node di kanan, label di kanan
          sprite.position.copy(position);
          sprite.position.x += labelOffset;
        } else if (position.z < -30) {
          // Node di belakang, sedikit ke atas
          sprite.position.copy(position);
          sprite.position.y += labelOffset;
          sprite.position.z -= 5;
        } else if (position.z > 30) {
          // Node di depan, sedikit ke atas
          sprite.position.copy(position);
          sprite.position.y += labelOffset;
          sprite.position.z += 5;
        } else {
          // Node di tengah, label di atas
          sprite.position.copy(position);
          sprite.position.y += labelOffset;
        }
        
        // Menambahkan sedikit variasi acak untuk menghindari tumpang tindih label
        sprite.position.x += (Math.random() - 0.5) * 5;
        sprite.position.y += (Math.random() - 0.5) * 5;
        sprite.position.z += (Math.random() - 0.5) * 5;
        
        // Perbesar ukuran label untuk node yang berada di belakang
        const distanceFromCamera = position.distanceTo(camera.position);
        const scaleMultiplier = Math.max(0.8, Math.min(1.2, distanceFromCamera / 200));
        sprite.scale.set(45 * scaleMultiplier, 22 * scaleMultiplier, 1);
        
        scene.add(sprite);
      }
    });
    
    // Simpan referensi ke objek node
    nodeObjectsRef.current = nodeObjects;
    
    // Simpan referensi untuk animasi
    const glowMeshes: THREE.Mesh[] = [];
    const nodeMeshes: THREE.Mesh[] = [];
    
    // Buat edges dengan kurva
    hospitalData.links.forEach(link => {
      const sourcePos = nodePositions[link.source];
      const targetPos = nodePositions[link.target];
      
      if (sourcePos && targetPos) {
        // Buat kurva untuk garis
        const midPoint = new THREE.Vector3().addVectors(sourcePos, targetPos).multiplyScalar(0.5);
        // Geser titik tengah sedikit untuk membuat kurva
        const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
        const perpendicular = new THREE.Vector3(-direction.y, direction.x, direction.z).normalize().multiplyScalar(10);
        midPoint.add(perpendicular);
        
        const curve = new THREE.QuadraticBezierCurve3(
          sourcePos,
          midPoint,
          targetPos
        );
        
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
          color: 0x999999, 
          opacity: 0.6, 
          transparent: true,
          linewidth: 1
        });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }
    });
    
    // Raycaster dengan throttling untuk performa yang lebih baik
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Simpan referensi node yang dipilih
    let selectedObjectRef: THREE.Mesh | null = null;
    
    const throttledRaycaster = throttle((event: MouseEvent) => {
      if (!chartRef.current || !cameraRef.current || !sceneRef.current) return;
      if (isUserInteracting) return; // Skip raycasting saat interaksi untuk performa
      
      // Normalisasi posisi mouse
      const rect = chartRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
      
      // Raycasting
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(Object.values(nodeObjects));
      
      // Update cursor jika ada interseksi
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = 'default';
      }
    }, 100); // Throttle ke 100ms untuk performa lebih baik
    
    // Event listener untuk hover dengan throttling
    renderer.domElement.addEventListener('mousemove', throttledRaycaster);
    
    // Event listener untuk klik
    const onMouseClick = (event: MouseEvent) => {
      if (!chartRef.current || !cameraRef.current || !sceneRef.current) return;
      
      // Normalisasi posisi mouse
      const rect = chartRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
      
      // Raycasting
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(Object.values(nodeObjects));
      
      if (intersects.length > 0) {
        const newSelectedObject = intersects[0].object as THREE.Mesh;
        const nodeData = newSelectedObject.userData.node as HospitalNode;
        
        // Reset semua node
        Object.values(nodeObjects).forEach(obj => {
          // Ganti penggunaan emissive dengan warna dasar
          const baseMaterial = ((obj as THREE.Mesh).material as THREE.MeshBasicMaterial);
          // Simpan warna asli
          const originalColor = (baseMaterial.color as THREE.Color).clone();
          baseMaterial.color.copy(originalColor);
          
          // Kembalikan ukuran normal
          (obj as THREE.Mesh).scale.set(1, 1, 1);
        });
        
        // Jika node yang sama diklik lagi, hapus seleksi
        if (selectedObjectRef === newSelectedObject) {
          selectedObjectRef = null;
          setSelectedNode(null);
          return;
        }
        
        // Set node yang dipilih
        selectedObjectRef = newSelectedObject;
        setSelectedNode(nodeData);
        
        // Highlight node yang dipilih dengan warna terang
        const baseMaterial = ((newSelectedObject as THREE.Mesh).material as THREE.MeshBasicMaterial);
        baseMaterial.color.set(0xff5500);
        
        // Perbesar node yang dipilih
        newSelectedObject.scale.set(1.3, 1.3, 1.3);
        
        // Fokuskan kamera ke node yang dipilih
        const targetPosition = newSelectedObject.position.clone();
        // Ganti GSAP dengan animasi manual
        const startPosition = cameraRef.current.position.clone();
        const endPosition = new THREE.Vector3(
          targetPosition.x * 2,
          targetPosition.y * 2,
          targetPosition.z * 2
        );
        let startTime: number | null = null;
        const duration = 1000; // ms

        const animateCamera = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Fungsi easing untuk animasi yang lebih halus
          const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
          const easedProgress = easeOutCubic(progress);
          
          // Interpolasi posisi kamera
          cameraRef.current?.position.lerpVectors(startPosition, endPosition, easedProgress);
          cameraRef.current?.lookAt(targetPosition);
          
          // Lanjutkan animasi jika belum selesai
          if (progress < 1) {
            animationFrame = requestAnimationFrame(animateCamera);
          }
        };

        animationFrame = requestAnimationFrame(animateCamera);
      }
    };
    
    // Tambahkan event listener
    renderer.domElement.addEventListener('click', onMouseClick);
    
    // Simpan status rotasi otomatis
    let autoRotate = true;

    // Fungsi untuk menangani event
    const onControlsStart = () => {
      autoRotate = false;
      isUserInteracting = true;
      // Tingkatkan FPS saat interaksi untuk responsivitas
      fpsLimit = 60;
    };

    const onControlsEnd = () => {
      isUserInteracting = false;
      // Mulai kembali rotasi otomatis setelah beberapa saat
      setTimeout(() => {
        if (!isUserInteracting) {
          autoRotate = true;
        }
      }, 2000);
    };

    // Pasang event listener pada renderer.domElement, bukan controls.domElement
    renderer.domElement.addEventListener('mousedown', onControlsStart);
    renderer.domElement.addEventListener('touchstart', onControlsStart);
    document.addEventListener('mouseup', onControlsEnd);
    document.addEventListener('touchend', onControlsEnd);

    // Modifikasi fungsi animate untuk menggunakan sistem frameskip dan fps limiting
    const animate = (timestamp: number) => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Batasi FPS
      if (timestamp - lastRenderTime < 1000 / fpsLimit) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      
      lastRenderTime = timestamp;
      
      // Rotasi hanya jika autoRotate aktif
      if (autoRotate && !isUserInteracting) {
        sceneRef.current.rotation.y += 0.0005;
      }
      
      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Frame skipping untuk performa di perangkat lemah
      // Jika user berinteraksi, render setiap frame
      // Jika tidak, skip beberapa frame untuk mempertahankan performa
      if (isUserInteracting || frameSkipCounter >= frameSkipThreshold) {
        // Render scene
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        frameSkipCounter = 0;
      } else {
        frameSkipCounter++;
      }
      
      // Kurangi jumlah frame saat tidak ada interaksi
      if (!isUserInteracting && fpsLimit !== 30) {
        fpsLimit = 30;
      }
      
      // Request animasi berikutnya
      animationFrame = requestAnimationFrame(animate);
    };
    
    // Mulai animasi
    lastFrameTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('mousemove', throttledRaycaster);
      // Hapus event listeners
      renderer.domElement.removeEventListener('mousedown', onControlsStart);
      renderer.domElement.removeEventListener('touchstart', onControlsStart);
      document.removeEventListener('mouseup', onControlsEnd);
      document.removeEventListener('touchend', onControlsEnd);
      if (chartRef.current && renderer.domElement) {
        chartRef.current.removeChild(renderer.domElement);
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      renderer.dispose();
      // Bebaskan memori dengan menghapus objek yang tidak digunakan
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, []);

  return (
    <>
      <div className="mt-8 mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Jaringan Rumah Sakit</h2>
        <p className="text-gray-600">Visualisasi 3D jaringan rumah sakit, klik pada node untuk melihat detail</p>
        <p className="text-gray-500 text-sm">Drag untuk memutar, scroll untuk zoom, klik node untuk detail</p>
      </div>
      <div ref={chartRef} className="h-[500px] rounded-lg overflow-hidden shadow-lg bg-gray-50"></div>
      {selectedNode && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <h3 className="font-bold text-2xl mb-2">{selectedNode.name}</h3>
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-medium text-gray-700">Kategori:</span> 
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Grup {selectedNode.group}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Alamat:</span>
              <p className="text-gray-600 mt-1">Jl. Rumah Sakit No. {Math.floor(Math.random() * 100) + 1}, Bali</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Spesialisasi:</span>
              <p className="text-gray-600 mt-1">
                {selectedNode.group === 1 && "Bedah Umum, Penyakit Dalam"}
                {selectedNode.group === 2 && "Anak, Kandungan"}
                {selectedNode.group === 3 && "Jantung, Saraf"}
                {selectedNode.group === 4 && "THT, Mata"}
                {selectedNode.group === 5 && "Gigi, Kulit"}
                {selectedNode.group === 6 && "Orthopedi, Urologi"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Kerjasama:</span>
              <p className="text-gray-600 mt-1">
                Terhubung dengan {hospitalData.links.filter(link => 
                  link.source === selectedNode.id || link.target === selectedNode.id
                ).length} rumah sakit lainnya
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedNode(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md text-sm font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      )}
    </>
  );
}

function App() {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState<{ position: [number, number]; name: string; description: string; image?: string; link?: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleMapClick = useCallback((position: [number, number]) => {
    setNewMarkerData({ position, name: '', description: '' });
    setIsAddingMarker(false);
  }, []);

  const handleMarkerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMarkerData) {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const image = formData.get('image') as string;
      const link = formData.get('link') as string;

      setPoints(prev => [...prev, {
        name,
        description,
        position: newMarkerData.position,
        image: image || undefined,
        link: link || undefined
      }]);
      setNewMarkerData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bali Map Explorer</h1>
        <div className="h-[600px] rounded-lg overflow-hidden shadow-lg relative">
          <MapContainer 
            center={[-8.4095, 115.1889]} 
            zoom={9} 
            style={{ height: '100%', width: '100%' }}
          >
            <MapEvents isAddingMarker={isAddingMarker} onMapClick={handleMapClick} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point, index) => (
              <Marker 
                key={index} 
                position={point.position} 
                icon={customIcon}
              >
                <Popup maxWidth={300} minWidth={300}>
                  <div className="p-2 w-[280px]">
                    <h3 className="font-bold text-lg mb-2 break-words">{point.name}</h3>
                    {point.image && (
                      <div className="relative mb-2">
                        <img 
                          src={point.image} 
                          alt={point.name}
                          className="w-full aspect-[4/3] object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => point.image && setSelectedImage(point.image)}
                        />
                        <button
                          onClick={() => point.image && setSelectedImage(point.image)}
                          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    )}
                    <div className="max-h-[150px] overflow-y-auto scrollbar-thin">
                      <p className="text-gray-600 mb-2 break-words whitespace-normal">{point.description}</p>
                    </div>
                    {point.link && (
                      <a 
                        href={point.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <LinkIcon size={16} />
                        Learn More
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            <AddMarkerControl 
              isAddingMarker={isAddingMarker} 
              onClick={() => setIsAddingMarker(!isAddingMarker)} 
            />
          </MapContainer>
        </div>

        {/* Network Graph Component */}
        <NetworkGraph />

        {newMarkerData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Add New Location</h2>
              <form onSubmit={handleMarkerSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Location Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                    maxLength={300}
                    placeholder="Describe this location..."
                  />
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700">Learn More Link (optional)</label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    placeholder="https://example.com"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setNewMarkerData(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                  >
                    Add Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[3000]"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-[90vw] max-h-[90vh] relative">
              <img 
                src={selectedImage} 
                alt="Full size view"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <MapPinOff size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;