export const showHelpOnRoot = process.env.SHOW_HELP_ON_ROOT !== 'false';

export function getHelpContent(): string {
  return JSON.stringify(
    {
      name: 'CorsBridge',
      version: process.env.PROXY_VERSION ?? 'dev',
      message: 'Proxy endpoint ready • built by Syrins (syrins.tech). Use /?url={TARGET_URL}.',
    },
    null,
    2,
  );
}
