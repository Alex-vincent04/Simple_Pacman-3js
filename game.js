let scene, camera, renderer;
let pacman, pacmanSpeed = 1;
let pellets = [];
let walls = [];
const mazeSize = 10;
const tileSize = 2;

let maze;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.OrthographicCamera(
    window.innerWidth / -40, window.innerWidth / 40,
    window.innerHeight / 40, window.innerHeight / -40,
    0.1, 1000
  );
  camera.position.set(0, 50, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, -1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 20, 0);
  scene.add(pointLight);

  generateMaze();

  // Pac-Man
  const pacmanGeo = new THREE.SphereGeometry(0.8, 16, 16, 0.2, Math.PI * 1.8, 0, Math.PI);
  const pacmanMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  pacman = new THREE.Mesh(pacmanGeo, pacmanMat);
  pacman.position.set(-8, 0.8, -8); // Starting position
  scene.add(pacman);

  window.addEventListener('keydown', handleKeys);
  window.addEventListener('resize', onWindowResize);
}

function generateMaze() {
  // Clear previous maze
  pellets.forEach(p => p && scene.remove(p.mesh));
  walls.forEach(w => scene.remove(w));
  pellets = [];
  walls = [];

  // Maze layout (randomized simple preset for demo)
  const mazeTemplate = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,1,0,1,0,1],
    [1,0,1,1,0,1,0,1,0,1],
    [1,0,0,1,0,0,0,1,0,1],
    [1,1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
  ];

  // Clone maze template to avoid modifying the original
  maze = mazeTemplate.map(row => [...row]);

  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      const x = (j - mazeSize / 2) * tileSize;
      const z = (i - mazeSize / 2) * tileSize;

      // Floor tile
      const tile = new THREE.Mesh(
        new THREE.PlaneGeometry(tileSize, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x222266 })
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(x, 0, z);
      scene.add(tile);

      if (maze[i][j] === 1) {
        // Wall
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(tileSize, tileSize, tileSize),
          new THREE.MeshStandardMaterial({ color: 0x3333ff })
        );
        wall.position.set(x, tileSize / 2, z);
        scene.add(wall);
        walls.push(wall);
      } else {
        // Pellet
        const pellet = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        pellet.position.set(x, 0.2, z);
        scene.add(pellet);
        pellets.push({ mesh: pellet, x: x, z: z });
      }
    }
  }
}

function handleKeys(event) {
  const key = event.key.toLowerCase();
  const dir = { x: 0, z: 0 };

  if (key === 'w') dir.z -= tileSize;
  else if (key === 's') dir.z += tileSize;
  else if (key === 'a') dir.x -= tileSize;
  else if (key === 'd') dir.x += tileSize;
  else return;

  const newX = pacman.position.x + dir.x;
  const newZ = pacman.position.z + dir.z;

  const mazeI = Math.floor((newZ + mazeSize) / tileSize + 0.5);
  const mazeJ = Math.floor((newX + mazeSize) / tileSize + 0.5);

  if (maze[mazeI] && maze[mazeI][mazeJ] === 0) {
    pacman.position.x = newX;
    pacman.position.z = newZ;
  }
}

function animate() {
  requestAnimationFrame(animate);

  // Pellet collection
  let collected = 0;
  pellets.forEach((pellet, i) => {
    if (pellet && pacman.position.distanceTo(pellet.mesh.position) < 1) {
      scene.remove(pellet.mesh);
      pellets[i] = null;
      collected++;
    }
  });

  // If all pellets are collected
  if (pellets.filter(p => p !== null).length === 0) {
    generateMaze();
    pacman.position.set(-8, 0.8, -8); // Reset position
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.left = window.innerWidth / -40;
  camera.right = window.innerWidth / 40;
  camera.top = window.innerHeight / 40;
  camera.bottom = window.innerHeight / -40;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
