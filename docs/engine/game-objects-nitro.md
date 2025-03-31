# Nitro Bonus Object

The `NitroBonus` class represents collectible nitro power-ups in KajakEngine. These objects allow cars to refill their nitro reserves for speed boosts.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| active | boolean | Whether the nitro power-up is available for collection |
| respawnTime | number | Time in milliseconds until the power-up respawns after collection |
| lastCollectionTime | number | Timestamp of the last collection |
| collider | Collider | Usually an AABB collider for detecting car overlap |
| spriteManager | SpriteManager | Visual representation with potential animation |

## Methods

| Method | Description |
|--------|-------------|
| deactivate() | Make the nitro unavailable after collection |
| activate() | Make the nitro available for collection again |
| update(deltaTime) | Update the nitro state, handles respawning logic |

## Implementation Example

### Basic Nitro Bonus Creation

```typescript
// Create a nitro boost power-up
const nitroBonus = new NitroBonus({
    position: vec2D(20, 30),          // Position in the world
    size: vec2D(2, 2),                // Size of the power-up
    spriteManager: new SpriteManager({
        imageSrc: "game/nitro.png",
        cellSize: vec2D(32, 32),
        count: 8,                     // 8 frames for animation
        columns: 4,                   // 4 columns in the sprite sheet
        offset: 0,
    }),
    respawnTime: 30000,               // 30 seconds to respawn
    mass: 0                           // No physical mass needed
});

// Add to the scene
scene.addObject(nitroBonus);
```

### Setting Up Nitro Collection

```typescript
// Set up overlap detection for nitro collection
const overlap = new Overlap(
    playerCar,
    nitroBonus,
    (vehicle, bonus) => {
        if (bonus instanceof NitroBonus && 
            bonus.active && 
            vehicle instanceof CarObject) {
            
            // Refill the car's nitro
            vehicle.refillNitro();
            
            // Deactivate the bonus
            bonus.deactivate();
            
            // Play collection sound
            soundManager.play('nitro_collect');
            
            console.log(`Car ${vehicle.playerId} collected nitro boost!`);
        }
    }
);

// Add the overlap to the scene
scene.overlapManager.addOverlap(overlap);
```

### Using the NitroManager

In practice, nitro power-ups are typically managed by the `NitroManager` class:

```typescript
// Initialize the nitro manager with the scene
const nitroManager = new NitroManager(scene);

// Define spawn points
const nitroSpawnPoints = [
    {
        position: vec2D(20, 30),
        respawnTime: 30000,           // 30 seconds
        size: vec2D(2, 2),
        spriteSrc: "game/nitro.png"
    },
    {
        position: vec2D(-20, -30),
        respawnTime: 45000,           // 45 seconds
        size: vec2D(2, 2),
        spriteSrc: "game/nitro_alt.png"
    }
];

// Initialize nitro power-ups
nitroManager.initialize(nitroSpawnPoints);
```

### NitroManager Implementation

```typescript
class NitroManager {
    private scene: Scene;
    private nitroBonuses: NitroBonus[] = [];
    private spawnPoints: NitroSpawnConfig[] = [];
    private readonly defaultRespawnTime: number;

    constructor(scene: Scene, options: {
        defaultRespawnTime?: number;
    } = {}) {
        this.scene = scene;
        this.defaultRespawnTime = options.defaultRespawnTime || 30000;
    }

    initialize(spawnPoints: NitroSpawnConfig[]): void {
        this.spawnPoints = spawnPoints;

        for (const spawnPoint of this.spawnPoints) {
            this.createNitroBonus(spawnPoint);
        }
    }

    private createNitroBonus(spawnConfig: NitroSpawnConfig): void {
        const spriteManager = new SpriteManager({
            imageSrc: spawnConfig.spriteSrc || "game/nitro.png",
            cellSize: vec2D(32, 32),
            count: 8,
            columns: 4,
            offset: 0,
        });

        const nitroBonus = new NitroBonus({
            position: spawnConfig.position,
            size: spawnConfig.size || vec2D(2, 2),
            spriteManager: spriteManager,
            respawnTime: spawnConfig.respawnTime || this.defaultRespawnTime,
            mass: 0
        });

        this.scene.addObject(nitroBonus);
        this.nitroBonuses.push(nitroBonus);

        // Set up overlaps with all cars
        const cars = Array.from(this.scene.gameObjects.values())
            .filter(obj => obj instanceof CarObject) as CarObject[];

        for (const car of cars) {
            const overlap = new Overlap(
                car,
                nitroBonus,
                (vehicle, bonus) => {
                    if (bonus instanceof NitroBonus && 
                        bonus.active && 
                        vehicle instanceof CarObject) {
                        
                        vehicle.refillNitro();
                        
                        // Only player cars deactivate nitro (AI can't use them up)
                        if(vehicle.playerId === 0) {
                            bonus.deactivate();
                        }
                        
                        console.log(`Car ${vehicle.playerId} collected nitro boost!`);
                    }
                }
            );
            this.scene.overlapManager.addOverlap(overlap);
        }
    }

    dispose(): void {
        for (const nitroBonus of this.nitroBonuses) {
            if (nitroBonus.id) {
                this.scene.removeObject(nitroBonus.id);
            }
        }
        this.nitroBonuses = [];
    }
}
```

## JSON Configuration

In a map JSON file, nitro spawn points are typically defined like this:

```json
{
  "nitroSpawns": [
    {
      "position": { "x": 20, "y": 30 },
      "respawnTime": 30000,
      "size": { "x": 2, "y": 2 },
      "spriteSrc": "game/nitro.png"
    },
    {
      "position": { "x": -20, "y": -30 },
      "respawnTime": 45000,
      "size": { "x": 2, "y": 2 },
      "spriteSrc": "game/nitro_alt.png"
    }
  ]
}
```


This implementation shows how the NitroBonus class can be extended to create special variations of the nitro power-up with different effects and properties.