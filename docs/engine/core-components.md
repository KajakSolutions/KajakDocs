# Core Components of KajakEngine

KajakEngine is built around a set of core components that work together to create a complete racing game experience. Understanding these components is essential for effectively using the engine.

## KajakEngine Class

The `KajakEngine` class is the central component that ties everything together. It manages the game loop, scene rendering, and input processing.

```typescript
class KajakEngine {
    private _scenes: Map<number, Scene> = new Map()
    private _currentScene: Scene | null = null
    private readonly _ctx: CanvasRenderingContext2D
    private readonly _canvas: HTMLCanvasElement
    private _lastTimestamp: number = 0
    private _running: boolean = false

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas
        canvas.width = 1280
        canvas.height = 720

        const ctx = this._canvas.getContext("2d")
        if (!ctx) throw new Error("Unable to get 2d context from canvas")
        this._ctx = ctx

        this.gameLoop = this.gameLoop.bind(this)
    }

    // Get the current active scene
    get currentScene(): Scene | null {
        return this._currentScene
    }

    // Get the rendering context
    get ctx(): CanvasRenderingContext2D {
        return this._ctx
    }

    // Access all registered scenes
    get scenes(): Map<number, Scene> {
        return this._scenes
    }

    // Toggle debug visualization
    setDebugMode(debugMode: boolean): void {
        if (!this._currentScene) return
        this._currentScene.debugMode = debugMode
    }

    // Switch to a different scene
    setCurrentScene(sceneId: number): void {
        const scene = this._scenes.get(sceneId)
        if (scene) {
            this._currentScene = scene
            // Set up background and other scene properties
        }
    }

    // Start the game loop
    start(): void {
        if (!this._running) {
            this._running = true
            this._lastTimestamp = performance.now()
            requestAnimationFrame(this.gameLoop)
        }
    }

    // Stop the game loop
    stop(): void {
        this._running = false
    }

    // The main game loop
    private gameLoop(timestamp: number): void {
        if (!this._running) return

        const deltaTime = (timestamp - this._lastTimestamp) / 1000
        this._lastTimestamp = timestamp

        if (this._currentScene) {
            this._currentScene.update(deltaTime)
            this._currentScene.draw(this._ctx)
        }

        requestAnimationFrame(this.gameLoop)
    }
}
```

## Scene Class

The `Scene` class manages all game objects and their interactions. It's a container for everything that happens in a particular track or level.

```typescript
class Scene {
    private _gameObjects: Map<number, PhysicObject> = new Map()
    private _quadTree: QuadTree
    private nextId: number = 1
    private readonly _map: MapObject
    public readonly overlapManager = new OverlapManager()
    private readonly _raceManager: RaceManager
    private _debugMode: boolean = false
    private _weatherSystem: WeatherSystem | null = null
    private aiControllers: CarAIController[] = []

    constructor(worldBounds: BoundingBox, map: MapObject, 
                raceManagerOptions?: RaceConfiguration) {
        this._quadTree = new QuadTree(worldBounds)
        this._map = map
        this._raceManager = new RaceManager(raceManagerOptions)
    }

    // Access to the map/track
    get map(): MapObject {
        return this._map
    }

    // Access to the race management system
    get raceManager(): RaceManager {
        return this._raceManager
    }

    // Add an AI controller
    addAIController(controller: CarAIController) {
        this.aiControllers.push(controller)
    }

    // Add a game object to the scene
    addObject(object: PhysicObject): number {
        const id = this.nextId++
        this._gameObjects.set(id, object)
        object.id = id

        // Register with appropriate systems
        if (object instanceof CarObject) {
            this._raceManager.addCar(object)
        } else if (object instanceof CheckpointObject) {
            this._raceManager.addCheckpoint(object)
        }

        return id
    }

    // Remove an object from the scene
    removeObject(id: number): void {
        const object = this._gameObjects.get(id)
        if (!object) return

        // Clean up any associated overlaps
        const overlapsToRemove = Array.from(
            this.overlapManager.overlaps
        ).filter(
            (overlap) => overlap.obj1 === object || overlap.obj2 === object
        )

        overlapsToRemove.forEach((overlap) => {
            this.overlapManager.removeOverlap(overlap)
        })

        this._gameObjects.delete(id)
    }

    // Update all objects and systems
    update(deltaTime: number): void {
        // Update AI controllers
        this.aiControllers.forEach((controller) => {
            const playerCar = Array.from(this._gameObjects.values()).find(
                (obj) => obj instanceof CarObject && obj.isPlayer
            ) as CarObject

            if (playerCar) {
                controller.update(this, playerCar)
            }
        })

        // Update spatial partitioning for collision detection
        this._quadTree.clear()
        for (const obj of this._gameObjects.values()) {
            if (obj.collider) {
                this._quadTree.insert(obj)
            }
        }

        // Update all game objects
        for (const obj of this._gameObjects.values()) {
            obj.collider.updatePosition(
                vec2D(obj.position.x, -obj.position.y),
                obj.rotation
            )
            obj.update(deltaTime)
        }

        // Update weather effects
        if (this._weatherSystem) {
            this._weatherSystem.update(deltaTime)
        }

        // Update race status
        this._raceManager.update()
        
        // Process collisions and overlaps
        this.overlapManager.processOverlaps()
    }

    // Render the scene
    draw(ctx: CanvasRenderingContext2D): void {
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // Set up camera and scaling
        ctx.save()
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
        ctx.scale(Scene.scale, Scene.scale)

        // Draw all game objects
        for (const obj of this._gameObjects.values()) {
            // Draw debug visualization if enabled
            if (this._debugMode) {
                this.drawObject(ctx, obj)
            }

            // Draw sprite if available
            if (!obj.spriteManager) continue

            const spriteIndex = obj.spriteManager.getSprinteIndexByRotation(
                obj.rotation
            )
            obj.spriteManager.drawSprite(ctx, spriteIndex, obj.position)
        }

        // Draw weather effects
        if (this._weatherSystem) {
            this._weatherSystem.draw(ctx)
        }

        // Draw debug information if enabled
        if (this._debugMode) {
            this.drawRays(ctx)
        }

        ctx.restore()
    }
}
```

## Game Objects

The engine uses a hierarchical structure for game objects:

### GameObject

The base class for all objects in the game world:

```typescript
class GameObject {
    public position: Vec2D
    public size: Vec2D
    public rotation: number
    public movable: boolean
    public spriteManager: SpriteManager | undefined
    public _id: number = -1

    constructor(options: GameObjectOptions) {
        this.size = options.size || { x: 0, y: 0 }
        this.rotation = options.rotation || 0
        this.movable = options.movable || false
        this.position = options.position || { x: 0, y: 0 }
        this.spriteManager = options.spriteManager
    }

    get id(): number {
        return this._id
    }

    set id(value: number) {
        this._id = value
    }

    update(deltaTime: number): void {}
}
```

### PhysicObject

Extends `GameObject` with physics properties:

```typescript
class PhysicObject extends GameObject {
    public velocity: Vec2D
    public collider: Collider
    public mass: number

    constructor(options: PhysicObjectOptions) {
        super(options)
        this.velocity = options.velocity || { x: 0, y: 0 }
        this.collider = options.collider
        this.mass = options.mass || 1
    }

    update(deltaTime: number): void {
        if (this.movable) {
            // Update position based on velocity
            this.position.x += this.velocity.x * deltaTime
            this.position.y += this.velocity.y * deltaTime
        }
    }

    onCollision(other: PhysicObject, collisionInfo: ColliderInfo): void {
        // Basic collision response
    }
}
```

### CarObject

The specialized object for vehicles with advanced physics:

```typescript
class CarObject extends PhysicObject {
    public steerAngle: number = 0
    private throttle: number = 0
    private brake: number = 0
    private angularVelocity: number = 0
    private readonly _isPlayer: boolean = false
    private _nitroAmount: number = 0
    private _maxNitro: number
    private _nitroActive: boolean = false

    // Car physics properties
    private readonly inertia: number
    private maxGrip: number
    private readonly resistance: number = 30
    private readonly drag: number
    private readonly gravity: number = 9.81
    private readonly _frontAxleToCg: number
    private readonly _rearAxleToCg: number
    private readonly wheelBase: number
    private readonly _wheelSize: Vec2D

    constructor(options: CarObjectOptions) {
        super(options)
        this.maxGrip = options.maxGrip || 0
        this.inertia = options.mass / 2
        this._maxNitro = options.maxNitro || 100
        this.drag = options.drag || 1
        this.resistance = options.resistance || 20
        this.wheelBase = options.wheelBase || 0.4
        this._frontAxleToCg = options.frontAxleToCg || this.wheelBase / 2
        this._rearAxleToCg = options.rearAxleToCg || this.wheelBase / 2
        this._wheelSize = options.wheelSize || vec2D(0.3, 0.7)
        this._isPlayer = options.isPlayer || false
    }

    // Control methods
    setSteerAngle(angle: number): void {
        this.steerAngle = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, angle))
    }

    setThrottle(value: number): void {
        this.throttle = value
    }

    setBrake(value: number): void {
        this.brake = value
    }

    // Nitro boost functionality
    activateNitro(): boolean {
        if (this._nitroAmount > 0 && !this._nitroActive) {
            this._nitroActive = true
            return true
        }
        return false
    }

    refillNitro(amount: number = this._maxNitro): void {
        this._nitroAmount = Math.min(this._maxNitro, this._nitroAmount + amount)
    }

    // Physics update
    update(deltaTime: number): void {
        // Complex car physics calculation
        // ...

        // Apply forces to calculate new position and rotation
        // ...
    }

    // Collision handling
    onCollision(other: PhysicObject, collisionInfo: ColliderInfo): void {
        // Realistic collision response for cars
        // ...
    }
}
```

### CheckpointObject

Used for race checkpoints and finish line:

```typescript
class CheckpointObject extends PhysicObject {
    private readonly isFinishLine: boolean
    private readonly order: number
    private activated: boolean

    constructor(options: CheckpointObjectOptions) {
        super(options)
        this.isFinishLine = options.isFinishLine || false
        this.order = options.order
        this.activated = false
    }

    get isActivated(): boolean {
        return this.activated
    }

    activate(car: CarObject): void {
        if (!car.isPlayer) return
        this.activated = true
        console.log(`Checkpoint ${this.order} activated`)
    }

    get checkpointOrder(): number {
        return this.order
    }

    get isFinish(): boolean {
        return this.isFinishLine
    }
}
```

## Collision System

### Colliders

Base abstract class:

```typescript
abstract class Collider {
    public position: Vec2D

    constructor(position: Vec2D) {
        this.position = position
    }

    abstract getBoundingBox(): BoundingBox
    abstract checkCollision(other: Collider): ColliderInfo | null
    abstract updatePosition(position: Vec2D, rotation: number): void
}
```

With concrete implementations:

```typescript
class AABBCollider extends Collider {
    public size: Vec2D

    constructor(position: Vec2D, size: Vec2D) {
        super(position)
        this.size = size
    }

    // Axis-aligned bounding box collision detection
    // ...
}

class PolygonCollider extends Collider {
    public vertices: Vec2D[]
    public transformedVertices: Vec2D[]

    constructor(position: Vec2D, vertices: Vec2D[]) {
        super(position)
        this.vertices = vertices
        this.transformedVertices = [...vertices]
    }

    // Polygon collision detection using Separating Axis Theorem
    // ...
}
```

### OverlapManager

Manages collision detection and response:

```typescript
class OverlapManager {
    private _overlaps: Set<Overlap> = new Set()

    get overlaps(): Set<Overlap> {
        return this._overlaps
    }

    addOverlap(overlap: Overlap): void {
        this._overlaps.add(overlap)
    }

    removeOverlap(overlap: Overlap): void {
        this._overlaps.delete(overlap)
    }

    processOverlaps(): void {
        for (const overlap of this._overlaps) {
            // Check if the objects overlap
            const collisionInfo = overlap.obj1.collider.checkCollision(
                overlap.obj2.collider
            )

            // Call the callback with collision info
            overlap.callback(overlap.obj1, overlap.obj2, collisionInfo)
        }
    }
}
```

## Race Management

The `RaceManager` class handles race logic:

```typescript
class RaceManager {
    private checkpoints: CheckpointObject[] = []
    private cars: Map<number, CarObject> = new Map()
    private raceStartTime: number = 0
    private raceResults: RaceResults[] = []
    private _isRaceFinished: boolean = false
    private carProgress: Map<number, CarProgress> = new Map()
    private readonly config: RaceConfiguration

    constructor(config: RaceConfiguration = { 
        totalLaps: 3, 
        checkpointTimeout: 20000 
    }) {
        this.config = config
        this.raceStartTime = performance.now()
    }

    // Add a checkpoint to the race
    addCheckpoint(checkpoint: CheckpointObject): void {
        this.checkpoints.push(checkpoint)
        this.checkpoints.sort((a, b) => a.checkpointOrder - b.checkpointOrder)
    }

    // Add a car to the race
    addCar(car: CarObject): void {
        this.cars.set(car.id, car)
        this.carProgress.set(car.id, {
            lastCheckpoint: -1,
            currentLap: 0,
            lapStartTime: this.raceStartTime,
            bestLapTime: Infinity,
            lapTimes: [],
            lastCheckpointTime: this.raceStartTime,
        })
    }

    // Update race state
    update(): void {
        // Check cars against checkpoints
        // Update lap counts and times
        // Determine race position
        // Check for race completion
    }

    // Get race results
    get results(): RaceResults[] {
        return this.raceResults
    }

    // Check if race is finished
    get isRaceFinished(): boolean {
        return this._isRaceFinished
    }

    // Get progress data for a specific car
    getCarProgress(carId: number): CarProgress | undefined {
        return this.carProgress.get(carId)
    }
}
```

Each of these core components has additional functionality and methods not shown here for brevity. Together, they provide a comprehensive framework for building racing games with realistic physics, AI opponents, and complete race management.