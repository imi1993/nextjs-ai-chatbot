import { customProvider } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { gateway } from '@ai-sdk/gateway';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

const claudeModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

// Use an Anthropic API key when one is set, otherwise the Vercel AI Gateway.
const claude = process.env.ANTHROPIC_API_KEY
  ? anthropic(claudeModel)
  : gateway.languageModel(`anthropic/${claudeModel}`);

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
        'studio-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': claude,
        'chat-model-reasoning': claude,
        'title-model': claude,
        'artifact-model': claude,
        'studio-model': claude,
      },
    });
