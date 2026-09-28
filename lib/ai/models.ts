export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Claude',
    description: 'Conversation avec Claude',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Claude (réflexion)',
    description: 'Claude, pour les questions de stratégie',
  },
];
