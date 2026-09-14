import type { NodeTypes } from '@xyflow/react';
import { GeneratorNode } from './GeneratorNode/GeneratorNode';
import { PromptNode } from './PromptNode/PromptNode';
import { ResultNode } from './ResultNode/ResultNode';

export const nodeTypes: NodeTypes = {
  prompt: PromptNode,
  generator: GeneratorNode,
  result: ResultNode,
};
