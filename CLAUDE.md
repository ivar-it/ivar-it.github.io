# Flappy Bird - Apocalypse Edition

Simple browser-based Flappy Bird game with apocalyptic theme.

## Key Features
- Touch/click controls for mobile and desktop
- Client-side only (no backend needed)
- Dark orange/red apocalyptic color scheme
- Sound effects and music
- High score tracking via localStorage
- Responsive canvas scaling

## Development Guidelines

### Version Updates ⚠️
**IMPORTANT:** Always update the version number in `flappy-bird.html` when making changes:
- Increment the version number in: `const version = 'X.X.X';`
- Version format: **Pre-Alpha** format is `0.MAJOR.MINOR` (e.g., 0.1.0, 0.1.1, 0.1.9)
  - `0.X.X` = Pre-alpha/development stage
  - Once stable → `1.0.0`
- **Update on EVERY commit/change to the game**

### Code Structure
- Single HTML file with embedded CSS and JavaScript
- Uses HTML5 Canvas for rendering
- Web Audio API for sound effects

### Game Systems
- **Physics**: Gravity-based bird movement with simple lift mechanic
- **Collision**: Rectangle-based collision detection with pipes
- **Scoring**: Points awarded for passing through pipe gaps
- **Audio**: Sound effects via Web Audio API (jump, score, game over, start music)

### File Locations
- Main game: `/flappy-bird.html`
- Documentation: `/CLAUDE.md`

## Commit Message Format
When committing changes, include:
1. Brief summary of changes
2. Updated version number reference
3. What was changed (features, fixes, improvements)

Example:
```
Add start screen and update version to 1.3

- Added start screen display on load
- Game only starts on first tap/click
- Updated version number to 1.3
```

---
Game Version: See `const version` in flappy-bird.html
