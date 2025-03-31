# Advanced Features of KajakEngine

Beyond the core components, KajakEngine includes several advanced features that enhance the racing experience. This document explores these additional systems and how to implement them in your games.

## Weather System

The weather system adds dynamic environmental effects that impact both visuals and gameplay.

```typescript
// Initialize weather system
const weatherSystem = new WeatherSystem(scene, {
    initialWeather: WeatherType.RAIN,
    minDuration: 3000,    // Minimum time before weather can change (ms)
    maxDuration: 20000,   // Maximum time before weather will change (ms)
    intensity: 0.8,       // Weather effect intensity (0-1)
    puddleSpawnPoints: [  // Where puddles can form during rain
        {
            position: { x: -30, y: -10 },
            size: { x: 5, y: 4 },
            type: 'puddle'  // Can be 'puddle' or 'ice'
        },
        // More spawn points...
    ]
});

// Add to scene
scene.setWeatherSystem(weatherSystem);
```

### Weather Types

KajakEngine supports several weather types that affect gameplay differently:

- **CLEAR**: Default weather with normal track conditions
- **RAIN**: Reduces grip, creates puddles that further reduce grip
- **SNOW**: Significantly reduces grip and visibility

### Surface Effects

Weather conditions create surface effects that impact vehicle handling:

```typescript
// Example of how weather affects car handling
// In CarObject.update():

// Get surface properties at car's current position
const surfaceProps = this.surfaceManager
    ? this.surfaceManager.getSurfacePropertiesAt(this.position)
    : { gripMultiplier: 1.0, dragMultiplier: 1.0 };

// Apply temporary effects (like puddles)
const combinedGripMultiplier = surfaceProps.gripMultiplier * this.temporarySurfaceEffects.reduce(
    (mult, effect) => mult * effect.gripMultiplier, 
    1.0
);

// Use the combined grip in physics calculations
```

## Power-up System

KajakEngine includes a full power-up and item system similar to games like Mario Kart:

### Nitro Boost

```typescript
// Creating a nitro boost pickup
const nitroManager = new NitroManager(scene);
nitroManager.initialize([
    {
        position: { x: 10, y: 20 },
        respawnTime: 30000,  // Time until item respawns after collection
        size: { x: 2, y: 2 },
        spriteSrc: "game/nitro.png"
    },
    // More nitro spawn points...
]);

// Using nitro in CarObject
car.refillNitro(100);  // Fill nitro meter to maximum
car.activateNitro();   // Use nitro for temporary speed boost
```

### Obstacle System (Banana Peels)

```typescript
// Create a banana peel
obstacleManager.createObstacle(
    'bananaPeel',      // Type of obstacle
    { x: 10, y: 15 },  // Position
    playerCar.id       // Owner ID (immune to their own obstacles)
);

// Example of dropping a banana peel
function dropBananaPeel(): void {
    if (!scene || !obstacleManager) return;

    const playerCar = findPlayerCar();
    if (!playerCar) return;

    if (playerCar.useBananaPeel()) {
        // Calculate drop position behind the car
        const carAngle = playerCar.rotation;
        const dropDistance = -3;
        const dropX = playerCar.position.x - Math.sin(carAngle) * dropDistance;
        const dropY = playerCar.position.y - Math.cos(carAngle) * dropDistance;

        // Create the obstacle
        obstacleManager.createObstacle('bananaPeel', { x: dropX, y: dropY }, playerCar.id);
    }
}
```

### Item System

KajakEngine's item system controls item spawning, collection, and usage:

```typescript
// Initialize item manager with spawn points
const itemManager = new ItemManager(scene, {
    maxItems: 8,             // Maximum number of items in the scene
    itemRespawnTime: 15000,  // Time until respawn after collection
    spawnInterval: 10000,    // Time between spawn checks
    spawnPoints: [
        {
            position: { x: 15, y: 10 },
            respawnTime: 15000,
            itemTypes: ['bananaPeel', 'nitro'], // Available items at this point
            spawnChance: 0.8                    // Probability of spawn
        },
        // More spawn points...
    ]
});

// Start item spawning
itemManager.startItemSpawning();
```

## Sound System

KajakEngine includes a robust sound system for engine noises, effects, and music:

```typescript
// Load a sound
await soundManager.loadSound(
    'engine_rev',           // Sound ID
    'game/sounds/rev.mp3',  // File path
    {
        loop: true,         // Should loop?
        volume: 0.7,        // Initial volume
        category: 'sfx'     // Sound category for volume control
    }
);

// Play the sound
soundManager.play('engine_rev');

// Adjust volume categories
soundManager.setCategoryVolume('music', 0.5);
soundManager.setCategoryVolume('sfx', 1.0);

// Mute/unmute
soundManager.mute();
soundManager.unmute();

// Dynamic engine sounds based on RPM
// In CarSoundSystem:
update() {
    // Calculate engine RPM based on speed and gear
    const rpm = this.calculateRPM();
    
    // Adjust pitch and volume based on RPM
    this.engineSound.setPitch(0.5 + (rpm / this.maxRPM) * 1.5);
    this.engineSound.setVolume(0.3 + (rpm / this.maxRPM) * 0.7);
}
```

## Track Surface Types

KajakEngine supports different surface types that affect car handling:

```typescript
// Adding different surface types to a track
const surfaceManager = new TrackSurfaceManager();

// Add different surface segments
surfaceManager.addSegment({
    start: { x: -50, y: -50 },
    end: { x: 50, y: -50 },
    width: 10,
    type: SurfaceType.ASPHALT // Normal grip
});

surfaceManager.addSegment({
    start: { x: -50, y: 0 },
    end: { x: 50, y: 0 },
    width: 10,
    type: SurfaceType.DIRT // Reduced grip, more drift
});

surfaceManager.addSegment({
    start: { x: -50, y: 50 },
    end: { x: 50, y: 50 },
    width: 10,
    type: SurfaceType.ICE // Very low grip
});

// Add the surface manager to the scene
surfaceManager.addToScene(scene);
```

### Surface Properties

Each surface type has different grip and drag properties:

- **ASPHALT**: Regular road surface (gripMultiplier: 1.0, dragMultiplier: 1.0)
- **DIRT**: Off-road surface (gripMultiplier: 0.7, dragMultiplier: 1.2)
- **GRAVEL**: Loose surface (gripMultiplier: 0.5, dragMultiplier: 1.3)
- **ICE**: Slippery surface (gripMultiplier: 0.3, dragMultiplier: 0.8)
- **GRASS**: Off-track surface (gripMultiplier: 0.6, dragMultiplier: 1.5)

## Moving Barriers and Dynamic Obstacles

KajakEngine supports moving barriers that can create dynamic race tracks:

```typescript
// Create a moving barrier (like a gate)
const movingBarrier = new MovingBarrier({
    position: { x: 0, y: 0 },
    size: { x: 10, y: 2 },
    movementTime: 3000,      // Time to complete movement
    closedWaitTime: 5000,    // Time to stay closed
    openWaitTime: 10000,     // Time to stay open
    movementDistance: 10,    // Distance to move
    direction: 90,           // Direction in degrees
    spriteManager: new SpriteManager({
        imageSrc: "barrier.png",
        cellSize: vec2D(149, 10),
        count: 1,
        columns: 1
    }),
    mass: 100000             // Very heavy to block cars
});

// Add to scene
scene.addObject(movingBarrier);
```

Moving barriers can create interesting gameplay mechanics like timed gates, closing shortcuts, and other dynamic track elements.

## Debug Mode

The engine includes a debug visualization mode to help with development:

```typescript
// Enable debug mode
engine.setDebugMode(true);
```

In debug mode, the engine will visualize:

- **Colliders**: Shows the shape of collision geometry
- **AI Rays**: Displays the raycasts used by AI for navigation
- **Physics Forces**: Visualizes forces acting on cars
- **Surface Types**: Shows different track surface areas
- **Checkpoint Order**: Displays checkpoint numbers and sequence

This is extremely useful during development for adjusting physics parameters, placing checkpoints correctly, and debugging collision issues.

## Implementing Advanced Features

To implement these advanced features in your game:

1. **Weather Effects**:
   ```typescript
   // Initialize weather system in your Game class
   if (this.currentScene) {
       const weatherSystem = new WeatherSystem(this.currentScene, {
           initialWeather: WeatherType.CLEAR,
           // Other options...
       });
       this.currentScene.setWeatherSystem(weatherSystem);
   }
   ```

2. **Power-ups and Items**:
   ```typescript
   // Initialize managers in loadMap() method
   this.nitroManager = new NitroManager(this.currentScene);
   this.nitroManager.initialize(config.nitroSpawns);
   
   this.obstacleManager = new ObstacleManager(this.currentScene, {
       maxActiveObstacles: 15,
       bananaPeelLifespan: 30000
   });
   
   this.itemManager = new ItemManager(this.currentScene, {
       maxItems: 8,
       itemRespawnTime: 15000,
       spawnInterval: 10000,
       spawnPoints: config.itemSpawns
   });
   ```

3. **Sound System**:
   ```typescript
   // Initialize sound in your Game class
   soundManager.loadSound('background_music', 'game/sounds/background.mp3', {
       loop: true,
       volume: 0.5,
       category: 'music'
   }).then(() => {
       soundManager.play('background_music');
   });
   
   // Set up volume controls in your UI
   document.getElementById('music-volume')?.addEventListener('input', (e) => {
       const volume = parseInt((e.target as HTMLInputElement).value) / 100;
       soundManager.setCategoryVolume('music', volume);
   });
   ```

4. **Surface Types**:
   ```typescript
   // Define track surfaces in your map JSON
   {
     "surfaces": {
       "segments": [
         {
           "start": { "x": -20, "y": -20 },
           "end": { "x": 20, "y": -20 },
           "width": 5,
           "type": "DIRT"
         },
         // More segments...
       ]
     }
   }
   
   // Load surfaces in MapLoader
   if (config.surfaces) {
       const surfaceManager = new TrackSurfaceManager();
       config.surfaces.segments.forEach(segment => {
           surfaceManager.addSegment({
               start: segment.start,
               end: segment.end,
               width: segment.width,
               type: segment.type
           });
       });
       surfaceManager.addToScene(scene);
   }
   ```

By leveraging these advanced features, you can create rich, dynamic racing games with varying environmental conditions, power-ups, and special track elements that make each race unique and exciting.