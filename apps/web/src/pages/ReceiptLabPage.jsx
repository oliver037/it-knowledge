import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { quickGuides, TEMPLATE_STENDERS_QI } from '../quickGuides';

function createReceiptTexture(items) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#fffef8');
  g.addColorStop(1, '#f2ead9');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 3) {
    ctx.fillStyle = `rgba(90,90,90,${0.01 + Math.random() * 0.01})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  ctx.fillStyle = '#313733';
  ctx.textAlign = 'center';
  ctx.font = 'bold 74px "Times New Roman", "Noto Serif SC", serif';
  ctx.fillText('STENDERS_QI DIRECTORY', canvas.width / 2, 150);
  ctx.font = 'bold 38px "Times New Roman", "Noto Serif SC", serif';
  ctx.fillText('IT 小琦知识库 / 检索目录', canvas.width / 2, 208);

  ctx.textAlign = 'left';
  ctx.font = 'bold 42px "Noto Serif SC", "Times New Roman", serif';
  let y = 340;
  const lines = items.slice(0, 12);
  for (const line of lines) {
    ctx.fillText(`[ ] ${line.title}`, 90, y);
    y += 92;
  }

  ctx.font = 'bold 46px "Times New Roman", "Noto Serif SC", serif';
  ctx.fillText(`TOTAL ITEMS: ${items.length}`, 90, y + 80);
  ctx.fillText('CLICK RIGHT PANEL TO SEARCH', 90, y + 146);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function ReceiptLabPage() {
  const wrapRef = useRef(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase();
    if (!k) return quickGuides;
    return quickGuides.filter((it) => it.title.toLowerCase().includes(k) || it.summary.toLowerCase().includes(k));
  }, [query]);

  useEffect(() => {
    localStorage.setItem('kb_template_name', TEMPLATE_STENDERS_QI);
  }, []);

  useEffect(() => {
    const host = wrapRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(34, host.clientWidth / host.clientHeight, 0.01, 30);
    camera.position.set(0, 0.07, 3.1);
    camera.lookAt(0, -0.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xf2f2f2, 0.65);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(1.3, 2.2, 1.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2;
    key.shadow.camera.bottom = -2;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-1.2, 1.3, 1.0);
    scene.add(fill);

    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.14 }));
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.42;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const w = 1.05;
    const h = 1.95;
    const segX = 28;
    const segY = 58;
    const cols = segX + 1;
    const idx = (x, y) => y * cols + x;

    const positions = [];
    const uvs = [];
    const indices = [];

    for (let y = 0; y <= segY; y++) {
      const v = y / segY;
      const py = h * 0.5 - v * h;
      for (let x = 0; x <= segX; x++) {
        const u = x / segX;
        const px = -w * 0.5 + u * w;
        positions.push(px, py, 0);
        uvs.push(u, 1 - v);
      }
    }

    for (let y = 0; y < segY; y++) {
      for (let x = 0; x < segX; x++) {
        const a = idx(x, y);
        const b = idx(x + 1, y);
        const c = idx(x, y + 1);
        const d = idx(x + 1, y + 1);
        indices.push(a, c, b, b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    const posAttr = geometry.getAttribute('position');

    const tex = createReceiptTexture(filtered.length ? filtered : quickGuides);
    const material = new THREE.MeshPhysicalMaterial({
      map: tex,
      side: THREE.DoubleSide,
      roughness: 0.93,
      metalness: 0,
      clearcoat: 0.02,
      clearcoatRoughness: 0.8
    });

    const receipt = new THREE.Mesh(geometry, material);
    receipt.castShadow = true;
    receipt.receiveShadow = true;
    scene.add(receipt);

    const particles = [];
    for (let y = 0; y <= segY; y++) {
      for (let x = 0; x <= segX; x++) {
        const i = idx(x, y);
        const px = posAttr.getX(i);
        const py = posAttr.getY(i);
        const pz = posAttr.getZ(i);
        particles[i] = {
          pos: new THREE.Vector3(px, py, pz),
          prev: new THREE.Vector3(px, py, pz),
          pin: new THREE.Vector3(px, py, pz),
          pinned: y === 0,
          gy: y
        };
      }
    }

    const restX = w / segX;
    const restY = h / segY;
    const restD = Math.hypot(restX, restY);
    const constraints = [];
    const addCon = (a, b, rest, stiff) => constraints.push({ a, b, rest, stiff });

    for (let y = 0; y <= segY; y++) {
      for (let x = 0; x <= segX; x++) {
        const i = idx(x, y);
        if (x < segX) addCon(i, idx(x + 1, y), restX, 1.0);
        if (y < segY) addCon(i, idx(x, y + 1), restY, 1.0);
        if (x < segX && y < segY) addCon(i, idx(x + 1, y + 1), restD, 0.75);
        if (x > 0 && y < segY) addCon(i, idx(x - 1, y + 1), restD, 0.75);
        if (x < segX - 1) addCon(i, idx(x + 2, y), restX * 2, 0.35);
        if (y < segY - 1) addCon(i, idx(x, y + 2), restY * 2, 0.35);
      }
    }

    const forceTopEdge = () => {
      for (let x = 0; x <= segX; x++) {
        const p = particles[idx(x, 0)];
        p.pos.copy(p.pin);
        p.prev.copy(p.pin);
      }
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const hit = new THREE.Vector3();
    const drag = { active: false, index: -1, target: new THREE.Vector3(), last: new THREE.Vector3(), velocity: new THREE.Vector3() };

    const setMouse = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onDown = (event) => {
      if (event.button !== 0) return;
      setMouse(event);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(receipt, false);
      if (!hits.length) return;

      const h0 = hits[0];
      const ids = [h0.face.a, h0.face.b, h0.face.c];
      let nearest = ids[0];
      let best = h0.point.distanceToSquared(particles[nearest].pos);
      for (let i = 1; i < ids.length; i++) {
        const d = h0.point.distanceToSquared(particles[ids[i]].pos);
        if (d < best) {
          best = d;
          nearest = ids[i];
        }
      }

      if (particles[nearest].pinned) return;

      drag.active = true;
      drag.index = nearest;
      drag.target.copy(h0.point);
      drag.last.copy(h0.point);
      drag.velocity.set(0, 0, 0);
      const normal = camera.getWorldDirection(new THREE.Vector3()).normalize();
      dragPlane.setFromNormalAndCoplanarPoint(normal, h0.point);
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onMove = (event) => {
      if (!drag.active) return;
      setMouse(event);
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(dragPlane, hit)) {
        drag.velocity.copy(hit).sub(drag.last);
        drag.target.copy(hit);
        drag.last.copy(hit);
      }
    };

    const onUp = () => {
      drag.active = false;
      drag.index = -1;
    };

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);
    renderer.domElement.addEventListener('pointerleave', onUp);

    const gravity = new THREE.Vector3(0, -4.7, 0);
    const temp = new THREE.Vector3();
    const corr = new THREE.Vector3();
    let simTime = 0;

    const applyDragInfluence = () => {
      if (!drag.active || drag.index < 0) return;
      const gx = drag.index % cols;
      const gy = Math.floor(drag.index / cols);
      const camDir = camera.getWorldDirection(new THREE.Vector3()).normalize();
      const depthKick = Math.min(0.22, drag.velocity.length() * 7.0);
      const pullPoint = drag.target.clone().addScaledVector(camDir, -depthKick);

      const radius = 3;
      for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          const x = gx + ox;
          const y = gy + oy;
          if (x < 0 || x > segX || y < 0 || y > segY) continue;
          const i = idx(x, y);
          const p = particles[i];
          if (p.pinned) continue;
          const d2 = ox * ox + oy * oy;
          const inf = Math.exp(-d2 / 3.2);
          p.pos.lerp(pullPoint, 0.42 * inf);
          p.prev.lerp(pullPoint.clone().sub(drag.velocity.clone().multiplyScalar(1.1)), 0.2 * inf);
        }
      }
    };

    const simulate = (dt) => {
      simTime += dt;
      const dt2 = dt * dt;
      const damping = 0.985;
      const wind = new THREE.Vector3(Math.sin(simTime * 1.4) * 0.2, 0, Math.cos(simTime * 1.1) * 0.32);

      applyDragInfluence();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.pinned) continue;

        temp.copy(p.pos);
        const vel = p.pos.clone().sub(p.prev).multiplyScalar(damping);
        const softness = 0.55 + (p.gy / segY) * 0.75;
        p.pos.add(vel);
        p.pos.addScaledVector(gravity, dt2);
        p.pos.addScaledVector(wind, dt2 * softness);

        if (p.pos.y < -1.36) {
          p.pos.y = -1.36;
          p.prev.y = p.pos.y + (p.prev.y - p.pos.y) * -0.08;
        }

        p.prev.copy(temp);
      }

      const iterations = drag.active ? 8 : 5;
      for (let k = 0; k < iterations; k++) {
        for (let c = 0; c < constraints.length; c++) {
          const con = constraints[c];
          const p1 = particles[con.a];
          const p2 = particles[con.b];
          corr.copy(p2.pos).sub(p1.pos);
          const len = corr.length();
          if (len < 1e-6) continue;
          const diff = (len - con.rest) / len;
          const fac = 0.5 * con.stiff;
          if (!p1.pinned) p1.pos.addScaledVector(corr, fac * diff);
          if (!p2.pinned) p2.pos.addScaledVector(corr, -fac * diff);
        }
        forceTopEdge();
      }
    };

    const clock = new THREE.Clock();
    let acc = 0;
    const fixed = 1 / 60;
    let raf = 0;
    let frame = 0;

    const renderLoop = () => {
      raf = requestAnimationFrame(renderLoop);
      let delta = Math.min(0.033, clock.getDelta());
      acc += delta;
      let steps = 0;
      while (acc >= fixed && steps < 3) {
        simulate(fixed);
        acc -= fixed;
        steps += 1;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i].pos;
        posAttr.setXYZ(i, p.x, p.y, p.z);
      }
      posAttr.needsUpdate = true;
      if ((frame & 1) === 0) geometry.computeVertexNormals();
      renderer.render(scene, camera);
      frame += 1;
    };

    renderLoop();

    const onResize = () => {
      const w2 = host.clientWidth;
      const h2 = host.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      renderer.domElement.removeEventListener('pointerleave', onUp);
      geometry.dispose();
      material.map.dispose();
      material.dispose();
      shadowPlane.geometry.dispose();
      shadowPlane.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [filtered]);

  return (
    <section className="panel receipt-lab-panel">
      <div className="ticket-qi-layout">
        <div ref={wrapRef} className="receipt-stage" />
        <div className="ticket-qi-sidebar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search"
            placeholder="输入关键词检索目录..."
          />
          <div className="ticket-qi-list">
            {filtered.map((item) => (
              <div key={item.id} className="ticket-qi-item">
                <button type="button" className="chip" onClick={() => setQuery(item.title)}>
                  检索
                </button>
                <Link to={`/quick/${item.id}`} className="text-link">{item.title}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

