import type { CanvasSnapshot } from '../types/snapshot';

export type PromptTemplate = {
  name: string;
  description: string;
  snapshot: CanvasSnapshot;
};

function makeTemplate(
  name: string, description: string, systemText: string, intentText: string,
): PromptTemplate {
  const now = new Date().toISOString();
  return {
    name,
    description,
    snapshot: {
      version: 1,
      name,
      createdAt: now,
      intent: intentText,
      nodes: [
        {
          id: `sys-template-${name}`,
          type: 'systemInstruction',
          position: { x: 200, y: 50 },
          data: { text: systemText },
        },
      ],
      edges: [],
    },
  };
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  makeTemplate(
    'Code Review',
    'Review code for bugs, readability, and best practices',
    'You are a senior code reviewer. Analyze the provided code for bugs, security issues, readability problems, and adherence to best practices. Be specific and actionable in your feedback.',
    'Review the following code for bugs and readability',
  ),
  makeTemplate(
    'Refactor',
    'Improve code structure and maintainability',
    'You are a refactoring specialist. Suggest concrete improvements to the provided code focusing on readability, maintainability, and reducing complexity. Preserve existing behavior.',
    'Refactor the following code to improve structure and maintainability',
  ),
  makeTemplate(
    'Bug Fix',
    'Find and fix bugs in the provided code',
    'You are debugging the following code. Identify the root cause of the bug, explain why it occurs, and provide a corrected implementation.',
    'Find and fix the bug described below',
  ),
  makeTemplate(
    'Explain Code',
    'Get a step-by-step explanation of how code works',
    'You are a technical writer explaining code to a developer. Break down the code into logical sections and explain each part clearly, including data flow and key decisions.',
    'Explain how this code works step by step',
  ),
  makeTemplate(
    'New Feature',
    'Plan and implement a new feature',
    'You are a senior software engineer. Analyze the existing codebase provided and design a new feature that integrates cleanly. Consider edge cases, error handling, and consistency with existing patterns.',
    'Implement the following new feature',
  ),
];
