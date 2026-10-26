
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9dbac5);
  scene.fog = new THREE.Fog(0x9dbac5, 18, 48);

  const camera = new THREE.PerspectiveCamera(
    70, canvas.clientWidth / canvas.clientHeight, 0.1, 100
  );
  camera.position.set(0, 1.65, 7);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene.add(new THREE.HemisphereLight(0xd9f4ff, 0x33414c, 2.1));

  const keyLight = new THREE.DirectionalLight(0xffefcf, 2.1);
  keyLight.position.set(-4, 9, 5);
  scene.add(keyLight);

  const roomLight = new THREE.PointLight(0x83e4dd, 15, 18);
  roomLight.position.set(0, 3.2, -3);
  scene.add(roomLight);

  const materials = {
    floor: new THREE.MeshStandardMaterial({ color: 0x91aab4, roughness: 0.75 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xe0e9e8, roughness: 0.9 }),
    lowerWall: new THREE.MeshStandardMaterial({ color: 0x8caeb5, roughness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x173041, roughness: 0.55 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x3f6676, roughness: 0.55 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x8dd9e8, roughness: 0.25, metalness: 0.05,
      emissive: 0x16404d, emissiveIntensity: 0.35
    }),
    cyan: new THREE.MeshStandardMaterial({
      color: 0x5ce0d0, roughness: 0.35, emissive: 0x145a55, emissiveIntensity: 0.4
    }),
    mattress: new THREE.MeshStandardMaterial({ color: 0xe7f0ee, roughness: 0.85 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8ea4ac, metalness: 0.65, roughness: 0.3 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xc99578, roughness: 0.85 }),
    clothes: new THREE.MeshStandardMaterial({ color: 0x6b8db0, roughness: 0.8 }),
    plant: new THREE.MeshStandardMaterial({ color: 0x477e68, roughness: 0.9 })
  };

  const interactive = [];

  function box(name, x, y, z, w, h, d, material, interaction = null) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );
    mesh.position.set(x, y, z);
    mesh.name = name;
    mesh.userData.interaction = interaction;
    scene.add(mesh);
    if (interaction) interactive.push(mesh);
    return mesh;
  }

  function cylinder(name, x, y, z, radiusTop, radiusBottom, height, material) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16),
      material
    );
    mesh.position.set(x, y, z);
    mesh.name = name;
    scene.add(mesh);
    return mesh;
  }

  // الممر الأساسي
  box("floor", 0, -0.13, -4, 10, 0.25, 27, materials.floor);
  box("ceiling", 0, 3.5, -4, 10, 0.25, 27, materials.dark);
  box("left-wall", -5, 1.6, -4, 0.2, 3.3, 27, materials.wall);
  box("right-wall", 5, 1.6, -4, 0.2, 3.3, 27, materials.wall);
  box("far-wall", 0, 1.6, -17.4, 10, 3.3, 0.2, materials.wall);

  // شريط سفلي على الحائط
  box("left-wall-band", -4.87, 0.55, -4, 0.08, 0.9, 26, materials.lowerWall);
  box("right-wall-band", 4.87, 0.55, -4, 0.08, 0.9, 26, materials.lowerWall);

  // فواصل أرضية لتوضيح العمق
  for (let z = 7; z >= -16; z -= 3) {
    box("floor-line", 0, 0.002, z, 9.4, 0.012, 0.025, materials.glass);
  }

  // أبواب غرف التدريب على جانبي الممر
  const doorLeft = box(
    "door-patient", -4.84, 1.25, -5, 0.08, 2.5, 1.8,
    materials.trim, "patient-room"
  );
  box("door-patient-window", -4.78, 1.65, -5, 0.035, 0.65, 0.62, materials.glass);
  box("door-patient-handle", -4.73, 1.08, -4.45, 0.06, 0.07, 0.12, materials.metal);
  box("patient-room-sign", -4.75, 2.8, -5, 0.06, 0.3, 1.25, materials.dark);

  box("door-station", 4.84, 1.25, -1.2, 0.08, 2.5, 1.8,
    materials.trim, "nursing-station");
  box("station-window", 4.78, 1.65, -1.2, 0.035, 0.65, 0.62, materials.glass);
  box("station-sign", 4.75, 2.8, -1.2, 0.06, 0.3, 1.25, materials.dark);

  // لوحة مضيئة بعلامة طبية
  box("medical-sign", 0, 2.75, -17.22, 1.1, 0.5, 0.07, materials.dark);
  box("medical-cross-v", 0, 2.75, -17.15, 0.12, 0.36, 0.04, materials.cyan);
  box("medical-cross-h", 0, 2.75, -17.14, 0.36, 0.12, 0.04, materials.cyan);

  // إضاءة سقف متكررة
  for (let z = 6; z >= -15; z -= 4) {
    box("ceiling-panel", 0, 3.34, z, 2.4, 0.035, 0.65, materials.glass);
  }

  // محطة التمريض: مكتب وشاشة
  box("station-desk", 3.5, 0.9, -1.2, 1.5, 0.15, 2.2, materials.trim);
  box("station-desk-front", 3.5, 0.45, -0.3, 1.5, 0.8, 0.12, materials.dark);
  box("station-screen", 3.45, 1.55, -1.2, 0.8, 0.55, 0.12, materials.dark, "nursing-station");
  box("station-screen-glow", 3.45, 1.56, -1.12, 0.68, 0.4, 0.025, materials.cyan);
  box("station-keyboard", 3.45, 1.02, -1.55, 0.6, 0.035, 0.24, materials.metal);

  // غرفة المريض الافتراضية بجوار الممر
  // سرير مبسط ظاهر من خلال المدخل
  box("patient-bed-frame", -3.25, 0.5, -7.3, 1.7, 0.12, 3.1, materials.metal);
  box("patient-mattress", -3.25, 0.68, -7.3, 1.62, 0.25, 3.0, materials.mattress);
  box("patient-pillow", -3.25, 0.86, -8.45, 0.95, 0.18, 0.5, materials.mattress);
  box("bed-headboard", -3.25, 1.0, -8.95, 1.8, 1.0, 0.12, materials.trim);
  box("bed-rail-left", -4.05, 0.95, -7.4, 0.06, 0.3, 2.4, materials.metal);
  box("bed-rail-right", -2.45, 0.95, -7.4, 0.06, 0.3, 2.4, materials.metal);
  for (const x of [-3.9, -2.6]) {
    for (const z of [-8.4, -6.2]) {
      cylinder("bed-leg", x, 0.23, z, 0.045, 0.045, 0.46, materials.metal);
    }
  }

  // مجسم مريض مبسط غير واقعي تشريحيًا
  const patient = new THREE.Group();
  patient.position.set(-3.25, 0, -7.2);
  scene.add(patient);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.3, 1.25), materials.clothes);
  torso.position.set(0, 0.98, 0.05);
  patient.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), materials.skin);
  head.position.set(0, 1.18, -0.73);
  patient.add(head);
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.25, 1.1), materials.clothes);
  blanket.position.set(0, 1.12, 0.43);
  patient.add(blanket);

  // جهاز مراقبة افتراضي
  box("monitor-stand", -4.25, 0.8, -6.4, 0.08, 1.6, 0.08, materials.metal);
  box("patient-monitor", -4.25, 1.75, -6.4, 0.65, 0.48, 0.16, materials.dark, "patient-monitor");
  box("patient-monitor-screen", -4.25, 1.76, -6.30, 0.53, 0.34, 0.025, materials.cyan, "patient-monitor");

  // أصيص نبات لإضفاء تفاصيل بصرية
  box("plant-pot", 3.9, 0.3, -14.5, 0.55, 0.6, 0.55, materials.trim);
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 8),
      materials.plant
    );
    leaf.scale.set(0.6, 1.5, 0.6);
    leaf.position.set(3.9 + Math.sin(i * 1.25) * 0.22, 0.8 + (i % 2) * 0.15, -14.5 + Math.cos(i * 1.25) * 0.22);
    scene.add(leaf);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function resize() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
  }

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactive, false);
    return hits.length ? hits[0].object : null;
  }

  function getNearby() {
    const origin = camera.position;
    let closest = null;
    let closestDistance = 2.7;

    for (const obj of interactive) {
      const distance = origin.distanceTo(obj.position);
      if (distance < closestDistance) {
        closest = obj;
        closestDistance = distance;
      }
    }
    return closest;
  }

  function animate() {
    renderer.render(scene, camera);
  }

  function dispose() {
    renderer.dispose();
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(mat => mat.dispose());
      }
    });
  }

  window.addEventListener("resize", resize);

  return {
    THREE, scene, camera, renderer, interactive,
    pick, getNearby, animate, resize, dispose,
    getLocation() {
      if (camera.position.z < -5) return "منطقة غرف المرضى";
      if (camera.position.x > 2.5) return "محطة التمريض";
      return "الممر الرئيسي";
    }
  };
}
