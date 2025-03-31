# Moving Barrier Object

The `MovingBarrier` class represents dynamic obstacles that can move, such as gates, barriers, and other track elements that change position over time. These add challenge and variety to the racing experience.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| initialPosition | Vec2D | Starting position of the barrier |
| position | Vec2D | Current position of the barrier |
| size | Vec2D | Dimensions of the barrier |
| movementTime | number | Time in ms to complete one movement |
| closedWaitTime | number | Time in ms to wait in closed position |
| openWaitTime | number | Time in ms to wait in open position |
| movementDistance | number | Distance the barrier moves |
| direction | number | Movement direction in degrees |
| state | BarrierState | Current state (OPEN, CLOSED, OPENING, CLOSING) |
| lastStateChange | number | Timestamp of last state change |
| collider | Collider | Collider for detecting car impacts |
| mass | number | Very high mass to block cars effectively |

## States

The `BarrierState` enum defines the possible states:

```typescript
enum BarrierState {
    CLOSED = 0,
    OPENING = 1,
    OPEN = 2,
    CLOSING = 3
}
```

## Methods

| Method | Description |
|--------|-------------|
| update(deltaTime) | Update the barrier position based on state |
| toggle() | Switch between open and closed states |
| open() | Start opening the barrier |
| close() | Start closing the barrier |

## Implementation Example

### Basic Moving Barrier Creation

```typescript
// Create a moving gate barrier
const barrier = new MovingBarrier({
    position: vec2D(0, 30),           // Initial position
    size: vec2D(10, 2),               // Size of barrier
    movementTime: 3000,               // 3 seconds to complete movement
    closedWaitTime: 5000,             // 5 seconds in closed position
    openWaitTime: 10000,              // 10 seconds in open position
    movementDistance: 10,             // Distance to move
    direction: 90,                    // Move upward (90 degrees)
    spriteManager: new SpriteManager({
        imageSrc: "game/barrier.png",
        cellSize: vec2D(149, 10),
        count: 1,
        columns: 1
    }),
    mass: 100000                      // Very heavy to effectively block cars
});

// Add to the scene
scene.addObject(barrier);
```

### Creating Different Barrier Types

```typescript
// Create a horizontal sliding door
const slidingDoor = new MovingBarrier({
    position: vec2D(20, 0),
    size: vec2D(8, 4),
    movementTime: 2000,
    closedWaitTime: 8000,
    openWaitTime: 8000,
    movementDistance: 8,
    direction: 0,                    // Move horizontally (0 degrees)
    spriteManager: new SpriteManager({
        imageSrc: "game/door.png",
        cellSize: vec2D(128, 64),
        count: 1,
        columns: 1
    }),
    mass: 100000
});

// Create a bridge that raises and lowers
const bridge = new MovingBarrier({
    position: vec2D(-20, 10),
    size: vec2D(15, 5),
    movementTime: 5000,
    closedWaitTime: 15000,
    openWaitTime: 5000,
    movementDistance: 5,
    direction: 90,                   // Move upward (90 degrees)
    spriteManager: new SpriteManager({
        imageSrc: "game/bridge.png",
        cellSize: vec2D(240, 80),
        count: 1,
        columns: 1
    }),
    mass: 100000
});

// Add to the scene
scene.addObject(slidingDoor);
scene.addObject(bridge);
```

## JSON Configuration

In a map JSON file, moving barriers are typically defined like this:

```json
{
  "movingBarriers": [
    {
      "position": { "x": 0, "y": 30 },
      "size": { "x": 10, "y": 2 },
      "movementTime": 3000,
      "closedWaitTime": 5000,
      "openWaitTime": 10000,
      "movementDistance": 10,
      "direction": 90,
      "spriteSrc": "game/barrier.png"
    },
    {
      "position": { "x": 20, "y": 0 },
      "size": { "x": 8, "y": 4 },
      "movementTime": 2000,
      "closedWaitTime": 8000,
      "openWaitTime": 8000,
      "movementDistance": 8,
      "direction": 0,
      "spriteSrc": "game/door.png"
    }
  ]
}
```

This implementation shows the versatility of the MovingBarrier class in creating dynamic track elements that add challenge and variety to the racing experience.