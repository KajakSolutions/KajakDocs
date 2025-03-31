# Tree Object

The `TreeObject` represents static obstacles in KajakEngine, such as trees, rocks, barriers, and other immovable objects that cars can collide with. Despite the name, this class is used for all types of static track obstacles.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| collider | Collider | Usually a PolygonCollider for precise collision detection |
| mass | number | Very high mass to prevent being pushed by cars |
| movable | boolean | Always false as these objects don't move |
| spriteManager | SpriteManager | Visual representation of the obstacle |

## Implementation Example

### Basic Tree/Obstacle Creation

```typescript
// Create a tree obstacle
const tree = new TreeObject({
    position: vec2D(30, -20),        // Position in the world
    size: vec2D(5, 5),               // Size of the obstacle
    movable: false,                  // Static object
    collider: new PolygonCollider(vec2D(0, 0), [
        vec2D(-2, -2),               // Define shape vertices
        vec2D(2, -2),
        vec2D(2, 2),
        vec2D(-2, 2),
    ]),
    mass: 1500,                      // High mass to block cars
    spriteManager: new SpriteManager({
        imageSrc: "game/tree.png",
        cellSize: vec2D(32, 32),
        count: 1,
        columns: 1
    })
});

// Add to the scene
scene.addObject(tree);
```

### Creating a Rock Obstacle

```typescript
// Create a rock obstacle using the TreeObject class
const rock = new TreeObject({
    position: vec2D(-15, 25),
    size: vec2D(4, 4),
    movable: false,
    // Irregular polygon shape for the rock
    collider: new PolygonCollider(vec2D(0, 0), [
        vec2D(-1.5, -2),
        vec2D(0.5, -1.8),
        vec2D(2, -0.5),
        vec2D(1.8, 1),
        vec2D(0, 2),
        vec2D(-2, 1)
    ]),
    mass: 2000,
    spriteManager: new SpriteManager({
        imageSrc: "game/rock.png",
        cellSize: vec2D(32, 32),
        count: 1,
        columns: 1
    })
});

scene.addObject(rock);
```

### Creating Track Barrier Walls

```typescript
// Create a long barrier wall
const wall = new TreeObject({
    position: vec2D(0, -40),         // Position along track edge
    size: vec2D(20, 2),              // Long and narrow
    movable: false,
    collider: new PolygonCollider(vec2D(0, 0), [
        vec2D(-10, -1),
        vec2D(10, -1),
        vec2D(10, 1),
        vec2D(-10, 1)
    ]),
    mass: 5000,                      // Very high mass
    spriteManager: new SpriteManager({
        imageSrc: "game/barrier.png",
        cellSize: vec2D(32, 8),
        count: 1,
        columns: 1
    })
});

scene.addObject(wall);
```

## Creating Multiple Objects Efficiently

In practice, obstacle positions are typically defined in a track configuration file:

```typescript
// Example of creating multiple obstacles from configuration
const obstacleConfigs = [
    {
        type: "tree",
        position: vec2D(30, -20),
        size: vec2D(5, 5),
        vertices: [
            vec2D(-2, -2),
            vec2D(2, -2),
            vec2D(2, 2),
            vec2D(-2, 2)
        ],
        spriteSrc: "game/tree.png"
    },
    {
        type: "rock",
        position: vec2D(-15, 25),
        size: vec2D(4, 4),
        vertices: [
            vec2D(-1.5, -2),
            vec2D(0.5, -1.8),
            vec2D(2, -0.5),
            vec2D(1.8, 1),
            vec2D(0, 2),
            vec2D(-2, 1)
        ],
        spriteSrc: "game/rock.png"
    },
    // More obstacle definitions...
];

// Create all obstacles
obstacleConfigs.forEach(config => {
    const obstacle = new TreeObject({
        position: config.position,
        size: config.size,
        movable: false,
        collider: new PolygonCollider(vec2D(0, 0), config.vertices),
        mass: 1500,
        spriteManager: new SpriteManager({
            imageSrc: config.spriteSrc,
            cellSize: vec2D(32, 32),
            count: 1,
            columns: 1
        })
    });
    
    scene.addObject(obstacle);
});
```

## JSON Configuration

In the map JSON file, obstacles are typically defined like this:

```json
{
  "obstacles": [
    {
      "position": { "x": 30, "y": -20 },
      "size": { "x": 5, "y": 5 },
      "vertices": [
        { "x": -2, "y": -2 },
        { "x": 2, "y": -2 },
        { "x": 2, "y": 2 },
        { "x": -2, "y": 2 }
      ],
      "spriteSrc": "game/tree.png"
    },
    {
      "position": { "x": -15, "y": 25 },
      "size": { "x": 4, "y": 4 },
      "vertices": [
        { "x": -1.5, "y": -2 },
        { "x": 0.5, "y": -1.8 },
        { "x": 2, "y": -0.5 },
        { "x": 1.8, "y": 1 },
        { "x": 0, "y": 2 },
        { "x": -2, "y": 1 }
      ],
      "spriteSrc": "game/rock.png"
    }
  ]
}
```

## Collision Handling

The TreeObject handles collisions by being immovable and causing cars to bounce off:

```typescript
// Example of custom collision handling for a TreeObject
customTree.onCollision = (other: PhysicObject, collisionInfo: ColliderInfo): void => {
    if (other instanceof CarObject) {
        // Reduce car's velocity (more than normal collision)
        other.velocity.x *= 0.7;
        other.velocity.y *= 0.7;
        
        // Play crash sound
        soundManager.play('crash');
        
        // Create dust particle effect
        createDustEffect(collisionInfo.point);
    }
};

function createDustEffect(position: Vec2D): void {
    // Create visual dust effect at the collision point
    // Implementation depends on your particle system
    console.log(`Dust effect created at (${position.x}, ${position.y})`);
}
```

This example demonstrates how the TreeObject can be extended to create more complex obstacle behaviors beyond the basic static obstacle.