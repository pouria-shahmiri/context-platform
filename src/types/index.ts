import { Block } from '../utils/pyramidLayout';

export type { Block };

export interface ContextSource {
  id: string;
  type: 'contextDocument' | 'productDefinition' | 'pyramid';
}

export interface Pyramid {
  id: string;
  userId: string;
  title: string;
  context: string | null;
  createdAt: Date | null;
  lastModified: Date | null;
  status: string;
  blocks: Record<string, Block>;
  connections: any[];
  contextSources?: ContextSource[];
}

export interface QuestionGenerationData {
  historyContext?: string;
  parentQuestions?: string[];
  parentQuestion?: string;
  combinedQuestion?: string;
  currentAnswer?: string;
}

export type BlockType = 'regular' | 'combined';

export interface ProductDefinitionNode {
  id: string;
  label: string;
  type?: string;
  description?: string;
  question?: string;
  parent?: string;
  children?: string[];
}

export interface ProductDefinition {
  id: string;
  userId: string;
  title: string;
  createdAt: Date | null;
  lastModified: Date | null;
  linkedPyramidId: string | null;
  contextSources: ContextSource[];
  data: Record<string, ProductDefinitionNode>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StoredMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | null;
  metadata: Record<string, any>;
  parentId: string;
  parentCollection: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ContextDocument {
  id: string;
  userId: string;
  title: string;
  type: string;
  content: string;
  notionId: string;
  createdAt: Date | null;
  lastModified: Date | null;
}
