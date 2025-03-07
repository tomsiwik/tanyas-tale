import * as PIXI from "pixi.js";
import { config, botConfig } from "./game/config.js";
import { Player } from "./game/player.js";
import { BotManager } from "./game/bot.js";
import { EffectManager } from "./game/effects.js";
import { GameUI } from "./game/ui.js";
import { ProximityDamageSkill, ConeAttackSkill } from "./game/skills.js";

/**
 * Game class - manages the game loop and entities
 */
export class Game {
  constructor() {
    this.entities = [];
    this.lastTick = Date.now();
    this.app = null;
    this.player = null;
    this.botManager = null;
    this.effectManager = null;
    this.ui = null;
  }

  /**
   * Initialize the game
   */
  async init() {
    try {
      // Initialize PIXI Application with simplified config
      this.app = new PIXI.Application();
      await this.app.init({
        ...config,
        backgroundAlpha: 1,
        antialias: false, // Disable antialiasing for pixel-perfect rendering
        fps: 60, // Set to 60 FPS for smoother animations
      });

      // Add canvas to page
      document.querySelector("#app").appendChild(this.app.canvas);

      // Hide the default cursor
      document.body.style.cursor = "none";

      // Preload sprite atlas
      console.log("Loading sprite atlas...");
      await PIXI.Assets.load("/assets/atlas/sprite_atlas.json");
      console.log("Sprite atlas loaded successfully");

      // Create effect manager
      this.effectManager = new EffectManager(this.app);

      // Pre-allocate effects for better performance
      this.effectManager.preAllocate(botConfig.spawnCount * 2);

      // Create player
      this.player = new Player(this.app);

      // Add player to entities list
      this.entities.push(this.player);

      // Add skills to player
      this.player.addSkill(
        new ProximityDamageSkill({
          effectManager: this.effectManager,
        })
      );

      this.player.addSkill(
        new ConeAttackSkill({
          effectManager: this.effectManager,
        })
      );

      // Create bot manager to handle multiple bots
      this.botManager = new BotManager(
        this.app,
        this.player,
        this.effectManager
      );

      // Pre-allocate bots for better performance
      this.botManager.preAllocate(botConfig.spawnCount * 2);

      // Create UI
      this.ui = new GameUI(this.app);

      // Add game loop to update entities
      this.app.ticker.add(() => this.tick());

      // Log performance info
      console.log(`Game initialized with ${botConfig.spawnCount} bots`);
      console.log(`Target FPS: ${config.fps}`);
      console.log("Player skills: Proximity Damage, Cone Attack");
      console.log("Bot skills: Regeneration");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      throw error;
    }
  }

  /**
   * Game tick - updates all entities
   */
  tick() {
    // Calculate delta time
    const now = Date.now();
    const deltaTime = now - this.lastTick;
    this.lastTick = now;

    // Update effect manager
    this.effectManager.update();

    // Update player
    this.player.tick(deltaTime, this.botManager.getActiveBots());

    // Update bot manager
    this.botManager.tick(deltaTime);
  }
}

// Create and start the game
const game = new Game();
game.init().catch(console.error);
