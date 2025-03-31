# Game Objects in KajakEngine

Game objects are the building blocks of any game created with KajakEngine. They represent everything from cars and checkpoints to barriers and power-ups.

## Object Hierarchy

KajakEngine implements a hierarchical object system:

```
GameObject
└── PhysicObject
    ├── CarObject
    ├── CheckpointObject
    ├── TreeObject
    ├── MapObject
    ├── NitroBonus
    └── MovingBarrier
```

## Base Class: GameObject

The base class for all entities in the game:

| Property | Type | Description |
|----------|------|-------------|
| position | Vec2D | Position in world coordinates (x, y) |
| size | Vec2D | Width and height of the object |
| rotation | number | Rotation angle in radians |
| movable | boolean | Whether the object can move |
| spriteManager | SpriteManager | Optional component for rendering sprites |
| _id | number | Unique identifier assigned by the scene |

### Implementation Example

```typescript
// Creating a basic game object
const object = new GameObject({
    position: vec2D(10, 20),  
    size: vec2D(5, 5),
    rotation: 0,
    movable: false,
    spriteManager: new SpriteManager({
        imageSrc: "asset.png",
        cellSize: vec2D(32, 32),
        count: 1,
        columns: 1
    })
});

// Adding to a scene
scene.addObject(object);
```

## PhysicObject

Extends `GameObject` with physics properties:

| Property | Type | Description |
|----------|------|-------------|
| velocity | Vec2D | Current movement speed (x, y) |
| collider | Collider | Shape used for collision detection |
| mass | number | Mass used for physics calculations |

Additional methods:
- `onCollision(other: PhysicObject, collisionInfo: ColliderInfo): void` - Handles collision response

### Implementation Example

```typescript
// Creating a physics object
const physicsObj = new PhysicObject({
    position: vec2D(15, 15),
    size: vec2D(3, 3),
    movable: true,
    collider: new AABBCollider(vec2D(0, 0), vec2D(3, 3)),
    mass: 100,
    velocity: vec2D(0, 0)
});

// Custom collision handling
physicsObj.onCollision = (other, collisionInfo) => {
    // Custom collision response
    console.log(`Collided with object ID: ${other.id}`);
};

// Adding to a scene
scene.addObject(physicsObj);
```
