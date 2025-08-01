const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 880,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true  // Enable debug mode to see collision boxes
        }
    },
    scene: [StartScreen, Preloader, GameScene, UIScene, DeathScreen, EndGameScreen]
};

const game = new Phaser.Game(config);