# KajakEngine Core Functions

This document explores the five essential core functions that drive KajakEngine's racing game framework.

## 1. Game Loop Management

The game loop is the heart of any game engine, responsible for updating game state and rendering at appropriate intervals.

```typescript
// In KajakEngine class:
start(): void {
    if (!this._running) {
    this._running = true
    this._lastTimestamp = performance.now()
    requestAnimationFrame(this.gameLoop)
}
}

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

stop(): void {
    this._running = false
}
```

### Key Aspects:

- **Delta Time Calculation**: Ensures consistent physics regardless of frame rate
- **Scene Update/Draw Cycle**: Maintains separation between logic and rendering
- **RequestAnimationFrame**: Uses browser's native timing mechanism for optimal performance
- **Start/Stop Control**: Allows pausing and resuming the game

The game loop calculates the time elapsed between frames (`deltaTime`), which is crucial for ensuring physics and animations run at the same speed regardless of the device's performance. This is especially important in racing games where timing and physics calculations need to be consistent.

## 2. Scene Management

The scene management system handles the creation, switching, and management of different game scenes (tracks, menus, etc.).

```typescript
// In KajakEngine class:
get scenes(): Map<number, Scene> {
    return this._scenes
}

setCurrentScene(sceneId: number): void {
    const scene = this._scenes.get(sceneId)
    if (scene) {
        this._currentScene = scene
        this._canvas.style.cssText = `
            background: rgba(0, 0, 0, 1);
            background-size: cover;
        `
        this._canvas.style.backgroundImage = `url(${this._currentScene.map.backgroundSrc})`
        
        // Additional setup...
    }
}

// Usage example:
const worldBounds = { x: -100, y: -100, width: 200, height: 200 }
const mapObject = new MapObject({
    backgroundSrc: "track01.png",
    worldBounds: worldBounds 
})
const scene = new Scene(worldBounds, mapObject)

engine.scenes.set(1, scene)
engine.setCurrentScene(1)
```

### Key Aspects:

- **Multiple Scene Support**: Allows switching between different tracks or game states
- **Background Management**: Automatically handles visual styling based on the scene
- **Scene Registration**: Organizes scenes with numeric IDs for easy reference
- **Scene Context Switching**: Properly transfers game state when changing scenes

Scene management allows the racing game to have separate tracks, menus, garage screens, and other distinct visual and logical environments while efficiently managing resources.

## 3. Physics and Collision System

The physics system is perhaps the most complex part of the racing engine, providing realistic vehicle movement and collision detection.

```typescript
// In CarObject class:
update(deltaTime: number): void {
    // Calculate car physics
    const angle = this.rotation
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)

    // Convert to local car coordinates
    const localVelocity = {
        forward: this.velocity.x * sinAngle + this.velocity.y * cosAngle,
        right: this.velocity.x * cosAngle - this.velocity.y * sinAngle,
    }

    // Calculate weight distribution
    const weight = this.mass * this.gravity
    const rearNormal = (this._rearAxleToCg / this.wheelBase) * weight
    const frontNormal = (this._frontAxleToCg / this.wheelBase) * weight

    // Calculate slip angles for wheels
    let frontSlipAngle = 0
    let rearSlipAngle = 0
    const speed = Math.abs(localVelocity.forward)

    if (speed !== 0) {
        // Front wheel slip calculation
        frontSlipAngle = Math.atan2(
            localVelocity.right + this.angularVelocity * this._frontAxleToCg,
            speed
        ) - this.steerAngle
        
        // Rear wheel slip calculation
        rearSlipAngle = Math.atan2(
            localVelocity.right - this.angularVelocity * this._rearAxleToCg,
            speed
        )
    }

    // Calculate lateral forces based on slip angles
    const frontLateralForce = this.caFront * frontSlipAngle * frontNormal * surfaceProps.gripMultiplier
    const rearLateralForce = this.caRear * rearSlipAngle * rearNormal * surfaceProps.gripMultiplier

    // Calculate drive and resistance forces
    const tractionForce = this.throttle * 100 * (this._nitroActive ? this._nitroStrength : 1.0)
    const resistanceForce = -(this.resistance + this.drag * Math.abs(localVelocity.forward)) * localVelocity.forward

    // Apply forces to determine new velocity and position
    // ...
}

// In OverlapManager class:
processOverlaps(): void {
    for (const overlap of this._overlaps) {
        // Check if the objects overlap
        const collisionInfo = overlap.obj1.collider.checkCollision(overlap.obj2.collider)
        
        // Call the callback with collision info
        if (collisionInfo || overlap.options.alwaysCallback) {
            overlap.callback(overlap.obj1, overlap.obj2, collisionInfo)
        }
    }
}
```

### Key Aspects:

- **Realistic Vehicle Physics**: Models slip angles, weight transfer, grip levels
- **Surface-Dependent Handling**: Different surfaces (asphalt, dirt, ice) affect grip
- **Collision Detection**: Polygon-based collision for accurate detection
- **Collision Response**: Realistic bounce and interaction between objects
- **Special Features**: Nitro boost, drift mechanics, banana peels causing slips

The physics system supports specialized surface types that affect handling differently, realistic collisions between vehicles, and special mechanics like nitro boost for arcade-style racing fun.

## 4. Race Management

The race management system handles all aspects of a racing competition, from checkpoints to lap timing and position tracking.

```typescript
// In RaceManager class:
update(): void {
    const currentTime = performance.now()

    this.cars.forEach((car) => {
        const progress = this.carProgress.get(car.id)
        if (!progress) return

        // Check for timeout (car stuck too long without hitting checkpoint)
        if (currentTime - progress.lastCheckpointTime > this.config.checkpointTimeout) {
            this.resetCarToLastCheckpoint(car)
            return
        }

        // Process checkpoints
        this.processCarCheckpoints(car, currentTime)
    })

    // Update leaderboard
    this.updateLeaderboard()
}

private completeLap(car: CarObject, currentTime: number): void {
    const progress = this.carProgress.get(car.id)
    if (!progress) return

    // Calculate lap time
    const lapTime = currentTime - progress.lapStartTime
    progress.lapTimes.push(lapTime)
    progress.bestLapTime = Math.min(progress.bestLapTime, lapTime)
    progress.currentLap++
    progress.lapStartTime = currentTime

    // Check if race is complete
    if (progress.currentLap >= this.config.totalLaps) {
        this.finishRace(car, currentTime)
    }
}

private updateLeaderboard(): void {
    // Sort cars by progress (lap and checkpoint)
    const leaderboardData = Array.from(this.carProgress.entries())
        .map(([carId, progress]) => ({
            car: this.cars.get(carId)!,
            progress,
            totalDistance: progress.currentLap * this.checkpoints.length + progress.lastCheckpoint,
        }))
        .sort((a, b) => b.totalDistance - a.totalDistance)
    
    // Update UI with leaderboard data
    // ...
}
```

### Key Aspects:

- **Checkpoint System**: Manages checkpoint activation and ordering
- **Lap Counting**: Tracks completed laps for each car
- **Timing System**: Records lap times and best times
- **Leaderboard**: Calculates and displays race positions
- **Race Completion**: Determines when cars finish the race
- **Reset Mechanism**: Puts cars back on track if they miss checkpoints

The race management system powers the competitive elements of racing games, ensuring players follow the correct track path, tracking their performance, and determining winners.

## 5. Input and AI Control

The input system handles player controls, while the AI system manages computer-controlled opponents.

```typescript
// Player input handling example:
private handleKeyDown(e: KeyboardEvent): void {
    if (!this.currentScene) return
    
    const playerCar = this.findPlayerCar()
    if (!playerCar) return

    switch (e.key) {
        case "ArrowUp":
            playerCar.setThrottle(183.91)
            break
        case "ArrowDown":
            playerCar.setThrottle(-30)
            break
        case "ArrowLeft":
            playerCar.setSteerAngle(-Math.PI / 2)
            break
        case "ArrowRight":
            playerCar.setSteerAngle(Math.PI / 2)
            break
        case " ":
            playerCar.activateNitro()
            break
    }
}

// AI Controller update:
update(scene: Scene, playerCar: CarObject): void {
    // Get AI behavior based on type
    const ai = this.getAI()
    
    // Perform raycasting to detect track boundaries and obstacles
    const raycastResults = ai.getRaycastResults(scene)
    
    // Determine optimal steering and throttle based on raycast results
    const steering = ai.calculateSteering(raycastResults)
    const throttle = ai.calculateThrottle(raycastResults)
    
    // Apply controls to the AI car
    this.car.setSteerAngle(steering)
    this.car.setThrottle(throttle)
    
    // Special behavior based on AI type (aggressive, cautious, etc.)
    if (ai.type === AIBehaviorType.AGGRESSIVE) {
        // Try to bump into the player if close
        // ...
    }
}
```

### Key Aspects:

- **Keyboard Controls**: Maps keyboard inputs to car controls
- **AI Raycasting**: Detects track boundaries and obstacles
- **Path Following**: AI navigates the track efficiently
- **Different AI Behaviors**: Supports various driving styles
- **Dynamic Difficulty**: AI can adjust to player performance

This system is crucial for making the game both playable for humans and challenging with computer-controlled opponents. The AI system uses raycasting to detect the track boundaries and obstacles, allowing it to navigate the course efficiently while adapting to different tracks.

## Conclusion

These five core functions form the foundation of the KajakEngine racing framework. Together, they create an integrated system capable of delivering immersive racing gameplay with realistic physics, competitive racing mechanics, and intelligent opponents.

Each function serves a specific purpose:
- The game loop manages timing and execution flow
- Scene management organizes different tracks and states
- Physics handles realistic movement and collisions
- Race management provides the competitive structure
- Input and AI systems enable player control and computer opponents

By understanding these core functions, developers can leverage KajakEngine to create diverse racing experiences, from arcade-style kart racers to more simulation-oriented racing games.