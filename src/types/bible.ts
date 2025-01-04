export interface BibleLoadingState {
  stage: 'idle' | 'checking-cache' | 'downloading' | 'initializing' | 'complete';
  message: string;
}