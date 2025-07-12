# 🐍 Enhanced Snake Game

A modern, feature-rich implementation of the classic Snake game with dynamic music, power-ups, and smooth gameplay.

## 🎮 Features

- **Multiple Difficulty Levels**: Easy, Medium, and Hard modes
- **Dynamic Background Music**: Four distinct music styles (Synthwave, Minimal Techno, Energetic, Retro 8-bit)
- **Power-ups**: Speed boost, Shield protection, and Ghost mode
- **Special Food**: Bonus points with time-limited spawning
- **Particle Effects**: Visual feedback for enhanced gaming experience
- **Mobile Support**: Touch controls for mobile devices
- **Sound Effects**: Audio feedback for all game actions
- **High Score Tracking**: Persistent score storage
- **Pause/Resume**: Game state management

## 🎵 Music System

- **Synthwave**: 80s-inspired electronic music with driving arpeggios and nostalgic melodies
- **Minimal Techno**: Hypnotic, repetitive patterns with four-on-the-floor beats for focused gameplay
- **Energetic**: High-intensity electronic music with layered harmonies and dynamic sequences
- **Retro 8-bit**: Authentic chiptune with multiple themes (Arcade, Platformer, Space Shooter, Power-up)
- **Volume Control**: Adjustable music volume with persistent settings

## 🚀 Live Demo

[Play the game here](https://yourdomain.com) (Replace with your actual domain)

## 🛠️ Technologies Used

- **HTML5 Canvas** for game rendering
- **Vanilla JavaScript** for game logic
- **Web Audio API** for dynamic music generation
- **CSS3** for responsive design and animations
- **Local Storage** for persistent data

## 📱 Controls

### Desktop
- **Arrow Keys**: Move the snake
- **Space**: Pause/Resume game
- **Enter**: Start/Restart game

### Mobile
- **Touch Controls**: On-screen directional buttons
- **Tap**: Start/Restart game

## 🎯 Power-ups

1. **Speed Boost** (Green): Increases snake speed for 5 seconds
2. **Shield** (Blue): Protects from wall/self collisions for 5 seconds
3. **Ghost Mode** (Gray): Allows passing through walls and self for 5 seconds

## 🏆 Scoring System

- **Regular Food**: +10 points
- **Special Food**: +50 points (appears randomly for limited time)
- **Power-up Collection**: +25 points

## 🔧 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/snake-game.git
   cd snake-game
   ```

2. Open `index.html` in a web browser or serve with a local server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

## 🌐 Deployment

### GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source branch (usually `main` or `master`)
4. Your game will be available at `https://yourusername.github.io/repository-name`

### Custom Domain
1. Add a `CNAME` file with your domain name
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## 📁 Project Structure

```
snake-game/
├── index.html          # Main HTML file
├── script.js           # Game logic and audio system
├── style.css           # Styling and responsive design
├── README.md           # Project documentation
└── .gitignore          # Git ignore rules
```

## 🎨 Customization

The game is highly customizable:

- **Colors**: Modify CSS variables in `style.css`
- **Music**: Adjust frequencies and patterns in `script.js`
- **Game Speed**: Change difficulty settings
- **Power-up Duration**: Modify timing in power-up configurations

## 🐛 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/snake-game/issues) on GitHub.

---

**Enjoy the game! 🎮**