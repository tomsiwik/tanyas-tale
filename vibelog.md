# Tanya's Tale Behavior Log

This is a living document tracking behaviors we want to implement, following Kent Beck's TDD principles:

0. Review task list, pick a logical next step (behaviour)
1. Write a small failing test for the behavior you picked (AAA - Arrange Act Assert)
2. Make it pass with the simplest code possible
3. Review your approach and check if you need to add more behaviours later
4. Refactor only after tests pass (optional and only safe refactoring - e.g. using feature flags, wrapper functions with a new version until you can deprecate them with further refactoring)

Requirements:

- Each behavior must start with a failing test
- Implementation should be the simplest possible solution
- Refactoring is optional and only after tests pass
- Feature flags for safe rollback of behaviors
- No premature optimization or over-engineering
- Never add comments & Remove comments whenever you see them
- Never add console.log
- You can use console.debug only for failing tests and need to remove them after a passing test

## Recent Improvements

- [x] Fixed bot animation to use the correct running animation
- [x] Improved bot movement state tracking for more consistent animations
- [x] Fixed sprite rendering issues for Bot entities
- [x] Resolved z-index layering to prevent health bars being hidden
- [x] Enhanced container hierarchy with proper z-indexing
- [x] Extended component system to Bot entities for consistent movement
- [x] Fixed speed discrepancy between player and bot when using same speed value
- [x] Updated movement speeds for more responsive gameplay
  - [x] Player speed increased for better responsiveness
  - [x] Bot speed balanced to maintain challenge

## Current Refactoring (Exception)

- [x] Move position logic to component
- [x] Move movement logic to component
- [x] Complete component integration
  - [x] Verify all existing game behaviors still work
  - [x] Remove duplicate position/movement code
  - [x] Clean up feature flag implementation
  - [x] Document component API

## Core Behaviors (In Priority Order)

### Combat (Primary Gameplay)

- [ ] Proximity-based damage
  - [ ] Damage scales with distance
  - [ ] Visual feedback on damage

### Bot Behavior (Enemy Challenge)

- [ ] Keep minimum distance from player
- [ ] Avoid overlapping with other bots
- [ ] Vector-based repulsion movement

### Death Sequence

- [ ] Death animation
  - [ ] Black square effect for 2 seconds
  - [ ] Fade out over 1 second
