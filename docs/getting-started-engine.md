# Getting Started with KajakEngine

This guide will walk you through setting up your first project with KajakEngine and creating a simple racing game.

## Installation

KajakEngine can be installed through npm:

```bash
npm install kajak-engine
```

Or using your preferred package manager:

```bash
yarn add kajak-engine
# or
pnpm add kajak-engine
```

## Basic Setup

Create a new JavaScript/TypeScript file and import the necessary components from KajakEngine:

```typescript
import {
  KajakEngine,
  Scene,
  CarObject,
  MapObject,
  CheckpointObject,
  vec2D,
  PolygonCollider
} from 'kajak-engine';
```

## Creating Your First Racing Game

### 1. Set Up HTML

First, create a basic HTML file with a container for your game:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Racing Game</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #333;
    }
    #game-container {
      width: 1280px;
      height: 720px;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="./game.js"></script>
</body>
</html>
```

### 2. Initialize the Engine

Create a game.js (or game.ts) file and set up the engine:

```typescript
// Initialize the game
class Game {
  private engine: KajakEngine;
  private currentScene: Scene | null = null;

  constructor() {
    // Create a canvas and add it to the container
    const canvas = document.createElement("canvas");
    document.querySelector('#game-container')!.appendChild(canvas);
    
    // Initialize the engine with the canvas
    this.engine = new KajakEngine(canvas);
    
    // Set up event listeners for user input
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.currentScene) return;
    
    const playerCar = this.findPlayerCar();
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
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (!this.currentScene) return;
    
    const playerCar = this.findPlayerCar();
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
  }

  private findPlayerCar(): CarObject | null {
    if (!this.currentScene) return null;

    for (const obj of this.currentScene.gameObjects.values()) {
      if (obj instanceof CarObject && obj.isPlayer) {
        return obj;
      }
    }
    return null;
  }

  public async loadMap(mapPath: string): Promise<void> {
    // Load map from a JSON file
    const response = await fetch(mapPath);
    const mapConfig = await response.json();
    
    // Create world boundaries
    const worldBounds = mapConfig.worldBounds;
    
    // Create a new scene with the map
    this.currentScene = new Scene(
      worldBounds,
      new MapObject({
        backgroundSrc: mapConfig.backgroundSrc,
        worldBounds: worldBounds
      })
    );
    
    // Add the scene to the engine
    this.engine.scenes.set(1, this.currentScene);
    this.engine.setCurrentScene(1);
    
    // Create and add player car
    this.setupPlayerCar(mapConfig.startPosition);
    
    // Create and add checkpoints
    this.setupCheckpoints(mapConfig.checkpoints);
    
    // Create and add barriers
    this.setupBarriers(mapConfig.barriers);
  }

  private setupPlayerCar(startPosition: { x: number, y: number }): void {
    if (!this.currentScene) return;
    
    const playerCar = new CarObject({
      position: vec2D(startPosition.x, startPosition.y),
      size: vec2D(3, 5),
      movable: true,
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
      isPlayer: true,
      id: 0,
      surfaceManager: undefined
    });
    
    this.currentScene.addObject(playerCar);
  }

  private setupCheckpoints(checkpoints: any[]): void {
    // Implementation for adding checkpoints
  }

  private setupBarriers(barriers: any): void {
    // Implementation for adding barriers
  }

  public start(): void {
    // Start the game loop
    this.engine.start();
  }
}

// Create and start the game
async function initGame() {
  const game = new Game();
  await game.loadMap("assets/simple-track.json");
  game.start();
}

initGame().catch(error => {
  console.error("Failed to initialize game:", error);
});
```

### 3. Create a Simple Track Map

Create a JSON file named `simple-track.json` in an `assets` folder:

```json
{
  "name": "Simple Track",
  "backgroundSrc": "assets/track-bg.png",
  "worldBounds": { "x": -100, "y": -100, "width": 200, "height": 200 },
  "startPosition": { "x": 0, "y": 0 },
  "checkpoints": [
    {
      "position": { "x": 20, "y": 0 },
      "size": { "x": 5, "y": 10 },
      "rotation": 90,
      "order": 0,
      "isFinishLine": true,
      "collider": {
        "type": "AABB",
        "offset": { "x": 0, "y": 0 },
        "size": { "x": 5, "y": 10 }
      }
    },
    {
      "position": { "x": 0, "y": 30 },
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
  ],
  "barriers": {
    "thickness": 1,
    "segments": [
      { "start": { "x": -40, "y": -40 }, "end": { "x": 40, "y": -40 } },
      { "start": { "x": 40, "y": -40 }, "end": { "x": 40, "y": 40 } },
      { "start": { "x": 40, "y": 40 }, "end": { "x": -40, "y": 40 } },
      { "start": { "x": -40, "y": 40 }, "end": { "x": -40, "y": -40 } }
    ]
  }
}
```

## Running Your Game

Now you can run your game by serving your HTML file with a local development server:

```bash
npx vite
# or any other local server
```

Open your browser to the specified URL (typically http://localhost:5173) and you should see your game running with a simple track and a player-controlled car.

## Next Steps

Now that you have a basic racing game set up, you can explore more advanced features:

1. **Add AI opponents**: Create AI-controlled cars that race against the player
2. **Implement a full race**: Add proper lap counting and timing
3. **Add power-ups**: Implement nitro boosts, banana peels, or other items
4. **Improve visuals**: Add particle effects for drifting, better car sprites, etc.
5. **Add sound effects**: Engine sounds, collision effects, music, etc.

The following sections in this documentation will guide you through implementing these features and more.