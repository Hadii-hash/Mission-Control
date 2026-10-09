import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('space');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 3);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

container.appendChild(renderer.domElement);

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 6;

const textureLoader = new THREE.TextureLoader();

const earthTexture = textureLoader.load(
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
);

const earthGeometry = new THREE.SphereGeometry(
    1,
    64,
    64
);

const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture
});

const earth = new THREE.Mesh(
    earthGeometry,
    earthMaterial
);

scene.add(earth);

//MOON

const moonCanvas = document.createElement('canvas');
moonCanvas.width = 512;
moonCanvas.height = 256;

const moonContext = moonCanvas.getContext('2d');

moonContext.fillStyle = '#999792';
moonContext.fillRect(0, 0, 512, 256);

// Add subtle lunar craters
for (let i = 0; i < 180; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const radius = 2 + Math.random() * 12;

    moonContext.beginPath();
    moonContext.arc(x, y, radius, 0, Math.PI * 2);
    moonContext.fillStyle = 'rgba(45, 45, 45, 0.16)';
    moonContext.fill();

    moonContext.beginPath();
    moonContext.arc(
        x - radius * 0.2,
        y - radius * 0.2,
        radius * 0.7,
        0,
        Math.PI * 2
    );
    moonContext.fillStyle = 'rgba(230, 230, 220, 0.15)';
    moonContext.fill();
}

const moonTexture = new THREE.CanvasTexture(moonCanvas);

const moonGeometry = new THREE.SphereGeometry(0.3, 48, 48);
const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    roughness: 1
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(1.5, 0, 0);
scene.add(moon);
let moonAngle = 0;



// SATELLITE

const satellite = new THREE.Group();

const satelliteBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.08, 0.08),
    new THREE.MeshPhongMaterial({
        color: 0xaaaaaa
    })
);

satellite.add(satelliteBody);


const panelMaterial = new THREE.MeshPhongMaterial({
    color: 0x224466
});


const leftPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.02, 0.12),
    panelMaterial
);

leftPanel.position.x = -0.18;

satellite.add(leftPanel);


const rightPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.02, 0.12),
    panelMaterial
);

rightPanel.position.x = 0.18;

satellite.add(rightPanel);


satellite.position.set(
    1.8,
    0.8,
    0
);

scene.add(satellite);
let satelliteAngle = 0;

let signalProgress = 0;
let signalActive = false;
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.3
);

scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunLight.position.set(5, 3, 5);

scene.add(sunLight);


function createMarker(latitude, longitude, label, subtitle) {
    const radius = 1.02;

    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const markerGeometry = new THREE.SphereGeometry(
        0.035,
        16,
        16
    );

    const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    const marker = new THREE.Mesh(
        markerGeometry,
        markerMaterial
    );

    marker.position.set(x, y, z);

    earth.add(marker);

    const pulseGeometry = new THREE.RingGeometry(
        0.045,
        0.055,
        32
    );

    const pulseMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    const pulse = new THREE.Mesh(
        pulseGeometry,
        pulseMaterial
    );

    pulse.position.copy(marker.position);

    earth.add(pulse);

    marker.userData.pulse = pulse;
    marker.userData.label = label;

    return marker;
}


const paris = createMarker(
    48.8566,
    2.3522,
    'PARIS',
    'EPITECH PARIS'
);
const connectionGeometry = new THREE.BufferGeometry();

const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0
});

const connectionLine = new THREE.Line(
    connectionGeometry,
    connectionMaterial
);
const signalGeometry = new THREE.SphereGeometry(
    0.025,
    12,
    12
);

const signalMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

const signal = new THREE.Mesh(
    signalGeometry,
    signalMaterial
);

signal.visible = false;

scene.add(signal);

scene.add(connectionLine);


function updateConnectionLine() {

    const satellitePosition =
        satellite.getWorldPosition(
            new THREE.Vector3()
        );

    const parisPosition =
        paris.getWorldPosition(
            new THREE.Vector3()
        );

    const points = [
        satellitePosition,
        parisPosition
    ];

    connectionGeometry.setFromPoints(points);
}


const islamabad = createMarker(
    33.6844,
    73.0479,
    'ISLAMABAD',
    'ORIGIN POINT'
);

const finland = createMarker(
    61.9241,
    25.7482,
    'FINLAND',
    'JUNCTION 2026'
);


const starsGeometry = new THREE.BufferGeometry();

const starCount = 3000;

const starPositions = new Float32Array(
    starCount * 3
);

for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] =
        (Math.random() - 0.5) * 200;
}

starsGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
        starPositions,
        3
    )
);

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08
});

const stars = new THREE.Points(
    starsGeometry,
    starsMaterial
);

scene.add(stars);
function updateLabel(marker, elementId) {
    const label = document.getElementById(elementId);

    const position = marker.position.clone();

    marker.parent.localToWorld(position);

    position.project(camera);

    const x = (position.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-position.y * 0.5 + 0.5) * window.innerHeight;

    label.style.left = `${x}px`;
    label.style.top = `${y}px`;

    if (position.z > 1) {
        label.style.opacity = '0';
    } else {
        label.style.opacity = '1';
    }
}

window.addEventListener('click', (event) => {

    mouse.x =
        (event.clientX / window.innerWidth) * 2 - 1;

    mouse.y =
        -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(
        satellite.children,
        true
    );

    if (hits.length > 0) {

    console.log('SATELLITE CONNECTED');

    connectionMaterial.opacity = 1;

    signalProgress = 0;
    signalActive = true;
    signal.visible = true;

}

});


function animate() {
    requestAnimationFrame(animate);

    earth.rotation.y += 0.001;

      satelliteAngle += 0.005;

satellite.position.x = Math.cos(satelliteAngle) * 1.8;
satellite.position.z = Math.sin(satelliteAngle) * 1.8;

moonAngle += 0.002;

moon.position.x = Math.cos(moonAngle) * 1.5;
moon.position.z = Math.sin(moonAngle) * 1.5;

updateConnectionLine();

if (signalActive) {

    const satellitePosition =
        satellite.getWorldPosition(
            new THREE.Vector3()
        );

    const parisPosition =
        paris.getWorldPosition(
            new THREE.Vector3()
        );

    signalProgress += 0.005;

    signal.position.lerpVectors(
        satellitePosition,
        parisPosition,
        signalProgress
    );

   if (signalProgress >= 1) {

    signalActive = false;

    signal.visible = false;

    connectionMaterial.opacity = 0;

    document
        .getElementById('contact-panel')
        .classList.add('active');

    console.log('COMMUNICATION LINK ESTABLISHED');

}

}


    const time = Date.now() * 0.003;

    [paris, islamabad, finland].forEach(
        (marker, index) => {

            const pulse = marker.userData.pulse;

            const scale =
                1 + Math.sin(time + index) * 0.5;

            pulse.scale.set(
                scale,
                scale,
                scale
            );

            pulse.material.opacity =
                0.5 - Math.sin(time + index) * 0.2;
        }
    );

    updateLabel(paris, 'paris-label');
    updateLabel(islamabad, 'islamabad-label');
    updateLabel(finland, 'finland-label');

    stars.rotation.y += 0.0001;

    controls.update();

    renderer.render(scene, camera);
}

animate();

document.getElementById('close-contact').addEventListener('click', () => {

    document
        .getElementById('contact-panel')
        .classList.remove('active');

});

const navigationItems =
    document.querySelectorAll('.hud-nav span');

const infoPanels =
    document.querySelectorAll('.info-panel');

navigationItems.forEach((item) => {

    item.addEventListener('click', () => {

        const panelId =
            item.dataset.panel;

        infoPanels.forEach((panel) => {
            panel.classList.remove('active');
        });

        document
            .getElementById(panelId)
            .classList.add('active');

    });

});


document.querySelectorAll('.close-info').forEach((button) => {

    button.addEventListener('click', () => {

        button
            .closest('.info-panel')
            .classList.remove('active');

    });

});

window.addEventListener('resize', () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );
});


const contactForm = document.getElementById('contact-form');
const transmissionStatus = document.getElementById('transmission-status');

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector(
        'button[type="submit"]'
    );

    const name = contactForm.querySelector(
        'input[type="text"]'
    ).value.trim();

    const email = contactForm.querySelector(
        'input[type="email"]'
    ).value.trim();

    const message = contactForm.querySelector(
        'textarea'
    ).value.trim();

    submitButton.disabled = true;
    submitButton.textContent = 'TRANSMITTING...';
    transmissionStatus.textContent = '';

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Transmission failed.');
        }

        transmissionStatus.textContent = 'TRANSMISSION SENT ✓';
        contactForm.reset();
    } catch (error) {
        transmissionStatus.textContent =
            error.message || 'TRANSMISSION FAILED. TRY AGAIN.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'SEND TRANSMISSION';
    }
});

 