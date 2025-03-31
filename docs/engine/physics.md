# KajakEngine Physics System

The physics system is the heart of KajakEngine, providing realistic movement and interactions between objects, with a particular focus on vehicle dynamics.

## Overview

KajakEngine implements a specialized physics system designed for top-down racing games that simulates:

- Realistic car dynamics including grip, steering, and acceleration
- Collisions between various object types
- Surface-dependent handling properties
- Weight transfer and momentum
- Special effects like drifting and nitro boost

## Car Physics

The most sophisticated part of the physics system deals with car movement:

```typescript
// In CarObject.update():
// Calculate local velocity in car's reference frame
const localVelocity = {
    forward: this.velocity.x * sinAngle + this.velocity.y * cosAngle,
    right: this.velocity.x * cosAngle - this.velocity.y * sinAngle,
};

// Calculate weight distribution and slip angles
const frontSlipAngle = Math.atan2(
    localVelocity.right + this.angularVelocity * this._frontAxleToCg,
    speed
) - this.steerAngle;

// Calculate lateral forces based on grip and slip
const frontLateralForce = this.caFront * frontSlipAngle * frontNormal * surfaceProps.gripMultiplier;
```

### Key Physics Properties

- **Mass**: Affects momentum and collision impact
- **Grip**: Determines how well tires adhere to the surface
- **Drag**: Air resistance that increases with speed
- **Wheelbase**: Distance between front and rear axles, affects turning
- **Inertia**: Resistance to changes in angular velocity
- **Surface Grip**: Different surfaces have different grip levels

## Collision System

KajakEngine uses a multi-tiered collision system:

1. **QuadTree Spatial Partitioning**: Efficiently narrows down potential collisions
2. **Broad Phase**: AABB tests for quick collision culling
3. **Narrow Phase**: Detailed collision tests between specific object shapes

### Collider Types

```typescript
// Different collider types for different needs
const boxCollider = new AABBCollider(
    vec2D(0, 0),     // Offset from object center
    vec2D(5, 10)     // Size (width, height)
);

const carCollider = new PolygonCollider(
    vec2D(0, 0),     // Offset from object center
    [                // Vertices defining the shape
        vec2D(-1.5, -2.5),
        vec2D(1.5, -2.5),
        vec2D(1.5, 2.5),
        vec2D(-1.5, 2.5),
    ]
);

const barrierCollider = new LineCollider(
    vec2D(-5, 0),    // Start point
    vec2D(5, 0)      // End point
);
```

### Collision Response

When collisions are detected, the engine calculates appropriate responses:

```typescript
onCollision(other: PhysicObject, collisionInfo: ColliderInfo): void {
    // Calculate relative velocity
    const relativeVelocity = subtract(this.velocity, other.velocity);
    
    // Calculate impulse direction
    const normal = vec2D(collisionInfo.mtv.x, collisionInfo.mtv.y);
    const unitNormal = normalize(normal);
    
    // Calculate impulse magnitude (with elasticity)
    const e = this.restitution;
    const j = (-(1 + e) * dotProduct(relativeVelocity, unitNormal)) /
              (1 / this.mass + 1 / other.mass);
    
    // Apply impulse to change velocities
    this.velocity = add(
        this.velocity,
        multiply(unitNormal, j / this.mass)
    );
    
    // Apply angular impulse to cause rotation
    this.angularVelocity += (torqueScalar / this.inertia) * 0.01;
}
```

## Surface System

Different track surfaces affect vehicle handling:

```typescript
// Define a dirt surface segment
surfaceManager.addSegment({
    start: vec2D(-50, 0),
    end: vec2D(50, 0),
    width: 10,
    type: SurfaceType.DIRT  // Reduced grip, more drift
});
```

Surface properties are applied to car physics:

```typescript
// Get surface properties at car's position
const surfaceProps = this.surfaceManager.getSurfacePropertiesAt(this.position);

// Apply to grip calculations
const effectiveGrip = this.maxGrip * surfaceProps.gripMultiplier;
```

### Surface Types

- **ASPHALT**: Normal road (grip: 1.0)
- **DIRT**: Off-road (grip: 0.7)
- **ICE**: Very slippery (grip: 0.3)
- **GRASS**: Rough terrain (grip: 0.6, drag: 1.5)

## Special Physics Features

### Nitro Boost

```typescript
activateNitro(): boolean {
    if (this._nitroAmount > 0 && !this._nitroActive) {
        this._nitroActive = true;
        this._nitroEffectTimer = performance.now();
        return true;
    }
    return false;
}

// In update:
const nitroMultiplier = this._nitroActive ? this._nitroStrength : 1.0;
// Apply to acceleration forces
```

### Slip Effects (Banana Peels)

```typescript
applySlip(): void {
    const currentSpeed = length(this.velocity);
    const spinDirection = Math.random() > 0.5 ? 1 : -1;
    const rotationPower = currentSpeed * 10;
    
    // Apply spin
    this.angularVelocity = spinDirection * rotationPower;
    
    // Reduce speed
    this.velocity.x *= 0.5;
    this.velocity.y *= 0.5;
}
```

## Physics Debugging

KajakEngine provides visualization tools for physics debugging:

```typescript
// Enable debug visualization
engine.setDebugMode(true);
```

In debug mode, you can see:
- Collider shapes and boundaries
- Velocity vectors
- Surface types and properties
- Force magnitudes and directions
- Collision points and response vectors

This helps fine-tune physics parameters and diagnose collision issues.

## Where we got all our physics from?

In Kajak Solutions we belive that having the best technology is the key to success

```link
https://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
```

This site contains the most advanced physics for racing games such as Kajak Racing