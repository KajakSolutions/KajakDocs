# Map Object

The `MapObject` represents the racing track itself in KajakEngine. It defines the background, world boundaries, and other track-wide properties.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| backgroundSrc | string | Path to the background image |
| secondBackgroundSrc | string | Optional path to a secondary background layer |
| worldBounds | BoundingBox | Defines the boundaries of the game world |

## Implementation Example

### Basic Map Creation

```typescript
// Create a simple map
const mapObject = new MapObject({
    backgroundSrc: "assets/tracks/desert_track.png",
    worldBounds: { 
        x: -100, 
        y: -100, 
        width: 200, 
        height: 200 
    }
});

// Create a scene with the map
const scene = new Scene(mapObject.worldBounds, mapObject);
```

### Map with Multiple Layers

```typescript
// Create a map with multiple background layers
const mapObject = new MapObject({
    backgroundSrc: "assets/tracks/city_track_base.png",
    secondBackgroundSrc: "assets/tracks/city_track_buildings.png",
    worldBounds: { 
        x: -150, 
        y: -150, 
        width: 300, 
        height: 300 
    }
});

// Create a scene with the map
const scene = new Scene(mapObject.worldBounds, mapObject);
```

### Using the MapLoader

In practice, maps are typically loaded from JSON files using the `MapLoader`:

```typescript
// Load a map from a JSON file
const scene = await MapLoader.loadMap("src/assets/race-track02.json");

// Add the scene to the engine
engine.scenes.set(1, scene);
engine.setCurrentScene(1);
```

Example JSON map file:

```json
{
  "name": "Desert Circuit",
  "backgroundSrc": "assets/tracks/desert_track.png",
  "secondBackgroundSrc": "assets/tracks/desert_track_overlay.png",
  "worldBounds": { 
    "x": -100, 
    "y": -100, 
    "width": 200, 
    "height": 200 
  },
  "startPosition": { "x": 0, "y": 0 },
  "startRotation": 90,
  "checkpoints": [
    // Checkpoint definitions...
  ],
  "barriers": {
    "thickness": 1,
    "segments": [
      { "start": { "x": -50, "y": -50 }, "end": { "x": 50, "y": -50 } },
      { "start": { "x": 50, "y": -50 }, "end": { "x": 50, "y": 50 } },
      { "start": { "x": 50, "y": 50 }, "end": { "x": -50, "y": 50 } },
      { "start": { "x": -50, "y": 50 }, "end": { "x": -50, "y": -50 } }
    ]
  },
  "surfaces": {
    "segments": [
      {
        "start": { "x": -20, "y": -20 },
        "end": { "x": 20, "y": -20 },
        "width": 5,
        "type": "DIRT"
      }
    ]
  },
  "nitroSpawns": [
    {
      "position": { "x": 10, "y": 10 },
      "respawnTime": 30000
    }
  ],
  "itemSpawns": [
    {
      "position": { "x": -10, "y": 10 },
      "respawnTime": 15000,
      "itemTypes": ["bananaPeel", "nitro"],
      "spawnChance": 0.8
    }
  ],
  "movingBarriers": [
    {
      "position": { "x": 0, "y": 30 },
      "size": { "x": 10, "y": 2 },
      "movementTime": 3000,
      "closedWaitTime": 5000,
      "openWaitTime": 10000,
      "movementDistance": 10,
      "direction": 90,
      "spriteSrc": "assets/objects/barrier.png"
    }
  ],
  "weather": {
    "initialWeather": "RAIN",
    "minDuration": 3000,
    "maxDuration": 20000,
    "intensity": 0.8,
    "puddleSpawnPoints": [
      {
        "position": { "x": -30, "y": -10 },
        "size": { "x": 5, "y": 4 },
        "type": "puddle"
      }
    ]
  }
}
```
