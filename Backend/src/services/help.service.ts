import { appConfig } from '../config/app.config';

export const showHelpOnRoot = appConfig.showHelpOnRoot;

export function getHelpContent(): string {
  return JSON.stringify(
    {
      name: 'CorsBridge',
      version: appConfig.proxyVersion,
      message: 'Proxy endpoint ready • built by Syrins (syrins.tech). Use /?url={TARGET_URL}.',
    },
    null,
    2,
  );
}
