# Design Component

Design a new UI component using the Pencil MCP before any React implementation.

**Steps:**
1. Invoke the `ui-designer` agent with the component description
2. Agent designs in Pencil, validates with screenshot
3. Agent produces a component spec (layout, states, interactions)
4. Share spec with user for approval
5. Only then invoke `react-canvas` agent to implement

**Component to design:** $ARGUMENTS
