import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createPanelTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  const lg = ctx.createLinearGradient(0, 0, c.width, c.height);
  lg.addColorStop(0, '#eef6e8');
  lg.addColorStop(1, '#dce8d5');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = 'rgba(43,74,55,0.12)';
  ctx.fillRect(24, 24, c.width - 48, c.height - 48);

  ctx.fillStyle = '#1f3629';
  ctx.font = '700 96px Noto Serif SC, serif';
  ctx.fillText('Oliver!', 78, 170);
  ctx.font = '500 38px Noto Sans SC, sans-serif';
  ctx.fillText('Stenders_qi Nature Experience', 78, 245);
  ctx.fillText('Interactive Knowledge Panel', 78, 300);

  ctx.strokeStyle = 'rgba(74,117,84,0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, c.width - 88, c.height - 88);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function addGrassField(scene, groundY) {
  const blades = 1800;
  const bladeGeo = new THREE.PlaneGeometry(0.02, 0.16, 1, 4);
  bladeGeo.translate(0, 0.08, 0);

  const phases = new Float32Array(blades);
  const bends = new Float32Array(blades);
  const colors = new Float32Array(blades * 3);

  const colorA = new THREE.Color('#5c8747');
  const colorB = new THREE.Color('#8cb666');
  const tempColor = new THREE.Color();

  for (let i = 0; i < blades; i++) {
    phases[i] = Math.random() * Math.PI * 2;
    bends[i] = 0.6 + Math.random() * 0.8;
    tempColor.copy(colorA).lerp(colorB, Math.random());
    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }

  bladeGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
  bladeGeo.setAttribute('aBend', new THREE.InstancedBufferAttribute(bends, 1));
  bladeGeo.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));

  const mat = new THREE.MeshStandardMaterial({
    color: '#6e9a4a',
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
    vertexColors: true
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    mat.userData.shader = shader;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         attribute float aPhase;
         attribute float aBend;
         attribute vec3 aColor;
         varying vec3 vInstColor;
         uniform float uTime;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float h = uv.y;
         float sway = sin(uTime * 1.8 + aPhase + instanceMatrix[3][0] * 1.7) * 0.045 * h * aBend;
         transformed.x += sway;
         transformed.z += sway * 0.36;
         vInstColor = aColor;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vInstColor;`
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        'vec4 diffuseColor = vec4( diffuse * vInstColor, opacity );'
      );
  };

  const mesh = new THREE.InstancedMesh(bladeGeo, mat, blades);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < blades; i++) {
    const x = (Math.random() - 0.5) * 2.5;
    const z = 0.05 + Math.random() * 1.25;
    const y = groundY + Math.random() * 0.03;

    dummy.position.set(x, y, z);
    dummy.rotation.y = Math.random() * Math.PI;
    const s = 0.8 + Math.random() * 1.3;
    dummy.scale.set(s, 0.8 + Math.random() * 1.4, s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  scene.add(mesh);
  return mesh;
}

export default function KnowledgeInteractive3D() {
  const stageRef = useRef(null);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9efe3);

    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / host.clientHeight, 0.01, 30);
    camera.position.set(0, 0.12, 2.5);
    camera.lookAt(0, 0, 0.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xf6faef, 0xc9d7bf, 0.75);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.12);
    key.position.set(1.2, 1.9, 1.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2;
    key.shadow.camera.bottom = -2;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xf1f8e8, 0.42);
    fill.position.set(-1.2, 1.0, 1.2);
    scene.add(fill);

    const groundY = -0.73;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.2, 60, 30),
      new THREE.MeshStandardMaterial({ color: '#7fa168', roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = groundY;
    ground.receiveShadow = true;
    scene.add(ground);

    const gPos = ground.geometry.attributes.position;
    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i);
      const y = gPos.getY(i);
      const wave = Math.sin(x * 2.8) * 0.015 + Math.cos(y * 4.1) * 0.01 + (Math.random() - 0.5) * 0.01;
      gPos.setZ(i, wave);
    }
    gPos.needsUpdate = true;
    ground.geometry.computeVertexNormals();

    const grassMesh = addGrassField(scene, groundY + 0.01);

    const makeRock = (x, z, s) => {
      const m = new THREE.Mesh(
        new THREE.DodecahedronGeometry(s, 0),
        new THREE.MeshStandardMaterial({ color: '#b7b09f', roughness: 0.95, metalness: 0.03 })
      );
      m.position.set(x, groundY + s * 0.45, z);
      m.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.2);
      m.castShadow = true;
      scene.add(m);
      return m;
    };

    const decor = [
      makeRock(1.02, 0.3, 0.12),
      makeRock(-1.05, 0.16, 0.1)
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
      clearcoat: 0.24,
      clearcoatRoughness: 0.36,
      sheen: 0.22,
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

    const topRowIndices = Array.from({ length: cols }, (_, x) => id(x, 0));

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

    const applyTopEdgeConstraint = () => {
      for (const i of topRowIndices) {
        const p = particles[i];
        // Keep the whole top edge straight and level while lower area remains soft.
        p.pos.copy(p.pin);
        p.prev.copy(p.pin);
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
        applyTopEdgeConstraint();
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

      if (grassMesh.material.userData.shader) {
        grassMesh.material.userData.shader.uniforms.uTime.value = clock.elapsedTime;
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
      grassMesh.geometry.dispose();
      grassMesh.material.dispose();
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
        <p className="hint">生态草地、风过草影与柔和自然光场</p>
      </div>
      <div ref={stageRef} className="knowledge-3d-stage" />
    </section>
  );
}

