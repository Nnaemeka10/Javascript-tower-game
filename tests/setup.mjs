// tests/setup.mjs — stubs browser globals so Node can load the source modules.
// MUST be the first import in the test file (ESM evaluates imports in order).
if (typeof globalThis.window === 'undefined') {
  globalThis.window = { devicePixelRatio: 1, addEventListener() {} };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = { getElementById: () => null, addEventListener() {} };
}
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
}