# Checkpoint Object

The `CheckpointObject` represents race checkpoints and the finish line in KajakEngine. These objects define the track layout and are used by the `RaceManager` to track player progress through the course.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| isFinishLine | boolean | Whether this checkpoint is also the finish line |
| order | number | Sequential order of this checkpoint in the race |
| activated | boolean | Whether this checkpoint has been activated by the player |
| collider | Collider | Usually an AABB collider for detecting car passage |
| spriteManager | SpriteManager | Visual representation (usually hidden until approached) |

## Methods

| Method | Description |
|--------|-------------|
| activate(car: CarObject) | Activate the checkpoint when a player car passes through |
| get isActivated() | Check if the checkpoint has been activated |
| get checkpointOrder() | Get the sequential order number |
| get isFinish() | Check if this is the finish line checkpoint |
| get aiDetectable() | Whether AI can detect this checkpoint (always false) |

## Implementation Example

### Basic Checkpoint Creation

```typescript
// Create a regular checkpoint
const checkpoint = new CheckpointObject({
    position: vec2D(20, 0),          // Position in the world
    size: vec2D(5, 10),              // Size of the checkpoint
    rotation: degreesToRadians(90),  // Rotation (perpendicular to track)
    order: 1,                        // Second checkpoint in sequence
    isFinishLine: false,             // Not the finish line
    collider: new AABBCollider(
        vec2D(0, 0),                 // Offset from center
        vec2D(5, 10)                 // Collider size
    ),
    movable: false,                  // Checkpoints don't move
    mass: 1,                         // Nominal mass (not used)
    spriteManager: new SpriteManager({
        imageSrc: "game/checkpoint.png",
        cellSize: vec2D(32, 32),
        count: 48,
        columns: 7,
        offset: 47,
    })
});

// Add to the scene
scene.addObject(checkpoint);
```

### Creating a Finish Line

```typescript
// Create a finish line checkpoint
const finishLine = new CheckpointObject({
    position: vec2D(0, 0),           // Starting position
    size: vec2D(10, 5),              // Wider than regular checkpoints
    rotation: degreesToRadians(90),  // Perpendicular to track
    order: 0,                        // First checkpoint (also last)
    isFinishLine: true,              // This is the finish line
    collider: new AABBCollider(
        vec2D(0, 0),
        vec2D(10, 5)
    ),
    movable: false,
    mass: 1,
    spriteManager: new SpriteManager({
        imageSrc: "game/finish_line.png",
        cellSize: vec2D(64, 32),
        count: 1,
        columns: 1
    })
});

// Add to the scene
scene.addObject(finishLine);
```

### Handling Checkpoint Activation

Typically, checkpoint activation is handled automatically by the `RaceManager`, but you can also implement custom behavior:

```typescript
// Set up checkpoint overlap detection
const overlap = new Overlap(
    playerCar,
    checkpoint,
    (vehicle, checkpointObj) => {
        if (checkpointObj instanceof CheckpointObject && vehicle instanceof CarObject) {
            // Activate the checkpoint
            checkpointObj.activate(vehicle);

            // Hide the checkpoint sprite after activation
            if (checkpointObj.spriteManager) {
                checkpointObj.spriteManager.hidden = true;
            }

            // Custom behavior when checkpoint is activated
            if (checkpointObj.isFinish) {
                console.log("Finished a lap!");
                // Play finish line sound
                soundManager.play('finish_line');
            } else {
                console.log(`Checkpoint ${checkpointObj.checkpointOrder} reached!`);
                // Play checkpoint sound
                soundManager.play('checkpoint');
            }
        }
    }
);

// Add the overlap to the scene's overlap manager
scene.overlapManager.addOverlap(overlap);
```

## Setting Up a Complete Track

To create a full racing track, you'll need multiple checkpoints in sequence:

```typescript
// Define checkpoint configurations
const checkpointConfigs = [
    {
        position: vec2D(0, 0),
        rotation: 90,
        order: 0,
        isFinishLine: true
    },
    {
        position: vec2D(50, 20),
        rotation: 0,
        order: 1,
        isFinishLine: false
    },
    {
        position: vec2D(50, -20),
        rotation: 270,
        order: 2,
        isFinishLine: false
    },
    {
        position: vec2D(0, -40),
        rotation: 180,
        order: 3,
        isFinishLine: false
    },
    {
        position: vec2D(-50, -20),
        rotation: 90,
        order: 4,
        isFinishLine: false
    },
    {
        position: vec2D(-50, 20),
        rotation: 0,
        order: 5,
        isFinishLine: false
    }
];

// Create all checkpoints
checkpointConfigs.forEach(config => {
    const checkpoint = new CheckpointObject({
        position: config.position,
        size: vec2D(5, 10),
        rotation: degreesToRadians(config.rotation),
        order: config.order,
        isFinishLine: config.isFinishLine,
        collider: new AABBCollider(
            vec2D(0, 0),
            vec2D(5, 10)
        ),
        movable: false,
        mass: 1,
        spriteManager: new SpriteManager({
            imageSrc: config.isFinishLine ? "game/finish_line.png" : "game/checkpoint.png",
            cellSize: vec2D(32, 32),
            count: config.isFinishLine ? 1 : 48,
            columns: config.isFinishLine ? 1 : 7,
            offset: config.isFinishLine ? 0 : 47,
        })
    });

    // Add to the scene
    scene.addObject(checkpoint);
});
```

## Using JSON Configuration

In practice, track layouts including checkpoints are typically defined in JSON map files:

```json
{
  "checkpoints": [
    {
      "position": { "x": 0, "y": 0 },
      "size": { "x": 10, "y": 5 },
      "rotation": 90,
      "order": 0,
      "isFinishLine": true,
      "collider": {
        "type": "AABB",
        "offset": { "x": 0, "y": 0 },
        "size": { "x": 10, "y": 5 }
      }
    },
    {
      "position": { "x": 50, "y": 20 },
      "size": { "x": 5, "y": 10 },
      "rotation": 0,
      "order": 1,
      "isFinishLine": false,
      "collider": {
        "type": "AABB",
        "offset": { "x": 0, "y": 0 },
        "size": { "x": 5, "y": 10 }
      }
    }
    // Additional checkpoints...
  ]
}
```

This is then loaded via the `MapLoader` which creates all checkpoints automatically.