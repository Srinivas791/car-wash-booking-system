/**
 * AquaSpark 3D Vehicle Wash Simulation Engine
 * Three.js Procedural Vehicle Generator & Multi-stage Wash FX
 */

class CarWashStudio {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.carGroup = null;
    this.carType = 'sedan'; // hatchback, sedan, suv, luxury
    this.paintColor = 0x0070f3; // Default Royal Blue
    this.dirtLevel = 0.65; // 0 to 1

    // Materials
    this.bodyMaterial = null;
    this.glassMaterial = null;
    this.wheelMaterial = null;
    this.rimMaterial = null;
    this.chromeMaterial = null;

    // Particle FX
    this.waterParticles = null;
    this.foamParticles = null;
    this.sparkleParticles = null;
    this.airParticles = null;
    this.washBrushesGroup = null;

    // Animation state
    this.currentWashStage = 'idle'; // idle, water, foam, scrub, dry, polish
    this.isAutoWashing = false;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a101f);
    this.scene.fog = new THREE.FogExp2(0x0a101f, 0.04);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(5.5, 2.6, 6.2);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls (Support both THREE.OrbitControls and window.OrbitControls, plus fallback drag)
    const OrbitClass = (window.THREE && window.THREE.OrbitControls) || window.OrbitControls;
    if (OrbitClass) {
      this.controls = new OrbitClass(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
      this.controls.minDistance = 3.5;
      this.controls.maxDistance = 12;
      this.controls.target.set(0, 0.8, 0);
    } else {
      this.setupFallbackDragControls();
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Environment & Wash Bay Studio
    this.setupEnvironment();

    // 7. Materials & Car Model
    this.setupMaterials();
    this.buildCar(this.carType);

    // 8. Particle Systems
    this.setupParticleSystems();

    // 9. Wash Brushes
    this.setupWashBrushes();

    // 10. Fallback drag controls method
  }

  setupFallbackDragControls() {
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let theta = Math.PI / 4;
    let phi = Math.PI / 6;
    const radius = 8.5;

    const updateCameraPos = () => {
      this.camera.position.x = radius * Math.cos(phi) * Math.sin(theta);
      this.camera.position.y = Math.max(0.5, radius * Math.sin(phi));
      this.camera.position.z = radius * Math.cos(phi) * Math.cos(theta);
      this.camera.lookAt(0, 0.8, 0);
    };

    this.renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    this.renderer.domElement.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      theta -= deltaX * 0.008;
      phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, phi + deltaY * 0.008));
      updateCameraPos();
    });

    // Touch support
    this.renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    this.renderer.domElement.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      theta -= deltaX * 0.008;
      phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, phi + deltaY * 0.008));
      updateCameraPos();
    });

    window.addEventListener('touchend', () => { isDragging = false; });
  }
    window.addEventListener('resize', () => this.onWindowResize());

    // 11. Render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Key studio light (Sun / Overhead wash spotlight)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.6);
    mainLight.position.set(6, 9, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 25;
    mainLight.shadow.camera.left = -6;
    mainLight.shadow.camera.right = 6;
    mainLight.shadow.camera.top = 6;
    mainLight.shadow.camera.bottom = -6;
    mainLight.shadow.bias = -0.0005;
    this.scene.add(mainLight);

    // Cyan Neon Accent Fill Light
    const cyanLight = new THREE.DirectionalLight(0x00d2ff, 1.1);
    cyanLight.position.set(-6, 4, -4);
    this.scene.add(cyanLight);

    // Warm saffron rear rim light
    const rimLight = new THREE.PointLight(0xff8c42, 1.2, 18);
    rimLight.position.set(0, 3, -5.5);
    this.scene.add(rimLight);

    // Floor underglow strip
    const underGlow = new THREE.PointLight(0x00d2ff, 1.0, 8);
    underGlow.position.set(0, 0.1, 0);
    this.scene.add(underGlow);
  }

  setupEnvironment() {
    // Studio Floor Grid & Reflective Platform
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.25,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Wash bay neon platform ring
    const ringGeo = new THREE.RingGeometry(2.8, 3.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);

    // Wash bay overhead arches / LED studio light rectangles
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });
    const lightBarMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

    for (let z = -2.5; z <= 2.5; z += 2.5) {
      const arch = new THREE.Group();
      
      // Left pillar
      const pLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2), archMat);
      pLeft.position.set(-2.6, 1.6, z);
      arch.add(pLeft);

      // Right pillar
      const pRight = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2), archMat);
      pRight.position.set(2.6, 1.6, z);
      arch.add(pRight);

      // Top bar
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.08, 0.12), archMat);
      topBar.position.set(0, 3.2, z);
      arch.add(topBar);

      // LED Light bar
      const ledBar = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.02, 0.06), lightBarMat);
      ledBar.position.set(0, 3.15, z);
      arch.add(ledBar);

      this.scene.add(arch);
    }
  }

  setupMaterials() {
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.paintColor,
      metalness: 0.75,
      roughness: 0.25,
      envMapIntensity: 1.2
    });

    this.glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.08,
      transparent: true,
      opacity: 0.82
    });

    this.wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.1
    });

    this.rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.9,
      roughness: 0.2
    });

    this.chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.1
    });

    this.updateDirtAppearance();
  }

  updateDirtAppearance() {
    if (!this.bodyMaterial) return;

    if (this.currentWashStage === 'foam') {
      this.bodyMaterial.color.setHex(0xf8fafc);
      this.bodyMaterial.roughness = 0.95;
      this.bodyMaterial.metalness = 0.05;
      return;
    }

    // Blend car paint based on dirt level
    const baseColor = new THREE.Color(this.paintColor);
    const dirtColor = new THREE.Color(0x6b4423); // Mud / road dust

    baseColor.lerp(dirtColor, this.dirtLevel * 0.7);
    this.bodyMaterial.color.copy(baseColor);
    this.bodyMaterial.roughness = 0.18 + this.dirtLevel * 0.65;
    this.bodyMaterial.metalness = Math.max(0.1, 0.8 - this.dirtLevel * 0.6);
  }

  setCarPaint(hex) {
    this.paintColor = hex;
    this.updateDirtAppearance();
  }

  setDirtLevel(val) {
    this.dirtLevel = Math.max(0, Math.min(1, val));
    this.updateDirtAppearance();
  }

  buildCar(type) {
    if (this.carGroup) {
      this.scene.remove(this.carGroup);
    }

    this.carType = type;
    this.carGroup = new THREE.Group();

    // Dimensions based on Indian vehicle types
    let length = 4.2;
    let width = 1.85;
    let bodyHeight = 0.65;
    let cabinHeight = 0.62;
    let wheelRadius = 0.38;
    let groundClearance = 0.38;

    if (type === 'hatchback') {
      length = 3.6;
      width = 1.75;
      bodyHeight = 0.62;
      cabinHeight = 0.65;
      wheelRadius = 0.35;
    } else if (type === 'sedan') {
      length = 4.4;
      width = 1.82;
      bodyHeight = 0.60;
      cabinHeight = 0.58;
      wheelRadius = 0.38;
    } else if (type === 'suv') {
      length = 4.55;
      width = 1.95;
      bodyHeight = 0.85;
      cabinHeight = 0.78;
      wheelRadius = 0.44;
      groundClearance = 0.48;
    } else if (type === 'luxury') {
      length = 4.75;
      width = 1.92;
      bodyHeight = 0.55;
      cabinHeight = 0.52;
      wheelRadius = 0.40;
      groundClearance = 0.34;
    }

    // 1. Lower Chassis & Body Shell
    const bodyGeo = new THREE.BoxGeometry(width, bodyHeight, length);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.bodyMaterial);
    bodyMesh.position.y = groundClearance + bodyHeight / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.carGroup.add(bodyMesh);

    // 2. Hood Slope
    const hoodGeo = new THREE.BoxGeometry(width - 0.05, 0.18, length * 0.3);
    const hoodMesh = new THREE.Mesh(hoodGeo, this.bodyMaterial);
    hoodMesh.position.set(0, groundClearance + bodyHeight + 0.05, length * 0.28);
    hoodMesh.rotation.x = 0.08;
    hoodMesh.castShadow = true;
    this.carGroup.add(hoodMesh);

    // 3. Cabin & Glass Canopy
    const cabinLength = type === 'hatchback' ? length * 0.58 : (type === 'suv' ? length * 0.62 : length * 0.5);
    const cabinZ = type === 'hatchback' ? -0.2 : (type === 'suv' ? -0.15 : -0.1);
    
    const cabinGeo = new THREE.BoxGeometry(width - 0.22, cabinHeight, cabinLength);
    const cabinMesh = new THREE.Mesh(cabinGeo, this.glassMaterial);
    cabinMesh.position.set(0, groundClearance + bodyHeight + cabinHeight / 2, cabinZ);
    cabinMesh.castShadow = true;
    this.carGroup.add(cabinMesh);

    // 4. Roof Plate
    const roofGeo = new THREE.BoxGeometry(width - 0.26, 0.08, cabinLength - 0.1);
    const roofMesh = new THREE.Mesh(roofGeo, this.bodyMaterial);
    roofMesh.position.set(0, groundClearance + bodyHeight + cabinHeight + 0.02, cabinZ);
    roofMesh.castShadow = true;
    this.carGroup.add(roofMesh);

    // 5. Front Grille with Chrome Trim
    const grilleGeo = new THREE.BoxGeometry(width * 0.65, 0.24, 0.1);
    const grilleMesh = new THREE.Mesh(grilleGeo, this.chromeMaterial);
    grilleMesh.position.set(0, groundClearance + bodyHeight * 0.5, length / 2 + 0.02);
    this.carGroup.add(grilleMesh);

    // 6. LED Headlamps (Front)
    const headlampGeo = new THREE.BoxGeometry(0.35, 0.15, 0.08);
    const headlampMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });

    const hlLeft = new THREE.Mesh(headlampGeo, headlampMat);
    hlLeft.position.set(-width * 0.38, groundClearance + bodyHeight * 0.72, length / 2 + 0.02);
    this.carGroup.add(hlLeft);

    const hlRight = new THREE.Mesh(headlampGeo, headlampMat);
    hlRight.position.set(width * 0.38, groundClearance + bodyHeight * 0.72, length / 2 + 0.02);
    this.carGroup.add(hlRight);

    // 7. Taillights (Rear)
    const tailGeo = new THREE.BoxGeometry(0.38, 0.12, 0.06);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const tlLeft = new THREE.Mesh(tailGeo, tailMat);
    tlLeft.position.set(-width * 0.38, groundClearance + bodyHeight * 0.72, -length / 2 - 0.02);
    this.carGroup.add(tlLeft);

    const tlRight = new THREE.Mesh(tailGeo, tailMat);
    tlRight.position.set(width * 0.38, groundClearance + bodyHeight * 0.72, -length / 2 - 0.02);
    this.carGroup.add(tlRight);

    // 8. License Plate (Indian Format: IND • DL 01 AB 2026)
    const plateGeo = new THREE.BoxGeometry(0.55, 0.16, 0.04);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const plateFront = new THREE.Mesh(plateGeo, plateMat);
    plateFront.position.set(0, groundClearance + 0.15, length / 2 + 0.04);
    this.carGroup.add(plateFront);

    // 9. Wheels & Tires (4 wheels)
    const wheelOffsetZ = length * 0.34;
    const wheelOffsetX = width / 2 + 0.02;

    const wheelPositions = [
      [-wheelOffsetX, wheelRadius, wheelOffsetZ], // Front Left
      [wheelOffsetX, wheelRadius, wheelOffsetZ],  // Front Right
      [-wheelOffsetX, wheelRadius, -wheelOffsetZ], // Rear Left
      [wheelOffsetX, wheelRadius, -wheelOffsetZ],  // Rear Right
    ];

    this.wheels = [];
    wheelPositions.forEach((pos, idx) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(...pos);

      // Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.28, 24);
      const tireMesh = new THREE.Mesh(tireGeo, this.wheelMaterial);
      tireMesh.rotation.z = Math.PI / 2;
      tireMesh.castShadow = true;
      wheelAssembly.add(tireMesh);

      // Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, 0.30, 16);
      const rimMesh = new THREE.Mesh(rimGeo, this.rimMaterial);
      rimMesh.rotation.z = Math.PI / 2;
      wheelAssembly.add(rimMesh);

      // Disc Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.15, 0.15);
      const caliperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
      const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat);
      caliperMesh.position.set(idx % 2 === 0 ? 0.05 : -0.05, 0.1, 0);
      wheelAssembly.add(caliperMesh);

      this.carGroup.add(wheelAssembly);
      this.wheels.push(wheelAssembly);
    });

    // 10. Side Mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.22, 0.12, 0.15);
    const mLeft = new THREE.Mesh(mirrorGeo, this.bodyMaterial);
    mLeft.position.set(-width / 2 - 0.12, groundClearance + bodyHeight + 0.2, length * 0.12);
    this.carGroup.add(mLeft);

    const mRight = new THREE.Mesh(mirrorGeo, this.bodyMaterial);
    mRight.position.set(width / 2 + 0.12, groundClearance + bodyHeight + 0.2, length * 0.12);
    this.carGroup.add(mRight);

    this.scene.add(this.carGroup);
  }

  setupParticleSystems() {
    // 1. Water Jet Particles (High-pressure spray)
    const waterCount = 800;
    const waterGeo = new THREE.BufferGeometry();
    const waterPos = new Float32Array(waterCount * 3);
    const waterVel = [];

    for (let i = 0; i < waterCount; i++) {
      waterPos[i * 3] = (Math.random() - 0.5) * 4;
      waterPos[i * 3 + 1] = 2.5 + Math.random() * 1.5;
      waterPos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      waterVel.push({
        x: (Math.random() - 0.5) * 0.05,
        y: -0.15 - Math.random() * 0.2,
        z: (Math.random() - 0.5) * 0.05
      });
    }

    waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    const waterMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.065,
      transparent: true,
      opacity: 0.85
    });

    this.waterParticles = new THREE.Points(waterGeo, waterMat);
    this.waterParticles.userData = { vel: waterVel };
    this.waterParticles.visible = false;
    this.scene.add(this.waterParticles);

    // 2. Snow Foam Bath Particles
    const foamCount = 600;
    const foamGeo = new THREE.BufferGeometry();
    const foamPos = new Float32Array(foamCount * 3);
    for (let i = 0; i < foamCount * 3; i++) {
      foamPos[i] = (Math.random() - 0.5) * 3.5;
    }
    foamGeo.setAttribute('position', new THREE.BufferAttribute(foamPos, 3));
    const foamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.14,
      transparent: true,
      opacity: 0.95
    });
    this.foamParticles = new THREE.Points(foamGeo, foamMat);
    this.foamParticles.visible = false;
    this.scene.add(this.foamParticles);

    // 3. Ceramic Sparkle Stars
    const sparkleCount = 150;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      sparklePos[i * 3] = (Math.random() - 0.5) * 3.8;
      sparklePos[i * 3 + 1] = 0.5 + Math.random() * 1.8;
      sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xfff176,
      size: 0.12,
      transparent: true,
      opacity: 0.9
    });
    this.sparkleParticles = new THREE.Points(sparkleGeo, sparkleMat);
    this.sparkleParticles.visible = false;
    this.scene.add(this.sparkleParticles);

    // 4. Hot Air Dryer Mist Particles
    const airCount = 450;
    const airGeo = new THREE.BufferGeometry();
    const airPos = new Float32Array(airCount * 3);
    for (let i = 0; i < airCount * 3; i++) {
      airPos[i] = (Math.random() - 0.5) * 4;
    }
    airGeo.setAttribute('position', new THREE.BufferAttribute(airPos, 3));
    const airMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    this.airParticles = new THREE.Points(airGeo, airMat);
    this.airParticles.visible = false;
    this.scene.add(this.airParticles);
  }

  setupWashBrushes() {
    this.washBrushesGroup = new THREE.Group();

    // Two big vertical spinning scrub cylinders (soft microfiber blue bristles)
    const brushGeo = new THREE.CylinderGeometry(0.38, 0.38, 2.0, 16);
    const brushMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: true
    });

    const brushLeft = new THREE.Mesh(brushGeo, brushMat);
    brushLeft.position.set(-1.45, 1.3, 0);
    this.washBrushesGroup.add(brushLeft);

    const brushRight = new THREE.Mesh(brushGeo, brushMat);
    brushRight.position.set(1.45, 1.3, 0);
    this.washBrushesGroup.add(brushRight);

    this.washBrushesGroup.visible = false;
    this.scene.add(this.washBrushesGroup);
  }

  setWashStage(stage) {
    this.currentWashStage = stage;

    // Reset visibility
    this.waterParticles.visible = false;
    this.foamParticles.visible = false;
    this.washBrushesGroup.visible = false;
    this.airParticles.visible = false;
    this.sparkleParticles.visible = false;

    if (stage === 'water') {
      this.waterParticles.visible = true;
      if (window.soundSystem) window.soundSystem.playWaterSpray();
      this.setDirtLevel(Math.max(0.15, this.dirtLevel - 0.35));
    } else if (stage === 'foam') {
      this.foamParticles.visible = true;
      this.updateDirtAppearance();
      if (window.soundSystem) window.soundSystem.playFoamBubble();
    } else if (stage === 'scrub') {
      this.washBrushesGroup.visible = true;
      this.setDirtLevel(0.1);
      if (window.soundSystem) window.soundSystem.playWaterSpray(1.0);
    } else if (stage === 'dry') {
      this.airParticles.visible = true;
      this.setDirtLevel(0.0);
      if (window.soundSystem) window.soundSystem.playAirBlower();
    } else if (stage === 'polish') {
      this.sparkleParticles.visible = true;
      this.setDirtLevel(0.0);
      if (this.bodyMaterial) {
        this.bodyMaterial.roughness = 0.08;
        this.bodyMaterial.metalness = 0.92;
      }
      if (window.soundSystem) window.soundSystem.playSparkle();
    } else {
      this.updateDirtAppearance();
    }
  }

  startAutoWash(onProgress, onComplete) {
    if (this.isAutoWashing) return;
    this.isAutoWashing = true;

    // Start with muddy car
    this.setDirtLevel(0.9);

    const stages = ['water', 'foam', 'scrub', 'dry', 'polish'];
    let idx = 0;

    const runNextStage = () => {
      if (idx < stages.length) {
        const stage = stages[idx];
        this.setWashStage(stage);
        if (onProgress) onProgress(stage, idx + 1, stages.length);
        idx++;
        setTimeout(runNextStage, 2200);
      } else {
        this.isAutoWashing = false;
        if (onComplete) onComplete();
      }
    };

    runNextStage();
  }

  setCameraAngle(anglePreset) {
    if (!this.controls) return;

    if (anglePreset === 'front') {
      this.camera.position.set(0, 1.4, 5.5);
    } else if (anglePreset === 'side') {
      this.camera.position.set(6.2, 1.2, 0);
    } else if (anglePreset === 'iso') {
      this.camera.position.set(5.5, 2.6, 6.2);
    } else if (anglePreset === 'top') {
      this.camera.position.set(0.1, 8.5, 0.1);
    } else if (anglePreset === 'wheel') {
      this.camera.position.set(2.4, 0.6, 2.4);
    }
    this.controls.target.set(0, 0.8, 0);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Subtle gentle car idle bounce/sway
    if (this.carGroup && !this.isAutoWashing) {
      this.carGroup.position.y = Math.sin(time * 1.5) * 0.015;
    }

    // 1. Water particle animation
    if (this.waterParticles && this.waterParticles.visible) {
      const positions = this.waterParticles.geometry.attributes.position.array;
      const vels = this.waterParticles.userData.vel;
      for (let i = 0; i < vels.length; i++) {
        positions[i * 3 + 1] += vels[i].y;
        if (positions[i * 3 + 1] < 0.1) {
          positions[i * 3 + 1] = 3.5 + Math.random();
        }
      }
      this.waterParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Foam animation
    if (this.foamParticles && this.foamParticles.visible) {
      const positions = this.foamParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.02;
        if (positions[i + 1] < 0.1) {
          positions[i + 1] = 2.8 + Math.random() * 0.5;
        }
      }
      this.foamParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Wash Brushes spinning & moving along the car
    if (this.washBrushesGroup && this.washBrushesGroup.visible) {
      this.washBrushesGroup.children.forEach(b => {
        b.rotation.y += 0.25;
      });
      this.washBrushesGroup.position.z = Math.sin(time * 3.5) * 1.6;
    }

    // 4. Sparkle animation
    if (this.sparkleParticles && this.sparkleParticles.visible) {
      this.sparkleParticles.rotation.y += 0.02;
    }

    // Controls update
    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global exposure
window.CarWashStudio = CarWashStudio;
