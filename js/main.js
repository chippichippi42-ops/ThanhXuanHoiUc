window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.screenManager = new ScreenManager();
    
    console.log('MOBA 3v3 Arena - Game Initialized');
    console.log('Controls:');
    console.log('- WASD: Move');
    console.log('- Q, W, E, R: Abilities');
    console.log('- T: Summoner Spell');
    console.log('- ESC: Pause');
    console.log('- P: Stats Window');
});
