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

export interface InfantryConfig extends CharacterConfig {
    // Add Infantry-specific configuration options here
    attackDamage: number;
    attackSpeed: number;
}

/**
 * Infantry character implementation
 * Basic soldier unit with standard movement and attack capabilities
 */
export class Infantry extends Character {
    private isAttacking: boolean = false;
    private attackCooldown: number = 0;

    constructor(config: InfantryConfig) {
        super({
            ...config,
            health: {
                maxHealth: 50, // Less health than Tanya
                damageResistance: {
                    [DamageType.PHYSICAL]: 0.1, // Less resistant than Tanya
                    [DamageType.EXPLOSIVE]: 0.05
                }
            },
            movement: {
                baseSpeed: 4, // Slower than Tanya
                acceleration: 15,
                deceleration: 8,
                maxSpeed: 6
            },
            skills: {
                initialSkills: [
                    {
                        id: 'rifle_shot',
                        name: 'Rifle Shot',
                        cooldown: 1000 / config.attackSpeed,
                        range: 150, // Shorter range than Tanya
                        requiresTarget: true,
                        effects: [
                            {
                                damage: {
                                    amount: config.attackDamage,
                                    type: DamageType.PHYSICAL
                                }
                            }
                        ]
                    }
                ]
            },
            automation: {
                chaseRange: 200, // More conservative range than Tanya
                preferredRange: 100,
                retreatRange: 40,
                speedMultipliers: {
                    [AIBehavior.IDLE]: 0,
                    [AIBehavior.CHASE]: 1,
                    [AIBehavior.ATTACK]: 0,
                    [AIBehavior.RETREAT]: 1.5, // Faster retreat than Tanya
                    [AIBehavior.PATROL]: 0.7
                }
            }
        });
    }

    /**
     * Update character state
     */
    protected update(deltaTime: number): void {
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
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
        if (this.isAttacking) {
            animationType = AnimationType.SHOOTING;
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
                speed: isMoving ? RUNNING_ANIMATION_SPEED : DEFAULT_ANIMATION_SPEED
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
     * Start attacking
     */
    startAttack(): void {
        if (this.attackCooldown > 0) return;
        this.isAttacking = true;
        this.attackCooldown = 1000 / (this.config as InfantryConfig).attackSpeed;
    }

    /**
     * Stop attacking
     */
    stopAttack(): void {
        this.isAttacking = false;
    }
}
