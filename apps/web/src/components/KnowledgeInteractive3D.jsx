import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createMossPhotoTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');

  const base = ctx.createLinearGradient(0, 0, 0, c.height);
  base.addColorStop(0, '#20311d');
  base.addColorStop(0.45, '#3b5f2f');
  base.addColorStop(1, '#6d8e3f');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const r = 1 + Math.random() * 8;
    const color = ['rgba(116,153,67,0.35)', 'rgba(171,189,88,0.25)', 'rgba(62,101,45,0.28)'][Math.floor(Math.random() * 3)];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 220; i++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const w = 26 + Math.random() * 70;
    const h = 10 + Math.random() * 30;
    ctx.fillStyle = `rgba(220,240,170,${0.05 + Math.random() * 0.09})`;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 2.2);
  tex.anisotropy = 8;
  return tex;
}

function createPanelTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  const lg = ctx.createLinearGradient(0, 0, c.width, c.height);
  lg.addColorStop(0, '#f9fff5');
  lg.addColorStop(1, '#ecf7e9');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = 'rgba(53,86,62,0.14)';
  ctx.fillRect(24, 24, c.width - 48, c.height - 48);

  ctx.fillStyle = '#1f3629';
  ctx.font = '700 96px Noto Serif SC, serif';
  ctx.fillText('Oliver!', 78, 170);
  ctx.font = '500 38px Noto Sans SC, sans-serif';
  ctx.fillText('Stenders_qi Nature Experience', 78, 245);
  ctx.fillText('Interactive Knowledge Panel', 78, 300);

  ctx.strokeStyle = 'rgba(74,117,84,0.32)';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, c.width - 88, c.height - 88);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export default function KnowledgeInteractive3D() {
  const stageRef = useRef(null);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f3);

    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / host.clientHeight, 0.01, 30);
    camera.position.set(0, 0.12, 2.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xe8efe3, 0.7);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.08);
    key.position.set(1.2, 1.8, 1.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2;
    key.shadow.camera.bottom = -2;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xf6fff0, 0.52);
    rim.position.set(-1.4, 0.9, 1.2);
    scene.add(rim);

    const mossTex = createMossPhotoTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: mossTex,
      roughness: 0.92,
      metalness: 0.02
    });

    const ground = new THREE.Mesh(new THREE.CircleGeometry(2.2, 96), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.73;
    ground.receiveShadow = true;
    scene.add(ground);

    const mossEdge = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 0.62),
      new THREE.MeshStandardMaterial({ map: mossTex, roughness: 0.95, metalness: 0.01 })
    );
    mossEdge.position.set(0, -0.48, 0.64);
    mossEdge.rotation.x = -0.18;
    mossEdge.receiveShadow = true;
    scene.add(mossEdge);

    const makeBathBall = (x, z, color) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 28, 28),
        new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.48,
          metalness: 0,
          clearcoat: 0.55,
          clearcoatRoughness: 0.35
        })
      );
      m.position.set(x, -0.62, z);
      m.castShadow = true;
      scene.add(m);
      return m;
    };

    const makeRock = (x, z, s) => {
      const m = new THREE.Mesh(
        new THREE.DodecahedronGeometry(s, 0),
        new THREE.MeshStandardMaterial({ color: 0xb8b0a2, roughness: 0.96, metalness: 0.03 })
      );
      m.position.set(x, -0.64 + s * 0.3, z);
      m.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.2);
      m.castShadow = true;
      scene.add(m);
      return m;
    };

    const decor = [
      makeBathBall(-0.88, -0.34, 0xf1d7df),
      makeBathBall(-0.98, -0.12, 0xd9edd2),
      makeBathBall(0.96, -0.26, 0xf4e7c5),
      makeRock(1.08, 0.14, 0.12),
      makeRock(-1.12, 0.08, 0.1)
    ];

    const w = 1.25;
    const h = 0.84;
    const segX = 22;
    const segY = 14;
    const cols = segX + 1;
    const id = (x, y) => y * cols + x;

    const pos = [];
    const uv = [];
    const ind = [];

    for (let y = 0; y <= segY; y++) {
      const v = y / segY;
      const py = h * 0.5 - v * h;
      for (let x = 0; x <= segX; x++) {
        const u = x / segX;
        const px = -w * 0.5 + u * w;
        pos.push(px, py, 0);
        uv.push(u, 1 - v);
      }
    }

    for (let y = 0; y < segY; y++) {
      for (let x = 0; x < segX; x++) {
        const a = id(x, y);
        const b = id(x + 1, y);
        const c = id(x, y + 1);
        const d = id(x + 1, y + 1);
        ind.push(a, c, b, b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(ind);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.computeVertexNormals();

    const tex = createPanelTexture();
    const material = new THREE.MeshPhysicalMaterial({
      map: tex,
      side: THREE.DoubleSide,
      roughness: 0.54,
      metalness: 0.02,
      clearcoat: 0.25,
      clearcoatRoughness: 0.36,
      sheen: 0.25,
      sheenColor: new THREE.Color(0xcde0cf)
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const positionAttr = geometry.getAttribute('position');
    const particles = [];
    for (let y = 0; y <= segY; y++) {
      for (let x = 0; x <= segX; x++) {
        const i = id(x, y);
        const px = positionAttr.getX(i);
        const py = positionAttr.getY(i);
        const pz = positionAttr.getZ(i);
        particles[i] = {
          pos: new THREE.Vector3(px, py, pz),
          prev: new THREE.Vector3(px, py, pz),
          pin: new THREE.Vector3(px, py, pz)
        };
      }
    }

    const constraints = [];
    const restX = w / segX;
    const restY = h / segY;
    const restD = Math.hypot(restX, restY);
    const add = (a, b, rest, stiff) => constraints.push({ a, b, rest, stiff });

    for (let y = 0; y <= segY; y++) {
      for (let x = 0; x <= segX; x++) {
        const i = id(x, y);
        if (x < segX) add(i, id(x + 1, y), restX, 1.0);
        if (y < segY) add(i, id(x, y + 1), restY, 1.0);
        if (x < segX && y < segY) add(i, id(x + 1, y + 1), restD, 0.8);
        if (x > 0 && y < segY) add(i, id(x - 1, y + 1), restD, 0.8);
        if (x < segX - 1) add(i, id(x + 2, y), restX * 2, 0.35);
        if (y < segY - 1) add(i, id(x, y + 2), restY * 2, 0.35);
      }
    }

    const anchorIndices = [id(0, 0), id(Math.floor(segX / 2), 0), id(segX, 0)];

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const hit = new THREE.Vector3();
    const drag = { active: false, index: -1, target: new THREE.Vector3(), last: new THREE.Vector3(), vel: new THREE.Vector3() };

    const setMouse = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onDown = (e) => {
      if (e.button !== 0) return;
      setMouse(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(mesh, false);
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
      drag.active = true;
      drag.index = nearest;
      drag.target.copy(h0.point);
      drag.last.copy(h0.point);
      drag.vel.set(0, 0, 0);
      const n = camera.getWorldDirection(new THREE.Vector3()).normalize();
      dragPlane.setFromNormalAndCoplanarPoint(n, h0.point);
      renderer.domElement.setPointerCapture(e.pointerId);
    };

    const onMove = (e) => {
      if (!drag.active) return;
      setMouse(e);
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(dragPlane, hit)) {
        drag.vel.copy(hit).sub(drag.last);
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

    const gravity = new THREE.Vector3(0, -1.05, 0);
    const temp = new THREE.Vector3();
    const corr = new THREE.Vector3();
    let t = 0;

    const bounds = {
      minX: -1.35,
      maxX: 1.35,
      minY: -0.62,
      maxY: 0.84,
      minZ: -0.65,
      maxZ: 0.65
    };

    const applyDrag = () => {
      if (!drag.active || drag.index < 0) return;
      const gx = drag.index % cols;
      const gy = Math.floor(drag.index / cols);
      const dir = camera.getWorldDirection(new THREE.Vector3()).normalize();
      const pull = drag.target.clone().addScaledVector(dir, -Math.min(0.2, drag.vel.length() * 8));

      const r = 3;
      for (let oy = -r; oy <= r; oy++) {
        for (let ox = -r; ox <= r; ox++) {
          const x = gx + ox;
          const y = gy + oy;
          if (x < 0 || x > segX || y < 0 || y > segY) continue;
          const i = id(x, y);
          const p = particles[i];
          const d2 = ox * ox + oy * oy;
          const wgt = Math.exp(-d2 / 3.4);
          p.pos.lerp(pull, 0.42 * wgt);
          p.prev.lerp(pull.clone().sub(drag.vel.clone().multiplyScalar(1.1)), 0.2 * wgt);
        }
      }
    };

    const applySoftAnchors = () => {
      for (const i of anchorIndices) {
        const p = particles[i];
        p.pos.lerp(p.pin, 0.18);
      }
    };

    const applyBoundsAndGround = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.pos.y < bounds.minY) {
          p.pos.y = bounds.minY;
          p.prev.y = p.pos.y + (p.prev.y - p.pos.y) * -0.1;
        }
        p.pos.y = Math.min(bounds.maxY, p.pos.y);
        p.pos.x = Math.max(bounds.minX, Math.min(bounds.maxX, p.pos.x));
        p.pos.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, p.pos.z));
      }
    };

    const simulate = (dt) => {
      t += dt;
      const dt2 = dt * dt;
      const damp = 0.986;
      const wind = new THREE.Vector3(Math.sin(t * 1.3) * 0.08, Math.cos(t * 1.1) * 0.06, Math.cos(t * 1.6) * 0.12);

      applyDrag();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        temp.copy(p.pos);
        const vel = p.pos.clone().sub(p.prev).multiplyScalar(damp);
        p.pos.add(vel);
        p.pos.addScaledVector(gravity, dt2);
        p.pos.addScaledVector(wind, dt2);
        p.prev.copy(temp);
      }

      const iter = drag.active ? 7 : 5;
      for (let k = 0; k < iter; k++) {
        for (let c = 0; c < constraints.length; c++) {
          const con = constraints[c];
          const p1 = particles[con.a];
          const p2 = particles[con.b];
          corr.copy(p2.pos).sub(p1.pos);
          const len = corr.length();
          if (len < 1e-6) continue;
          const diff = (len - con.rest) / len;
          const fac = 0.5 * con.stiff;
          p1.pos.addScaledVector(corr, fac * diff);
          p2.pos.addScaledVector(corr, -fac * diff);
        }
        applySoftAnchors();
      }

      applyBoundsAndGround();

      const center = particles[id(Math.floor(segX / 2), Math.floor(segY / 2))].pos;
      const offset = center.clone().multiplyScalar(0.012);
      for (let i = 0; i < particles.length; i++) {
        particles[i].pos.sub(offset);
        particles[i].prev.sub(offset);
      }
    };

    const clock = new THREE.Clock();
    let acc = 0;
    const fixed = 1 / 60;
    let raf = 0;
    let frame = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      acc += Math.min(0.033, clock.getDelta());
      let steps = 0;
      while (acc >= fixed && steps < 3) {
        simulate(fixed);
        acc -= fixed;
        steps += 1;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i].pos;
        positionAttr.setXYZ(i, p.x, p.y, p.z);
      }
      positionAttr.needsUpdate = true;
      if ((frame & 1) === 0) geometry.computeVertexNormals();

      renderer.render(scene, camera);
      frame += 1;
    };

    loop();

    const onResize = () => {
      const w2 = host.clientWidth;
      const h2 = host.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
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
      tex.dispose();
      material.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
      mossEdge.geometry.dispose();
      mossEdge.material.dispose();
      mossTex.dispose();
      decor.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="panel knowledge-3d-panel">
      <div className="knowledge-3d-head">
        <h2 className="section-title">3D 知识交互面板</h2>
        <p className="hint">软锚点防掉落，苔藓草地场景与自然材质渲染</p>
      </div>
      <div ref={stageRef} className="knowledge-3d-stage" />
    </section>
  );
}
