# Documentation Index

Welcome to the Leaphy Webbased Svelte block and device development documentation! This index helps you find the right documentation for your needs.

## Getting Started

### 🚀 New to Block Development?
Start here if you're new to adding blocks or devices:

1. **[Contributing Guide](CONTRIBUTING.md)** - Read this first! Complete guide covering the entire process
2. **[Temperature Sensor Example](EXAMPLE_TEMPERATURE_SENSOR.md)** - Follow this practical walkthrough
3. **[Quick Reference](QUICK_REFERENCE.md)** - Keep this handy while coding

### 🔧 Need Specific Patterns?
If you know what you want to build but need the right pattern:

- **[Block Patterns Guide](BLOCK_PATTERNS.md)** - Detailed patterns and examples for every block type

## Documentation Overview

### 📖 [Contributing Guide](CONTRIBUTING.md)
**The main guide for adding blocks and devices**

- Understanding the architecture
- Step-by-step instructions
- File structure explanation
- Translation requirements
- Testing and validation

**Best for**: First-time contributors, complete overview

### 🔧 [Block Patterns Guide](BLOCK_PATTERNS.md)
**Detailed patterns for different block types**

- Value blocks, statement blocks, hat blocks
- Pin selectors, dropdowns, multi-input blocks
- Device initialization patterns
- I2C device patterns
- Robot-specific patterns

**Best for**: Finding the right pattern for your specific block type

### ⚡ [Quick Reference](QUICK_REFERENCE.md)
**Quick lookup for common tasks**

- File locations
- Block properties
- Generator methods
- Translation conventions
- Troubleshooting checklist

**Best for**: Quick lookups while coding

### 🌡️ [Temperature Sensor Example](EXAMPLE_TEMPERATURE_SENSOR.md)
**Complete practical walkthrough**

- Real example from start to finish
- Step-by-step implementation
- Testing instructions
- Extension ideas

**Best for**: Learning by example, first implementation

## Quick Navigation

### I want to...

| Task | Go to |
|------|-------|
| Add my first block | [Contributing Guide](CONTRIBUTING.md) → [Example](EXAMPLE_TEMPERATURE_SENSOR.md) |
| Add a simple sensor | [Block Patterns](BLOCK_PATTERNS.md#sensor-reading-pattern) |
| Add a complex device | [Contributing Guide](CONTRIBUTING.md#adding-a-new-device) |
| Find specific syntax | [Quick Reference](QUICK_REFERENCE.md) |
| Debug my block | [Quick Reference](QUICK_REFERENCE.md#common-issues--solutions) |
| Add I2C device | [Block Patterns](BLOCK_PATTERNS.md#i2c-device-pattern) |
| Handle multiple robots | [Block Patterns](BLOCK_PATTERNS.md#robot-specific-patterns) |
| Add translations | [Contributing Guide](CONTRIBUTING.md#translation-requirements) |

### Block Types

| Block Type | Documentation |
|------------|---------------|
| Sensor reading | [Sensor Pattern](BLOCK_PATTERNS.md#sensor-reading-pattern) |
| Actuator control | [Actuator Pattern](BLOCK_PATTERNS.md#actuator-control-pattern) |
| Device initialization | [Initialization Pattern](BLOCK_PATTERNS.md#initialization-pattern) |
| Conditional logic | [Conditional Pattern](BLOCK_PATTERNS.md#conditional-pattern) |
| Multi-input blocks | [Multi-Input Pattern](BLOCK_PATTERNS.md#multi-input-pattern) |

## Development Workflow

### Recommended Order

1. **Plan your block(s)** - What do you want to achieve?
2. **Read the [Contributing Guide](CONTRIBUTING.md)** - Understand the system
3. **Follow the [Example](EXAMPLE_TEMPERATURE_SENSOR.md)** - See it in action
4. **Find your pattern** in [Block Patterns](BLOCK_PATTERNS.md)
5. **Use [Quick Reference](QUICK_REFERENCE.md)** while coding
6. **Test and validate** using the checklists

### File Modification Checklist

When adding a new block or device, you'll typically modify:

- [ ] Block definition file (`packages/blocks/src/blocks/*.ts`)
- [ ] Code generator file (`packages/blocks/src/generators/arduino/*.ts`)
- [ ] English translations (`packages/blocks/src/msg/translations/en.ts`)
- [ ] Dutch translations (`packages/blocks/src/msg/translations/nl.ts`)
- [ ] Dependencies (if needed) (`packages/blocks/src/generators/arduino/dependencies.ts`)
- [ ] Registration files (if new files) (`packages/blocks/src/blocks/blocks.ts`, `packages/blocks/src/generators/arduino.ts`)

## Getting Help

### Common Questions

**Q: My block doesn't appear in the toolbox**
**A:** Check the [troubleshooting section](QUICK_REFERENCE.md#common-issues--solutions)

**Q: The generated Arduino code doesn't work**
**A:** Verify dependencies and setup code in the [generator patterns](BLOCK_PATTERNS.md#initialization-pattern)

**Q: How do I handle different robot types?**
**A:** See [robot-specific patterns](BLOCK_PATTERNS.md#robot-specific-patterns)

**Q: My translations don't show up**
**A:** Check the [translation requirements](CONTRIBUTING.md#translation-requirements)

### Support

- **Issues**: Report bugs or ask questions on [GitHub Issues](https://github.com/leaphy-robotics/leaphy-webbased-svelte/issues)
- **Examples**: Look at existing implementations in `packages/blocks/src/blocks/` and `packages/blocks/src/generators/arduino/`
- **Community**: Join the Leaphy community for discussions

## Contributing to Documentation

Found an error or want to improve the documentation? 

1. Edit the relevant `.md` file in the `docs/` directory
2. Follow the same patterns as existing documentation
3. Test your examples if they include code
4. Submit a pull request

The documentation is written in Markdown and should be clear, practical, and example-driven.

---

Happy coding! 🚀