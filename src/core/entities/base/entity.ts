import { Entity as IEntity, Point } from '../../interfaces/types';
import { FeatureFlags } from '../../feature-flags';

/**
 * Base class for all components
 */
export abstract class Component {
    constructor(protected entity: BaseEntity) {}
    abstract update(deltaTime: number): void;
}

/**
 * Base entity class that supports component-based architecture
 * while maintaining compatibility with the old system
 */
export abstract class BaseEntity implements IEntity {
    private components: Map<string, Component> = new Map();
    protected position: Point = { x: 0, y: 0 };
    protected active: boolean = true;

    /**
     * Add a component to the entity
     */
    protected addComponent<T extends Component>(key: string, component: T): T {
        this.components.set(key, component);
        return component;
    }

    /**
     * Get a component by key
     */
    protected getComponent<T extends Component>(key: string): T | undefined {
        return this.components.get(key) as T;
    }

    /**
     * Get a component by key (public access for components)
     */
    public getComponentByType<T extends Component>(type: new (...args: any[]) => T): T | undefined {
        for (const component of this.components.values()) {
            if (component instanceof type) {
                return component as T;
            }
        }
        return undefined;
    }

    /**
     * Remove a component
     */
    protected removeComponent(key: string): void {
        this.components.delete(key);
    }

    /**
     * Check if entity has a component
     */
    protected hasComponent(key: string): boolean {
        return this.components.has(key);
    }

    /**
     * Get entity position
     */
    getPosition(): Point {
        // If using new position component and it exists, use it
        if (FeatureFlags.USE_POSITION_COMPONENT) {
            const positionComponent = this.getComponent('position');
            if (positionComponent) {
                return (positionComponent as any).getPosition();
            }
        }
        // Fallback to basic position
        return this.position;
    }

    /**
     * Check if entity is active
     */
    isActive(): boolean {
        return this.active;
    }

    /**
     * Update entity and all components
     */
    tick(deltaTime: number): void {
        if (!this.active) return;

        // Update all components
        for (const component of this.components.values()) {
            component.update(deltaTime);
        }

        // Allow subclasses to implement additional update logic
        this.update(deltaTime);
    }

    /**
     * Additional update logic for subclasses
     */
    protected abstract update(deltaTime: number): void;
}
