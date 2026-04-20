// Ambient shims for third-party modules without bundled TypeScript types.

declare module "mammoth/mammoth.browser" {
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{
    value: string;
    messages: Array<{ type: string; message: string }>;
  }>;
}
