# Car Object

The `CarObject` is the main player-controlled or AI-controlled vehicle in the KajakEngine. It features a sophisticated physics model for realistic top-down racing.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| steerAngle | number | Current steering angle in radians |
| throttle | number | Current acceleration input (-100 to 100) |
| brake | number | Current braking force |
| angularVelocity | number | Rotational speed in radians per second |
| isPlayer | boolean | Whether this car is player-controlled |
| playerId | number | ID for identifying different players |
| nitroAmount | number | Current nitro level (0-100) |
| nitroActive | boolean | Whether nitro boost is currently engaged |
| maxNitro | number | Maximum nitro capacity |
| bananaPeels | number | Number of banana peels the car has |
| maxBananaPeels | number | Maximum banana peels the car can carry |
| mass | number | Car's mass affecting physics calculations |
| maxGrip | number | Maximum tire grip on perfect surface |
| resistance | number | Rolling resistance (affects deceleration) |
| drag | number | Air resistance (increases with speed) |
| frontAxleToCg | number | Distance from front axle to center of gravity |
| rearAxleToCg | number | Distance from rear axle to center of gravity |
| wheelBase | number | Distance between front and rear axles |
| wheelSize | Vec2D | Size of the car's wheels for visualization |
| soundSystem | CarSoundSystem | System for managing car sounds |

## Methods

| Method | Description |
|--------|-------------|
| setSteerAngle(angle: number) | Set the steering angle (-π/4 to π/4) |
| setThrottle(value: number) | Set the throttle/acceleration (-100 to 100) |
| setBrake(value: number) | Set the braking force |
| activateNitro() | Activate nitro boost if available |
| refillNitro(amount: number) | Add nitro to the car's reserves |
| useBananaPeel() | Use a banana peel if available |
| collectBananaPeel() | Add a banana peel to inventory |
| applySlip() | Apply slipping effect (used by banana peels) |

## Implementation Example

### Basic Car Creation

```typescript
// Create a player car
const playerCar = new CarObject({
    position: vec2D(0, 0),          // Starting position
    size: vec2D(3, 5),              // Car dimensions
    movable: true,                  // Can move with physics
    collider: new PolygonCollider(vec2D(0, 0), [
        vec2D(-1.5, -2.5),          // Car shape corners
        vec2D(1.5, -2.5),
        vec2D(1.5, 2.5),
        vec2D(-1.5, 2.5),
    ]),
    mass: 900,                      // Car mass in kg
    maxGrip: 10,                    // Maximum grip coefficient
    wheelBase: 4.5,                 // Distance between axles
    drag: 25,                       // Air resistance
    rotation: 0,                    // Initial rotation
    isPlayer: true,                 // Player controlled
    id: 0,                          // Car ID
    surfaceManager: surfaceManager, // Track surface reference
    maxNitro: 100,                  // Nitro capacity
    nitroStrength: 2.5,             // Nitro boost multiplier
    maxBananaPeels: 3               // Max banana peels
});
```

### Player Controls Setup

```typescript
// Set up keyboard controls for the player car
document.addEventListener("keydown", (e) => {
    if (!playerCar) return;

    switch (e.key) {
        case "ArrowUp":
            playerCar.setThrottle(100);
            break;
        case "ArrowDown":
            playerCar.setThrottle(-30);
            break;
        case "ArrowLeft":
            playerCar.setSteerAngle(-Math.PI / 4);
            break;
        case "ArrowRight":
            playerCar.setSteerAngle(Math.PI / 4);
            break;
        case " ": // Space key
            playerCar.activateNitro();
            break;
        case "b": // B key
            dropBananaPeel();
            break;
    }
});

document.addEventListener("keyup", (e) => {
    if (!playerCar) return;

    switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
            playerCar.setThrottle(0);
            break;
        case "ArrowLeft":
        case "ArrowRight":
            playerCar.setSteerAngle(0);
            break;
    }
});

function dropBananaPeel() {
    if (playerCar.useBananaPeel()) {
        const carAngle = playerCar.rotation;
        const dropDistance = -3;
        const dropX = playerCar.position.x - Math.sin(carAngle) * dropDistance;
        const dropY = playerCar.position.y - Math.cos(carAngle) * dropDistance;

        obstacleManager.createObstacle('bananaPeel', { x: dropX, y: dropY }, playerCar.id);
    }
}
```

### AI Car Creation

```typescript
// Create an AI-controlled car
const aiCar = new CarObject({
    position: vec2D(5, 0),          // Starting position offset from player
    size: vec2D(3, 5),              // Car dimensions
    movable: true,                  // Can move with physics
    collider: new PolygonCollider(vec2D(0, 0), [
        vec2D(-1.5, -2.5),
        vec2D(1.5, -2.5),
        vec2D(1.5, 2.5),
        vec2D(-1.5, 2.5),
    ]),
    mass: 900,
    maxGrip: 10,
    wheelBase: 4.5,
    drag: 25,
    rotation: 0,
    isPlayer: false,                // AI controlled
    id: 1,
    surfaceManager: surfaceManager
});

// Create an AI controller for the car
const aiController = new CarAIController(
    aiCar,
    AIBehaviorType.AGGRESSIVE      // AI behavior type
);

// Add the AI controller to the scene
scene.addAIController(aiController);
```

### Using Special Features

```typescript
// Using nitro boost
playerCar.refillNitro(50);  // Add 50 nitro
playerCar.activateNitro();  // Activate boost

// Handling banana peels
playerCar.collectBananaPeel();  // Collect a banana peel
if (playerCar.bananaPeels > 0) {
    console.log(`Player has ${playerCar.bananaPeels} banana peels available`);
}

// Apply surface effects (like driving through a puddle)
playerCar.applyTemporarySurfaceEffect(
    {
        gripMultiplier: 0.5,  // Half grip
        dragMultiplier: 1.2   // Increased drag
    },
    2.0  // Duration in seconds
);
```

## Physics Details

The `CarObject` implements a sophisticated physics model that includes:

1. **Weight Transfer**: Simulates how weight shifts during acceleration, braking, and cornering
2. **Slip Angles**: Calculates wheel slip for realistic drifting
3. **Surface-Dependent Handling**: Different surfaces affect grip and drag
4. **Aerodynamics**: Air resistance increases with speed
5. **Collisions**: Realistic bounce and impact forces between cars and obstacles

The update method runs these calculations every frame to provide smooth and realistic movement.