# Getting Started with Kajak Racing

## Overview
Kajak Racing is a 2D arcade-style racing game featuring dynamic weather effects, power-ups, and customizable vehicles. Race against AI opponents with unique driving styles while mastering the physics-based driving system.

## Getting Started

### Installation
1. Clone the repository: `git clone https://github.com/KajakSolutions/KajakEngine.git`
2. Install dependencies: `npm install`
3. Start the game: `npm run dev`
4. Open in browser: `http://localhost:5173`

### Controls
- **Arrows**: ↑ (Accelerate), ↓ (Brake/Reverse), ← → (Steering)
- **Space**: Activate nitro boost
- **B**: Drop banana peel
- **F12/`**: Developer console
- **Escape**: Pause game

## Game Features

### Vehicles
Each vehicle has unique characteristics:
- **Speed**: Affects top speed and acceleration
- **Nitro**: Determines boost efficiency and duration
- **Drive**: FWD, RWD, or 4WD handling styles

### Power-ups
- **Nitro Boosts**: Temporary speed increase
- **Banana Peels**: Drop to sabotage opponents

### Weather System
Dynamic weather conditions affect vehicle handling:
- Clear
- Rain
- Snow

### Track System
- Multiple tracks with varying difficulty
- Checkpoints and finish line detection
- Surface types affecting vehicle grip

## Developer Console
Access with **F12** or **`** during gameplay:

| Command | Description |
|---------|-------------|
| `help` | Show available commands |
| `debug` | Toggle debug visualization |
| `tp [x] [y]` | Teleport player |
| `nitro [amount]` | Set nitro amount |
| `weather [type]` | Force weather condition |
| `banana [amount]` | Give banana peels |
| `spawn banana` | Create banana near player |
| `exit` | Close console |

## Technical Architecture

### Core Components
- **MapLoader**: Parses map config files and constructs game scenes
- **Scene**: Manages game objects, collisions, and physics
- **WeatherSystem**: Handles weather transitions and effects
- **NitroManager**: Controls nitro boost pickups and usage
- **CarObject**: Player and AI vehicle physics and controls

### Collision System
- **PolygonCollider**: For complex shapes (vehicles, obstacles)
- **AABBCollider**: For simpler objects (checkpoints, powerups)

## Map Creation
Maps are defined via JSON configuration:
```json
{
  "name": "Track Name",
  "backgroundSrc": "path/to/background.png",
  "worldBounds": { "x": 0, "y": 0, "width": 2000, "height": 2000 },
  "checkpoints": [...],
  "barriers": { "thickness": 10, "segments": [...] },
  "surfaces": { "segments": [...] },
  "nitroSpawns": [...],
  "weather": { "initialWeather": "CLEAR", ... }
}
```

## Advanced Features

### Surface Types
Different surfaces affect vehicle handling:
- **Asphalt**: Normal grip
- **Dirt**: Reduced grip, drifting
- **Ice**: Minimal grip, sliding
- **Grass**: Slow speed, reduced grip

### AI Behavior Types
AI cars have different driving personalities:
- **Aggressive**: High speed, frequent nitro use
- **Defensive**: Careful driving, avoids obstacles
- **Random**: Unpredictable behavior
