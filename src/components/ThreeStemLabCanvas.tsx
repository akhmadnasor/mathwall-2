import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCw, Eye, Compass, Maximize2 } from 'lucide-react';
import { FractionDisplay } from './FractionVisuals';

export interface ThreeStemLabProps {
  activeLab: 'lab1' | 'lab2' | 'lab3';
  l1NumA: number;
  l1DenA: number;
  l1NumB: number;
  l1DenB: number;
  l1NumC: number;
  l1DenC: number;
  l1Kpk: number;
  l2NumA: number;
  l2DenA: number;
  l2NumB: number;
  l2DenB: number;
  l2Kpk: number;
  l3WholeA: number;
  l3NumA: number;
  l3DenA: number;
  l3NumB: number;
  l3DenB: number;
  l3Kpk: number;
}

export const ThreeStemLabCanvas: React.FC<ThreeStemLabProps> = (props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef<ThreeStemLabProps>(props);
  propsRef.current = props;

  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [camPreset, setCamPreset] = useState<'front' | 'iso' | 'top'>('front');
  const autoRotateRef = useRef<boolean>(false);
  const camTargetRef = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const applyCameraPreset = (preset: 'front' | 'iso' | 'top') => {
    setCamPreset(preset);
    if (preset === 'front') {
      camTargetRef.current = {
        pos: new THREE.Vector3(0, 2.3, 7.6),
        look: new THREE.Vector3(0, 1.2, 0),
      };
    } else if (preset === 'iso') {
      camTargetRef.current = {
        pos: new THREE.Vector3(5.4, 4.2, 6.2),
        look: new THREE.Vector3(0, 1.1, 0),
      };
    } else {
      camTargetRef.current = {
        pos: new THREE.Vector3(0, 7.2, 2.2),
        look: new THREE.Vector3(0, 0.8, 0),
      };
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#082545');
    scene.fog = new THREE.FogExp2('#082545', 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.3, 7.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(rendererStr);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.2, 0);
    controls.minDistance = 3.8;
    controls.maxDistance = 13;
    controls.maxPolarAngle = Math.PI * 0.48;

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x082545, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(5, 8, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    const benchGeo = new THREE.BoxGeometry(10.5, 0.4, 5.2);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.4,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.2, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    const rimBarGeo = new THREE.BoxGeometry(10.55, 0.08, 0.12);
    const rimBarMat = new THREE.MeshStandardMaterial({
      color: 0xffd60a,
      roughness: 0.25,
      metalness: 0.7,
    });
    const rimBar = new THREE.Mesh(rimBarGeo, rimBarMat);
    rimBar.position.set(0, -0.02, 2.58);
    scene.add(rimBar);

    const gridHelper = new THREE.GridHelper(10, 20, 0x0066dd, 0x1e3a5f);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
      metalness: 0.05,
      reflectivity: 0.9,
      side: THREE.DoubleSide,
    });

    const metalCapMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.85,
    });

    // LAB 1 GROUP
    const lab1Group = new THREE.Group();
    scene.add(lab1Group);

    const cylHeight = 2.8;
    const cylRadius = 0.58;
    const lab1Colors = [0x0066dd, 0x58cc02, 0xff7a00];
    const lab1XPositions = [-2.4, 0, 2.4];

    const lab1Liquids: THREE.Mesh[] = [];
    const lab1Menisci: THREE.Mesh[] = [];
    const lab1Bubbles: THREE.Mesh[][] = [];

    lab1XPositions.forEach((xPos, idx) => {
      const subGroup = new THREE.Group();
      subGroup.position.set(xPos, 0, 0);

      const baseGeo = new THREE.CylinderGeometry(cylRadius * 1.18, cylRadius * 1.25, 0.18, 32);
      const baseMesh = new THREE.Mesh(baseGeo, metalCapMat);
      baseMesh.position.y = 0.09;
      subGroup.add(baseMesh);

      const glassGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32, 1, true);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.y = 0.18 + cylHeight / 2;
      subGroup.add(glassMesh);

      const topRimGeo = new THREE.TorusGeometry(cylRadius, 0.035, 16, 48);
      const topRim = new THREE.Mesh(topRimGeo, metalCapMat);
      topRim.rotation.x = Math.PI / 2;
      topRim.position.y = 0.18 + cylHeight;
      subGroup.add(topRim);

      [0.25, 0.5, 0.75, 1].forEach((mark) => {
        const ringGeo = new THREE.TorusGeometry(cylRadius + 0.008, 0.012, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: mark === 1 ? 0xffd60a : 0xbae6fd,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.18 + mark * (cylHeight * 0.88);
        subGroup.add(ring);
      });

      const liqGeo = new THREE.CylinderGeometry(cylRadius * 0.93, cylRadius * 0.93, 1, 32);
      liqGeo.translate(0, 0.5, 0);
      const liqMat = new THREE.MeshStandardMaterial({
        color: lab1Colors[idx],
        roughness: 0.18,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88,
      });
      const liqMesh = new THREE.Mesh(liqGeo, liqMat);
      liqMesh.position.y = 0.18;
      subGroup.add(liqMesh);
      lab1Liquids.push(liqMesh);

      const menGeo = new THREE.CylinderGeometry(cylRadius * 0.93, cylRadius * 0.93, 0.03, 32);
      const menMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: lab1Colors[idx],
        emissiveIntensity: 0.45,
        roughness: 0.1,
      });
      const menMesh = new THREE.Mesh(menGeo, menMat);
      menMesh.position.y = 0.2;
      subGroup.add(menMesh);
      lab1Menisci.push(menMesh);

      const cylBubbles: THREE.Mesh[] = [];
      const bubGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const bubMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.65,
      });
      for (let b = 0; b < 5; b++) {
        const bub = new THREE.Mesh(bubGeo, bubMat);
        bub.position.set(
          (Math.random() - 0.5) * cylRadius * 1.1,
          0.25 + b * 0.3,
          (Math.random() - 0.5) * cylRadius * 1.1
        );
        subGroup.add(bub);
        cylBubbles.push(bub);
      }
      lab1Bubbles.push(cylBubbles);

      lab1Group.add(subGroup);
    });

    // LAB 2 GROUP
    const lab2Group = new THREE.Group();
    lab2Group.visible = false;
    scene.add(lab2Group);

    const beakerPositions = [-2.6, -0.6];
    const beakerColors = [0x0066dd, 0x58cc02];
    const lab2InputLiquids: THREE.Mesh[] = [];

    beakerPositions.forEach((bx, idx) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 0, 0);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.68, 0.16, 32),
        metalCapMat
      );
      base.position.y = 0.08;
      bGroup.add(base);

      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.56, 2.2, 32, 1, true),
        glassMat
      );
      glass.position.y = 0.16 + 1.1;
      bGroup.add(glass);

      const liqGeo = new THREE.CylinderGeometry(0.52, 0.52, 1, 32);
      liqGeo.translate(0, 0.5, 0);
      const liqMat = new THREE.MeshStandardMaterial({
        color: beakerColors[idx],
        roughness: 0.18,
        transparent: true,
        opacity: 0.88,
      });
      const liq = new THREE.Mesh(liqGeo, liqMat);
      liq.position.y = 0.16;
      bGroup.add(liq);
      lab2InputLiquids.push(liq);

      lab2Group.add(bGroup);
    });

    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.6, 16);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMesh = new THREE.Mesh(pipeGeo, metalCapMat);
    pipeMesh.position.set(-0.2, 0.35, 0);
    lab2Group.add(pipeMesh);

    const reactorGroup = new THREE.Group();
    reactorGroup.position.set(2.1, 0, 0);
    const rRadius = 0.88;
    const rHeight = 3.0;

    const rBase = new THREE.Mesh(
      new THREE.CylinderGeometry(rRadius * 1.15, rRadius * 1.22, 0.2, 32),
      metalCapMat
    );
    rBase.position.y = 0.1;
    reactorGroup.add(rBase);

    const rGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(rRadius, rRadius, rHeight, 32, 1, true),
      glassMat
    );
    rGlass.position.y = 0.2 + rHeight / 2;
    reactorGroup.add(rGlass);

    [0.5, 1.0].forEach((lvl) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(rRadius + 0.01, 0.018, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0xffd60a })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.2 + lvl * (rHeight * 0.88);
      reactorGroup.add(ring);
    });

    const rLiqAGeo = new THREE.CylinderGeometry(rRadius * 0.93, rRadius * 0.93, 1, 32);
    rLiqAGeo.translate(0, 0.5, 0);
    const rLiqAMesh = new THREE.Mesh(
      rLiqAGeo,
      new THREE.MeshStandardMaterial({
        color: 0x0066dd,
        roughness: 0.15,
        transparent: true,
        opacity: 0.9,
      })
    );
    rLiqAMesh.position.y = 0.2;
    reactorGroup.add(rLiqAMesh);

    const rLiqBGeo = new THREE.CylinderGeometry(rRadius * 0.93, rRadius * 0.93, 1, 32);
    rLiqBGeo.translate(0, 0.5, 0);
    const rLiqBMesh = new THREE.Mesh(
      rLiqBGeo,
      new THREE.MeshStandardMaterial({
        color: 0x58cc02,
        roughness: 0.15,
        transparent: true,
        opacity: 0.9,
      })
    );
    rLiqBMesh.position.y = 0.8;
    reactorGroup.add(rLiqBMesh);

    lab2Group.add(reactorGroup);

    // LAB 3 GROUP
    const lab3Group = new THREE.Group();
    lab3Group.visible = false;
    scene.add(lab3Group);

    const tankGroup = new THREE.Group();
    tankGroup.position.set(-1.8, 0, 0);
    const tRadius = 0.95;
    const tHeight = 3.0;

    const tBase = new THREE.Mesh(
      new THREE.CylinderGeometry(tRadius * 1.15, tRadius * 1.2, 0.2, 32),
      metalCapMat
    );
    tBase.position.y = 0.1;
    tankGroup.add(tBase);

    const tGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(tRadius, tRadius, tHeight, 32, 1, true),
      glassMat
    );
    tGlass.position.y = 0.2 + tHeight / 2;
    tankGroup.add(tGlass);

    [1 / 3, 2 / 3, 1].forEach((lvl) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(tRadius + 0.01, 0.016, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0xffd60a })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.2 + lvl * (tHeight * 0.88);
      tankGroup.add(ring);
    });

    const remGeo = new THREE.CylinderGeometry(tRadius * 0.93, tRadius * 0.93, 1, 32);
    remGeo.translate(0, 0.5, 0);
    const remMesh = new THREE.Mesh(
      remGeo,
      new THREE.MeshStandardMaterial({
        color: 0x0066dd,
        roughness: 0.15,
        transparent: true,
        opacity: 0.9,
      })
    );
    remMesh.position.y = 0.2;
    tankGroup.add(remMesh);

    const drainGhostGeo = new THREE.CylinderGeometry(tRadius * 0.91, tRadius * 0.91, 1, 32);
    drainGhostGeo.translate(0, 0.5, 0);
    const drainGhostMesh = new THREE.Mesh(
      drainGhostGeo,
      new THREE.MeshStandardMaterial({
        color: 0xff7a00,
        roughness: 0.3,
        transparent: true,
        opacity: 0.42,
      })
    );
    drainGhostMesh.position.y = 1.0;
    tankGroup.add(drainGhostMesh);

    lab3Group.add(tankGroup);

    const drainPipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.6, 16);
    drainPipeGeo.rotateZ(Math.PI / 2);
    const drainPipe = new THREE.Mesh(drainPipeGeo, metalCapMat);
    drainPipe.position.set(0.1, 0.42, 0);
    lab3Group.add(drainPipe);

    const valveWheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.06, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.3 })
    );
    valveWheel.position.set(0.1, 0.42, 0.16);
    lab3Group.add(valveWheel);

    const outGroup = new THREE.Group();
    outGroup.position.set(2.0, 0, 0);
    const outBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.8, 0.18, 32),
      metalCapMat
    );
    outBase.position.y = 0.09;
    outGroup.add(outBase);

    const outGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 2.2, 32, 1, true),
      glassMat
    );
    outGlass.position.y = 0.18 + 1.1;
    outGroup.add(outGlass);

    const outLiqGeo = new THREE.CylinderGeometry(0.63, 0.63, 1, 32);
    outLiqGeo.translate(0, 0.5, 0);
    const outLiqMesh = new THREE.Mesh(
      outLiqGeo,
      new THREE.MeshStandardMaterial({
        color: 0xff7a00,
        roughness: 0.2,
        transparent: true,
        opacity: 0.88,
      })
    );
    outLiqMesh.position.y = 0.18;
    outGroup.add(outLiqMesh);
    lab3Group.add(outGroup);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const p = propsRef.current;

      lab1Group.visible = p.activeLab === 'lab1';
      lab2Group.visible = p.activeLab === 'lab2';
      lab3Group.visible = p.activeLab === 'lab3';

      if (camTargetRef.current) {
        camera.position.lerp(camTargetRef.current.pos, 1 - Math.exp(-6 * dt));
        controls.target.lerp(camTargetRef.current.look, 1 - Math.exp(-6 * dt));
        if (camera.position.distanceTo(camTargetRef.current.pos) < 0.05) {
          camTargetRef.current = null;
        }
      }

      controls.autoRotate = autoRotateRef.current;
      controls.autoRotateSpeed = 1.6;
      controls.update();

      const maxUsableCylH = cylHeight * 0.88;

      if (p.activeLab === 'lab1') {
        const ratios = [
          Math.min(1, p.l1NumA / Math.max(1, p.l1DenA)),
          Math.min(1, p.l1NumB / Math.max(1, p.l1DenB)),
          Math.min(1, p.l1NumC / Math.max(1, p.l1DenC)),
        ];
        ratios.forEach((ratio, idx) => {
          const targetH = Math.max(0.05, ratio * maxUsableCylH);
          const liq = lab1Liquids[idx];
          liq.scale.y = THREE.MathUtils.damp(liq.scale.y, targetH, 6, dt);
          const men = lab1Menisci[idx];
          men.position.y = 0.18 + liq.scale.y + Math.sin(elapsed * 3 + idx) * 0.012;

          lab1Bubbles[idx].forEach((bub, bIdx) => {
            bub.position.y += dt * (0.35 + bIdx * 0.08);
            if (bub.position.y > 0.18 + liq.scale.y - 0.05) {
              bub.position.y = 0.22;
            }
          });
        });
      } else if (p.activeLab === 'lab2') {
        const ratioA = Math.min(1, p.l2NumA / Math.max(1, p.l2DenA));
        const ratioB = Math.min(1, p.l2NumB / Math.max(1, p.l2DenB));

        lab2InputLiquids[0].scale.y = THREE.MathUtils.damp(
          lab2InputLiquids[0].scale.y,
          Math.max(0.05, ratioA * 1.9),
          6,
          dt
        );
        lab2InputLiquids[1].scale.y = THREE.MathUtils.damp(
          lab2InputLiquids[1].scale.y,
          Math.max(0.05, ratioB * 1.9),
          6,
          dt
        );

        const unitPerLiter = (rHeight * 0.88) / 2;
        const targetHA = Math.max(0.04, ratioA * unitPerLiter);
        const targetHB = Math.max(0.04, ratioB * unitPerLiter);

        rLiqAMesh.scale.y = THREE.MathUtils.damp(rLiqAMesh.scale.y, targetHA, 6, dt);
        rLiqBMesh.position.y = 0.2 + rLiqAMesh.scale.y;
        rLiqBMesh.scale.y = THREE.MathUtils.damp(rLiqBMesh.scale.y, targetHB, 6, dt);
      } else if (p.activeLab === 'lab3') {
        const initLiters = p.l3WholeA + p.l3NumA / Math.max(1, p.l3DenA);
        const usedLiters = p.l3NumB / Math.max(1, p.l3DenB);
        const remLiters = Math.max(0, initLiters - usedLiters);

        const unitPerLiter3 = (tHeight * 0.88) / 3;
        const targetRemH = Math.max(0.04, remLiters * unitPerLiter3);
        const targetUsedH = Math.max(0.02, usedLiters * unitPerLiter3);

        remMesh.scale.y = THREE.MathUtils.damp(remMesh.scale.y, targetRemH, 6, dt);
        drainGhostMesh.position.y = 0.2 + remMesh.scale.y;
        drainGhostMesh.scale.y = THREE.MathUtils.damp(drainGhostMesh.scale.y, targetUsedH, 6, dt);

        outLiqMesh.scale.y = THREE.MathUtils.damp(
          outLiqMesh.scale.y,
          Math.max(0.05, usedLiters * 1.85),
          6,
          dt
        );

        valveWheel.rotation.z = elapsed * 1.5;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] w-full rounded-2xl overflow-hidden border-2 border-[#082545] bg-[#082545] flex flex-col">
      {/* 3D WebGL Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[360px] sm:h-[420px] flex-1 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Floating Mathematical HUD Overlay with Proper Vertical Fractions */}
      <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 flex flex-wrap items-start justify-between gap-2">
        {props.activeLab === 'lab1' && (
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-lg">
            {[
              { title: 'Tabung A', num: props.l1NumA, den: props.l1DenA, eq: props.l1NumA * (props.l1Kpk / props.l1DenA), bg: 'bg-[#0066DD]/90' },
              { title: 'Tabung B', num: props.l1NumB, den: props.l1DenB, eq: props.l1NumB * (props.l1Kpk / props.l1DenB), bg: 'bg-[#58CC02]/90' },
              { title: 'Tabung C', num: props.l1NumC, den: props.l1DenC, eq: props.l1NumC * (props.l1Kpk / props.l1DenC), bg: 'bg-[#FF7A00]/90' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`${item.bg} backdrop-blur-sm text-white px-2.5 py-1 rounded-xl border border-[#082545] flex items-center justify-between gap-1 shadow-sm`}
              >
                <div className="text-[11px] font-extrabold">{item.title}</div>
                <div className="flex items-center gap-1 bg-white/95 text-[#082545] px-1.5 py-0.5 rounded-lg">
                  <FractionDisplay num={item.num} den={item.den} size="sm" />
                  <span className="text-[10px] font-bold">=</span>
                  <FractionDisplay num={item.eq} den={props.l1Kpk} size="sm" colorClass="text-[#0066DD]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {props.activeLab === 'lab2' && (
          <div className="bg-white/95 backdrop-blur-sm text-[#082545] px-3 py-1 rounded-xl border border-[#082545] flex flex-wrap items-center gap-1.5 shadow-sm">
            <span className="text-xs font-extrabold text-[#0066DD]">Reaktor 3D:</span>
            <FractionDisplay num={props.l2NumA} den={props.l2DenA} size="sm" colorClass="text-[#0066DD]" />
            <span className="font-extrabold">+</span>
            <FractionDisplay num={props.l2NumB} den={props.l2DenB} size="sm" colorClass="text-[#15803D]" />
            <span className="font-extrabold">=</span>
            <FractionDisplay
              num={props.l2NumA * (props.l2Kpk / props.l2DenA) + props.l2NumB * (props.l2Kpk / props.l2DenB)}
              den={props.l2Kpk}
              size="sm"
              colorClass="text-[#FF7A00]"
            />
            <span className="text-xs font-extrabold">Liter</span>
          </div>
        )}

        {props.activeLab === 'lab3' && (
          <div className="bg-white/95 backdrop-blur-sm text-[#082545] px-3 py-1 rounded-xl border border-[#082545] flex flex-wrap items-center gap-1.5 shadow-sm">
            <span className="text-xs font-extrabold text-[#FF7A00]">Irigasi 3D:</span>
            <FractionDisplay
              whole={props.l3WholeA}
              num={props.l3NumA}
              den={props.l3DenA}
              size="sm"
              colorClass="text-[#0066DD]"
            />
            <span className="font-extrabold">−</span>
            <FractionDisplay num={props.l3NumB} den={props.l3DenB} size="sm" colorClass="text-[#FF7A00]" />
            <span className="text-xs font-bold text-slate-600">(KPK = {props.l3Kpk})</span>
          </div>
        )}
      </div>

      {/* Bottom Interactive 3D Camera Control Dock */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 bg-[#082545]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-400/40 text-white">
        <div className="text-[11px] font-bold text-[#BAE6FD] flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-[#FFD60A]" />
          <span className="hidden sm:inline">Three.js 3D Interaktif: Geser layar untuk memutar</span>
          <span className="sm:hidden">Geser 3D</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyCameraPreset('front')}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-colors ${
              camPreset === 'front'
                ? 'bg-[#0066DD] text-white border border-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Depan</span>
          </button>
          <button
            type="button"
            onClick={() => applyCameraPreset('iso')}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-colors ${
              camPreset === 'iso'
                ? 'bg-[#0066DD] text-white border border-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Sudut 3D</span>
          </button>
          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-colors ${
              autoRotate
                ? 'bg-[#58CC02] text-white border border-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>Putar 360°</span>
          </button>
        </div>
      </div>
    </div>
  );
};
