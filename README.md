# Flight Simulator - EngFest 2025

A 3D browser-based flight simulator game built with Three.js.

## Features

- **Realistic 3D plane model** with detailed geometry
- **Full flight controls** including pitch, roll, and yaw
- **Variable speed control** with acceleration and deceleration
- **Dynamic camera system** that follows the plane
- **Beautiful environment** with terrain, clouds, and sky
- **Real-time HUD** displaying flight parameters
- **Smooth animations** and physics

## Controls

### Flight Controls
- **↑ (Arrow Up)**: Pitch down (nose down)
- **↓ (Arrow Down)**: Pitch up (nose up)
- **← (Arrow Left)**: Roll left
- **→ (Arrow Right)**: Roll right
- **Q**: Yaw left
- **E**: Yaw right

### Speed Controls
- **Shift**: Increase speed (max 300 km/h)
- **Ctrl**: Decrease speed (min 50 km/h)

## How to Run

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
2. Wait for the game to load
3. Start flying with the keyboard controls!

### Using a Local Server (Recommended)

For the best experience, run the game through a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open your browser to: `http://localhost:8000`

## Technical Details

- **Engine**: Three.js (r128)
- **Graphics**: WebGL rendering
- **Physics**: Custom flight dynamics
- **UI**: Pure CSS with HUD overlay

## Tips for Flying

1. Start with gentle movements to get a feel for the controls
2. Use roll (left/right arrows) combined with pitch to turn
3. Watch your altitude - don't fly too low!
4. Experiment with different speeds to see how it affects handling
5. The plane has damping, so it will naturally stabilize when you release controls

## Browser Compatibility

This game works best in modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Enjoy flying! 🛩️
