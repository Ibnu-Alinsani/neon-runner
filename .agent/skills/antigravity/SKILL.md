# Antigravity Skill: Professional Game Engineering

This skill defines the operational policies and engineering standards for the Antigravity AI agent in the Neon Runner project. All development must adhere to these rules to ensure a high-quality, maintainable, and performant game engine.

## 🤖 AI Agent Policies

1. **Architecture First**: Do not implement features without a verified Implementation Plan.
2. **Epistemic Humility**: If a bug's cause is unverified, state "Saya belum memverifikasi hal ini." (I haven't verified this yet).
3. **No Blind Refactors**: Always `view_file` before suggesting changes to existing modules.
4. **Tool-Backed Claims**: Every factual claim about the codebase must be backed by tool output.

## 🛠️ Engineering Standards

### 1. Code Modularity
- All new features must be implemented in their own ES Module inside `src/`.
- Avoid "God Classes"; keep components focused and small.

### 2. The Singleton Engine
- The `Engine` class is the central authority. All subsystems (Renderer, Input, State) are managed by it.

### 3. Performance & Memory
- **Object Pooling**: Mandatory for any system spawning multiple entities (like Particles).
- **Garbage Collection Optimization**: Avoid creating temporary objects in the `update()` loop.

### 4. Physics & Timing
- **Fixed Time-Step**: Game logic must use the accumulated delta time pattern to ensure consistency across different refresh rates.
- **Resolution Independence**: All rendering must use the virtual coordinate system defined in `Renderer.js`.

### 5. Clean Code & Styles
- **Constants**: No "magic numbers" in logic. Use `src/utils/Constants.js`.
- **JSDoc**: Document all public methods and complex algorithms.
- **Neon Aesthetic**: Maintain the curated HSL color palette and glow filter standards.

## 🧪 Verification Policy
- Every change must include a manual or automated verification step.
- Verify game feel on both high and low refresh rate simulations where possible.
