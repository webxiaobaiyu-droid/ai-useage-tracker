/**
 * CLI / Desktop 默认定价覆盖层（打包进产物，启动时对齐写入用户 config.pricing）。
 *
 * 完整底表仍内置在 pricing.json。远端价格覆盖已被移除（不再指向任何远程 API），
 * URL 为空表示没有远程覆盖，回退到内置 pricing.json 底表。
 */
export const BAKED_PRICING_URL = '';
export const BAKED_PRICING_TTL_MS = 60_000;
