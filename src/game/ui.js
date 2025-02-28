import * as PIXI from 'pixi.js';
import { uiConfig } from './config.js';
import { input } from './input.js';

export class GameUI {
    constructor(app) {
        this.app = app;
        
        // Create container for UI elements
        this.container = new PIXI.Container();
        
        // Initialize UI components
        this.initCrosshair();
        this.initExpBar();
        this.initTimeBar();
        
        // Add container to stage
        app.stage.addChild(this.container);
        
        // Track game state
        this.experience = 0;
        this.maxExperience = 100;
        this.level = uiConfig.expBar.startLevel;
        this.startTime = Date.now();
        
        // Start update loop
        this.app.ticker.add(() => this.update());
    }
    
    initCrosshair() {
        // Create crosshair graphics
        this.crosshair = new PIXI.Graphics();
        
        // Draw crosshair (simple plus shape)
        this.drawCrosshair();
        
        // Add to container
        this.container.addChild(this.crosshair);
    }
    
    drawCrosshair() {
        const { size, thickness, color } = uiConfig.crosshair;
        
        this.crosshair.clear();
        
        // Draw a simple plus shape using the new PixiJS v8 API
        // Horizontal line
        this.crosshair
            .rect(-size/2, -thickness/2, size, thickness)
            .fill(color);
        
        // Vertical line
        this.crosshair
            .rect(-thickness/2, -size/2, thickness, size)
            .fill(color);
    }
    
    initExpBar() {
        const { height, padding, backgroundColor, fillColor, borderColor, borderThickness, 
                textColor, fontSize, fontFamily } = uiConfig.expBar;
        
        // Calculate actual width based on screen size
        const width = this.app.screen.width * uiConfig.expBar.width;
        
        // Create exp bar container
        this.expBarContainer = new PIXI.Container();
        this.expBarContainer.x = (this.app.screen.width - width) / 2;
        this.expBarContainer.y = padding;
        
        // Create background
        this.expBarBg = new PIXI.Graphics()
            .rect(0, 0, width, height)
            .fill(backgroundColor);
            
        // Create fill
        this.expBarFill = new PIXI.Graphics()
            .rect(0, 0, 0, height) // Start with 0 width
            .fill(fillColor);
            
        // Create border
        this.expBarBorder = new PIXI.Graphics();
        this.expBarBorder
            .setStrokeStyle({
                width: borderThickness,
                color: borderColor
            })
            .rect(0, 0, width, height);
        
        // Create percentage text (left side)
        this.expPercentText = new PIXI.Text({
            text: '0%',
            style: {
                fontFamily: fontFamily,
                fontSize: fontSize,
                fill: textColor
            }
        });
        this.expPercentText.x = -this.expPercentText.width - 10; // Position to the left of the bar
        this.expPercentText.y = (height - this.expPercentText.height) / 2; // Center vertically
        
        // Create level text (right side)
        this.levelText = new PIXI.Text({
            text: `Level ${this.level}`,
            style: {
                fontFamily: fontFamily,
                fontSize: fontSize,
                fill: textColor
            }
        });
        this.levelText.x = width + 10; // Position to the right of the bar
        this.levelText.y = (height - this.levelText.height) / 2; // Center vertically
            
        // Add to container
        this.expBarContainer.addChild(this.expBarBg);
        this.expBarContainer.addChild(this.expBarFill);
        this.expBarContainer.addChild(this.expBarBorder);
        this.expBarContainer.addChild(this.expPercentText);
        this.expBarContainer.addChild(this.levelText);
        
        // Add to main container
        this.container.addChild(this.expBarContainer);
    }
    
    initTimeBar() {
        const { height, padding, backgroundColor, fillColor, borderColor, borderThickness,
                textColor, fontSize, fontFamily, totalTime } = uiConfig.timeBar;
        
        // Calculate actual width based on screen size
        const width = this.app.screen.width * uiConfig.timeBar.width;
        
        // Create time bar container
        this.timeBarContainer = new PIXI.Container();
        this.timeBarContainer.x = (this.app.screen.width - width) / 2;
        this.timeBarContainer.y = this.app.screen.height - padding - height;
        
        // Create background
        this.timeBarBg = new PIXI.Graphics()
            .rect(0, 0, width, height)
            .fill(backgroundColor);
            
        // Create fill
        this.timeBarFill = new PIXI.Graphics()
            .rect(0, 0, width, height) // Start full
            .fill(fillColor);
            
        // Create border
        this.timeBarBorder = new PIXI.Graphics();
        this.timeBarBorder
            .setStrokeStyle({
                width: borderThickness,
                color: borderColor
            })
            .rect(0, 0, width, height);
        
        // Create elapsed time text (left side)
        this.elapsedTimeText = new PIXI.Text({
            text: '00:00',
            style: {
                fontFamily: fontFamily,
                fontSize: fontSize,
                fill: textColor
            }
        });
        this.elapsedTimeText.x = -this.elapsedTimeText.width - 10; // Position to the left of the bar
        this.elapsedTimeText.y = (height - this.elapsedTimeText.height) / 2; // Center vertically
        
        // Create remaining time text (right side)
        this.remainingTimeText = new PIXI.Text({
            text: this.formatTime(totalTime),
            style: {
                fontFamily: fontFamily,
                fontSize: fontSize,
                fill: textColor
            }
        });
        this.remainingTimeText.x = width + 10; // Position to the right of the bar
        this.remainingTimeText.y = (height - this.remainingTimeText.height) / 2; // Center vertically
            
        // Add to container
        this.timeBarContainer.addChild(this.timeBarBg);
        this.timeBarContainer.addChild(this.timeBarFill);
        this.timeBarContainer.addChild(this.timeBarBorder);
        this.timeBarContainer.addChild(this.elapsedTimeText);
        this.timeBarContainer.addChild(this.remainingTimeText);
        
        // Add to main container
        this.container.addChild(this.timeBarContainer);
    }
    
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateCrosshair() {
        // Update crosshair position to follow mouse
        const mousePos = input.getMousePosition();
        this.crosshair.x = mousePos.x;
        this.crosshair.y = mousePos.y;
    }
    
    updateExpBar() {
        const width = this.app.screen.width * uiConfig.expBar.width;
        const { height, fillColor } = uiConfig.expBar;
        
        // For demo purposes, slowly increase experience
        if (Math.random() < 0.01) {
            this.experience = Math.min(this.experience + 1, this.maxExperience);
            
            // Level up if experience is full
            if (this.experience >= this.maxExperience) {
                this.level++;
                this.experience = 0;
                this.levelText.text = `Level ${this.level}`;
            }
        }
        
        // Update fill width based on experience percentage
        const fillWidth = (this.experience / this.maxExperience) * width;
        
        this.expBarFill.clear()
            .rect(0, 0, fillWidth, height)
            .fill(fillColor);
            
        // Update percentage text
        const percent = Math.floor((this.experience / this.maxExperience) * 100);
        this.expPercentText.text = `${percent}%`;
        this.expPercentText.x = -this.expPercentText.width - 10; // Reposition as text width changes
    }
    
    updateTimeBar() {
        const width = this.app.screen.width * uiConfig.timeBar.width;
        const { height, fillColor, totalTime } = uiConfig.timeBar;
        
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, totalTime - elapsed);
        
        // Update fill width based on remaining time
        const fillWidth = (remaining / totalTime) * width;
        
        this.timeBarFill.clear()
            .rect(0, 0, fillWidth, height)
            .fill(fillColor);
            
        // Update time texts
        this.elapsedTimeText.text = this.formatTime(elapsed);
        this.elapsedTimeText.x = -this.elapsedTimeText.width - 10; // Reposition as text width changes
        
        this.remainingTimeText.text = this.formatTime(remaining);
    }
    
    update() {
        this.updateCrosshair();
        this.updateExpBar();
        this.updateTimeBar();
    }
}
