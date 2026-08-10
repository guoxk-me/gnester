export interface AppFeatureFlags {
  readonly enableDatabase: boolean;
  readonly enableMultiDatabase: boolean;
  readonly enableMongodb: boolean;
  readonly enableMultiMongodb: boolean;
}

export const appFeatures: AppFeatureFlags = {
  enableDatabase: true,
  // AI modified: secondary connections stay opt-in until every deployment supplies explicit credentials. / AI 修改：在所有部署都提供明确凭据前，次连接保持显式启用。
  enableMultiDatabase: false,
  enableMongodb: false,
  enableMultiMongodb: false,
} as const;
