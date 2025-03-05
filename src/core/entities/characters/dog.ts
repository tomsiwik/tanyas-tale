import { Character, CharacterConfig } from '../base/character';
import { Direction } from '../../interfaces/types';
import { DamageType } from '../../interfaces/attackable';
import { AIBehavior } from '../../interfaces/automatable';
import { 
    AnimationType, 
    DirectionSuffix, 
    DEFAULT_ANIMATION_SPEED, 
    RUNNING_ANIMATION_SPEED 
} from '../../constants/animation';

export interface DogConfig extends CharacterConfig {
    // Add Dog-specific configuration options here
    biteDamage: number;
    biteSpeed: number;
}

/**
 * Dog character implementation
 * Fast melee unit that uses bite attacks
 */
export class Dog extends Character {
    private isBiting: boolean = false;
    private biteCooldown: number = 0;

    constructor(config: DogConfig) {
        super({
            ...config,
            health: {
                maxHealth: 30, // Lowest health of all units
                damageResistance: {
                    [DamageType.PHYSICAL]: 0.05, // Low resistance
                    [DamageType.EXPLOSIVE]: 0.02
                }
            },
            movement: {
                baseSpeed: 7, // Fastest unit
                acceleration: 25, // Quick acceleration
                deceleration: 15,
                maxSpeed: 10
            },
            skills: {
                initialSkills: [
                    {
                        id: 'bite',
                        name: 'Bite Attack',
                        cooldown: 1000 / config.biteSpeed,
                        range: 20, // Very short range (melee)
                        requiresTarget: true,
                        effects: [
                            {
                                damage: {
                                    amount: config.biteDamage,
                                    type: DamageType.PHYSICAL
                                }
                            }
                        ]
                    }
                ]
            },
            automation: {
                chaseRange: 250, // Long chase range
                preferredRange: 10, // Very close range for melee
                retreatRange: 0, // Dogs don't retreat
                speedMultipliers: {
                    [AIBehavior.IDLE]: 0,
                    [AIBehavior.CHASE]: 1.2, // Fast chase
                    [AIBehavior.ATTACK]: 0,
                    [AIBehavior.RETREAT]: 1,
                    [AIBehavior.PATROL]: 0.8
                }
            }
        });
    }

    /**
     * Update character state
     */
    protected update(deltaTime: number): void {
        // Update bite cooldown
        if (this.biteCooldown > 0) {
            this.biteCooldown = Math.max(0, this.biteCooldown - deltaTime);
        }

        // Update animation based on state
        this.updateAnimation();
    }

    /**
     * Update character animation
     */
    private updateAnimation(): void {
        if (!this.animationComponent || !this.movementComponent) return;

        const direction = this.movementComponent.getMoveDirection();
        const isMoving = this.movementComponent.getIsMoving();

        let animationType = AnimationType.STANDING;
        if (this.isBiting) {
            animationType = AnimationType.SHOOTING; // Reuse shooting animation for biting
        } else if (isMoving) {
            animationType = AnimationType.RUNNING;
        }

        // Convert direction to animation suffix
        const directionSuffix = this.getDirectionSuffix(direction);
        const animationKey = `${animationType}_${directionSuffix}`;

        // Play animation if it exists
        if (this.animationComponent.hasAnimation(animationKey)) {
            this.animationComponent.playAnimation({
                key: animationKey,
                speed: isMoving ? RUNNING_ANIMATION_SPEED * 1.2 : DEFAULT_ANIMATION_SPEED // Faster animations for dog
            });
        }
    }

    /**
     * Convert direction to animation suffix
     */
    private getDirectionSuffix(direction: Direction): string {
        const directionMap: Record<Direction, DirectionSuffix> = {
            [Direction.UP]: DirectionSuffix.NORTH,
            [Direction.UP_RIGHT]: DirectionSuffix.NORTH_EAST,
            [Direction.RIGHT]: DirectionSuffix.EAST,
            [Direction.DOWN_RIGHT]: DirectionSuffix.SOUTH_EAST,
            [Direction.DOWN]: DirectionSuffix.SOUTH,
            [Direction.DOWN_LEFT]: DirectionSuffix.SOUTH_WEST,
            [Direction.LEFT]: DirectionSuffix.WEST,
            [Direction.UP_LEFT]: DirectionSuffix.NORTH_WEST,
            [Direction.NONE]: DirectionSuffix.SOUTH
        };
        return directionMap[direction];
    }

    /**
     * Start bite attack
     */
    startBite(): void {
        if (this.biteCooldown > 0) return;
        this.isBiting = true;
        this.biteCooldown = 1000 / (this.config as DogConfig).biteSpeed;
    }

    /**
     * Stop bite attack
     */
    stopBite(): void {
        this.isBiting = false;
    }
}
