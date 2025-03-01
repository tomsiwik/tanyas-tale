import * as PIXI from 'pixi.js';
import { config, botConfig } from './game/config.js';
import { Player } from './game/player.js';
import { BotManager } from './game/bot.js';
import { EffectManager } from './game/effects.js';
import { GameUI } from './game/ui.js';
import { ProximityDamageSkill } from './game/skills.js';

async function startGame() {
    // Initialize PIXI Application with simplified config
    const app = new PIXI.Application();
    await app.init({
        ...config,
        backgroundAlpha: 1,
        antialias: false, // Disable antialiasing for pixel-perfect rendering
        fps: 60 // Set to 60 FPS for smoother animations
    });

    // Add canvas to page
    document.querySelector('#app').appendChild(app.canvas);

    // Hide the default cursor
    document.body.style.cursor = 'none';

    // Create player
    const player = new Player(app);
    
    // Create effect manager
    const effectManager = new EffectManager(app);
    
    // Pre-allocate effects for better performance
    effectManager.preAllocate(botConfig.spawnCount * 2);
    
    // Create bot manager to handle multiple bots
    const botManager = new BotManager(app, player, effectManager);
    
    // Pre-allocate bots for better performance
    botManager.preAllocate(botConfig.spawnCount * 2);
    
    // Add proximity damage skill to player
    player.skillManager.addSkill(new ProximityDamageSkill(player, {
        effectManager: effectManager
    }));
    
    // Create UI
    const ui = new GameUI(app);
    
    // Add game loop to update managers
    app.ticker.add((delta) => {
        // Update bot manager
        botManager.update(delta);
        
        // Update effect manager
        effectManager.update();
        
        // Update player skills
        player.skillManager.update(delta, botManager.getActiveBots());
    });
    
    // Log performance info
    console.log(`Game initialized with ${botConfig.spawnCount} bots`);
    console.log(`Target FPS: ${config.fps}`);
    console.log('Player skills: Proximity Damage');
    console.log('Bot skills: Regeneration');
}

// Start the game
startGame().catch(console.error);
