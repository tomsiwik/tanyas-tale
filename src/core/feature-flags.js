/**
 * Feature flags to control the rollout of new components
 * This allows us to gradually migrate and rollback if needed
 */
export const FeatureFlags = {
  // Component flags
  USE_POSITION_COMPONENT: true,
  USE_MOVEMENT_COMPONENT: true,
  USE_ANIMATION_COMPONENT: false,
  USE_HEALTH_COMPONENT: false,
  USE_SKILL_COMPONENT: false,
  USE_AUTOMATION_COMPONENT: false,

  // System flags
  USE_NEW_SPRITE_SYSTEM: false,
  USE_NEW_SKILL_SYSTEM: false,
  USE_NEW_ANIMATION_SYSTEM: false,
};
