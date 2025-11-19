// Game Variables
let scene, camera, renderer, plane;
let clouds = [];
let obstacles = [];
let terrain;
let speed = 100;
let altitude = 500;
let pitch = 0;
let roll = 0;
let yaw = 0;
let score = 0;
let collisionWarning = false;

// Control Variables
const keys = {};
const MIN_SPEED = 50;
const MAX_SPEED = 300;
const SPEED_INCREMENT = 2;
const ROTATION_SPEED = 0.02;
const MAX_PITCH = 60;
const MAX_ROLL = 60;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 100, 2000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.set(0, 5, -20);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadow;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Create plane
    createPlane();
    
    // Create environment
    createTerrain();
    createClouds();
    createObstacles();
    createSky();
    
    // Event listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        keys[e.code] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        keys[e.code] = false;
    });
    
    window.addEventListener('resize', onWindowResize);
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1000);
    
    // Start animation loop
    animate();
}

function createPlane() {
    const planeGroup = new THREE.Group();
    
    // Fuselage (horizontal cylinder along Z axis)
    const fuselageGeometry = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
    const fuselageMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff4444,
        shininess: 100
    });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    planeGroup.add(fuselage);
    
    // Nose cone (pointing forward along Z axis)
    const noseGeometry = new THREE.ConeGeometry(0.8, 2, 16);
    const nose = new THREE.Mesh(noseGeometry, fuselageMaterial);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 5;
    nose.castShadow = true;
    planeGroup.add(nose);
    
    // Tail cone (pointing backward along Z axis)
    const tailGeometry = new THREE.ConeGeometry(0.6, 1.5, 16);
    const tail = new THREE.Mesh(tailGeometry, fuselageMaterial);
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -4.5;
    tail.castShadow = true;
    planeGroup.add(tail);
    
    // Wings (horizontal, perpendicular to fuselage)
    const wingGeometry = new THREE.BoxGeometry(16, 0.3, 3);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.z = 0;
    wings.castShadow = true;
    planeGroup.add(wings);
    
    // Tail wing (horizontal stabilizer)
    const tailWingGeometry = new THREE.BoxGeometry(6, 0.2, 2);
    const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
    tailWing.position.set(0, 0, -3.5);
    tailWing.castShadow = true;
    planeGroup.add(tailWing);
    
    // Vertical stabilizer
    const vertStabGeometry = new THREE.BoxGeometry(2, 3, 0.2);
    const vertStab = new THREE.Mesh(vertStabGeometry, wingMaterial);
    vertStab.position.set(0, 1.5, -3.5);
    vertStab.castShadow = true;
    planeGroup.add(vertStab);
    
    // Cockpit canopy
    const canopyGeometry = new THREE.SphereGeometry(1, 16, 16, 0, Math.PI);
    const canopyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00aaff,
        transparent: true,
        opacity: 0.7,
        shininess: 100
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.rotation.x = Math.PI / 2;
    canopy.position.set(0, 0.8, 2);
    canopy.scale.set(0.8, 1, 1);
    planeGroup.add(canopy);
    
    // Propeller
    const propGeometry = new THREE.BoxGeometry(6, 0.5, 0.2);
    const propMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const propeller = new THREE.Mesh(propGeometry, propMaterial);
    propeller.position.z = 6.2;
    propeller.name = 'propeller';
    planeGroup.add(propeller);
    
    plane = planeGroup;
    plane.position.set(0, altitude, 0);
    scene.add(plane);
}

function createTerrain() {
    // Ground plane with texture
    const groundGeometry = new THREE.PlaneGeometry(5000, 5000, 50, 50);
    const vertices = groundGeometry.attributes.position.array;
    
    // Add some height variation
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.random() * 20 - 10;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x228B22,
        flatShading: true
    });
    terrain = new THREE.Mesh(groundGeometry, groundMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -50;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    // Add water
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    const waterMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1E90FF,
        transparent: true,
        opacity: 0.6,
        shininess: 100
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(1000, -48, 1000);
    scene.add(water);
}

function createClouds() {
    for (let i = 0; i < 50; i++) {
        const cloudGroup = new THREE.Group();
        
        // Create cloud from multiple spheres
        for (let j = 0; j < 5; j++) {
            const cloudGeometry = new THREE.SphereGeometry(
                Math.random() * 20 + 10,
                8,
                8
            );
            const cloudMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.7
            });
            const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloudPart.position.set(
                Math.random() * 40 - 20,
                Math.random() * 10,
                Math.random() * 40 - 20
            );
            cloudGroup.add(cloudPart);
        }
        
        cloudGroup.position.set(
            Math.random() * 4000 - 2000,
            Math.random() * 300 + 200,
            Math.random() * 4000 - 2000
        );
        
        clouds.push(cloudGroup);
        scene.add(cloudGroup);
    }
}

function createObstacles() {
    // Create yellow cone balloons scattered throughout the sky
    
    for (let i = 0; i < 40; i++) {
        const balloonGroup = new THREE.Group();
        
        // Balloon cone (top part)
        const coneGeometry = new THREE.ConeGeometry(6, 18, 16);
        const balloonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            shininess: 100,
            emissive: 0xffff00,
            emissiveIntensity: 0.2
        });
        const cone = new THREE.Mesh(coneGeometry, balloonMaterial);
        cone.position.y = 9;
        cone.castShadow = true;
        balloonGroup.add(cone);
        
        // Balloon sphere (rounded top)
        const sphereGeometry = new THREE.SphereGeometry(6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const sphere = new THREE.Mesh(sphereGeometry, balloonMaterial);
        sphere.position.y = 18;
        sphere.castShadow = true;
        balloonGroup.add(sphere);
        
        // String hanging down
        const stringGeometry = new THREE.CylinderGeometry(0.2, 0.2, 15, 8);
        const stringMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333
        });
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.position.y = -7.5;
        balloonGroup.add(string);
        
        // Small weight at the bottom
        const weightGeometry = new THREE.SphereGeometry(1, 8, 8);
        const weightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666
        });
        const weight = new THREE.Mesh(weightGeometry, weightMaterial);
        weight.position.y = -15;
        weight.castShadow = true;
        balloonGroup.add(weight);
        
        // Position balloons randomly in the sky
        balloonGroup.position.set(
            Math.random() * 3000 - 1500,
            Math.random() * 300 + 100,
            Math.random() * 3000 + 200
        );
        
        // Add slight random rotation for variety
        balloonGroup.rotation.y = Math.random() * Math.PI * 2;
        
        balloonGroup.userData = { 
            type: 'balloon', 
            radius: 7,
            bobSpeed: Math.random() * 0.02 + 0.01,
            bobOffset: Math.random() * Math.PI * 2
        };
        obstacles.push(balloonGroup);
        scene.add(balloonGroup);
    }
}

function createSky() {
    const skyGeometry = new THREE.SphereGeometry(5000, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

function checkCollisions() {
    collisionWarning = false;
    
    obstacles.forEach(obstacle => {
        if (obstacle.userData.type === 'balloon') {
            const distance = plane.position.distanceTo(obstacle.position);
            
            // Warning zone
            if (distance < obstacle.userData.radius + 15) {
                collisionWarning = true;
            }
            
            // Collision! Crash the plane
            if (distance < obstacle.userData.radius + 3) {
                crashPlane(obstacle);
            }
        }
    });
}

function crashPlane(balloon) {
    // Make balloon explode visually
    balloon.children.forEach(child => {
        if (child.material) {
            child.material.emissive = new THREE.Color(0xff0000);
            child.material.emissiveIntensity = 1;
        }
    });
    
    // Stop plane movement
    speed = 0;
    
    // Show crash message
    showCrashScreen();
    
    // Reset after delay
    setTimeout(() => {
        resetGame();
    }, 3000);
}

function showCrashScreen() {
    const crashDiv = document.createElement('div');
    crashDiv.id = 'crash-screen';
    crashDiv.innerHTML = `
        <h1>💥 CRASH! 💥</h1>
        <h2>You hit a balloon!</h2>
        <p>Final Score: ${score} points</p>
        <p>Restarting in 3 seconds...</p>
    `;
    crashDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        color: white;
        font-family: 'Courier New', monospace;
        text-shadow: 0 0 20px #000;
    `;
    crashDiv.querySelector('h1').style.cssText = 'font-size: 64px; margin: 20px; animation: pulse 0.5s infinite;';
    crashDiv.querySelector('h2').style.cssText = 'font-size: 32px; margin: 10px;';
    crashDiv.querySelector('p').style.cssText = 'font-size: 24px; margin: 10px;';
    
    document.body.appendChild(crashDiv);
    
    setTimeout(() => {
        if (crashDiv.parentNode) {
            crashDiv.parentNode.removeChild(crashDiv);
        }
    }, 3000);
}

function resetGame() {
    // Reset plane position
    plane.position.set(0, 500, 0);
    plane.rotation.set(0, 0, 0);
    
    // Reset flight parameters
    speed = 100;
    altitude = 500;
    pitch = 0;
    roll = 0;
    yaw = 0;
    score = 0;
    
    // Reset balloon colors
    obstacles.forEach(obstacle => {
        if (obstacle.userData.type === 'balloon') {
            obstacle.children.forEach(child => {
                if (child.material && child.material.color) {
                    if (child.material.color.getHex() !== 0x333333 && 
                        child.material.color.getHex() !== 0x666666) {
                        child.material.emissive = new THREE.Color(0xffff00);
                        child.material.emissiveIntensity = 0.2;
                    }
                }
            });
        }
    });
}

function handleControls() {
    // Speed control
    if (keys['shift'] || keys['ShiftLeft'] || keys['ShiftRight']) {
        speed = Math.min(speed + SPEED_INCREMENT, MAX_SPEED);
    }
    if (keys['control'] || keys['ControlLeft'] || keys['ControlRight']) {
        speed = Math.max(speed - SPEED_INCREMENT, MIN_SPEED);
    }
    
    // Pitch control (Arrow Up/Down)
    if (keys['ArrowUp']) {
        pitch = Math.max(pitch - 1, -MAX_PITCH);
    }
    if (keys['ArrowDown']) {
        pitch = Math.min(pitch + 1, MAX_PITCH);
    }
    
    // Roll control (Arrow Left/Right)
    if (keys['ArrowLeft']) {
        roll = Math.max(roll - 1, -MAX_ROLL);
    }
    if (keys['ArrowRight']) {
        roll = Math.min(roll + 1, MAX_ROLL);
    }
    
    // Yaw control (E/Q) - swapped
    if (keys['e']) {
        yaw -= 1;
    }
    if (keys['q']) {
        yaw += 1;
    }
    
    // Apply damping when no keys are pressed
    if (!keys['ArrowUp'] && !keys['ArrowDown']) {
        pitch *= 0.95;
    }
    if (!keys['ArrowLeft'] && !keys['ArrowRight']) {
        roll *= 0.95;
    }
    
    // Update plane rotation
    plane.rotation.x = THREE.MathUtils.degToRad(pitch);
    plane.rotation.z = THREE.MathUtils.degToRad(roll);
    plane.rotation.y = THREE.MathUtils.degToRad(yaw);
    
    // Move plane forward based on speed and rotation
    const moveSpeed = speed * 0.02;
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(plane.quaternion);
    
    plane.position.add(forward.multiplyScalar(moveSpeed));
    
    // Update altitude (limit minimum altitude)
    altitude = Math.max(plane.position.y, 10);
    plane.position.y = altitude;
    
    // Rotate propeller
    const propeller = plane.getObjectByName('propeller');
    if (propeller) {
        propeller.rotation.z += speed * 0.01;
    }
}

function updateCamera() {
    // Camera follows plane from behind
    const cameraOffset = new THREE.Vector3(0, 5, -20);
    cameraOffset.applyQuaternion(plane.quaternion);
    
    camera.position.lerp(
        plane.position.clone().add(cameraOffset),
        0.1
    );
    
    camera.lookAt(plane.position);
}

function updateHUD() {
    document.getElementById('speed').textContent = Math.round(speed);
    document.getElementById('altitude').textContent = Math.round(altitude);
    document.getElementById('pitch').textContent = Math.round(pitch);
    document.getElementById('roll').textContent = Math.round(roll);
    document.getElementById('yaw').textContent = Math.round(yaw) % 360;
    document.getElementById('score').textContent = score;
    
    // Update collision warning indicator
    const hudPanel = document.querySelector('.hud-panel');
    if (collisionWarning) {
        hudPanel.style.borderColor = '#ff0000';
        hudPanel.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8)';
    } else {
        hudPanel.style.borderColor = '#00ff00';
        hudPanel.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    handleControls();
    checkCollisions();
    updateCamera();
    updateHUD();
    
    // Animate clouds slightly
    clouds.forEach((cloud, index) => {
        cloud.position.x += 0.1;
        if (cloud.position.x > 2000) {
            cloud.position.x = -2000;
        }
    });
    
    // Animate balloons - gentle bobbing motion
    const time = Date.now() * 0.001;
    obstacles.forEach(obstacle => {
        if (obstacle.userData.type === 'balloon') {
            const bobHeight = Math.sin(time * obstacle.userData.bobSpeed + obstacle.userData.bobOffset) * 3;
            obstacle.position.y += (bobHeight - (obstacle.userData.lastBob || 0)) * 0.1;
            obstacle.userData.lastBob = bobHeight;
            
            // Gentle rotation
            obstacle.rotation.y += 0.002;
        }
    });
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the game when page loads
window.addEventListener('load', init);
