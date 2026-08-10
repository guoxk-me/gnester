export function natsServerUrls(configuredServers: unknown): unknown {
  if (Array.isArray(configuredServers)) {
    return configuredServers;
  }

  if (typeof configuredServers !== 'string') {
    return configuredServers;
  }

  // AI modified: accept a comma-separated broker list while rejecting empty members during validation. / AI 修改：接受逗号分隔的 broker 列表，并在校验阶段拒绝空成员。
  return configuredServers.split(',').map((serverUrl) => serverUrl.trim());
}
