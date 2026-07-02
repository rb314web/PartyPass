type EnvRecord = Record<string, string | undefined>;

/** Read env with REACT_APP_ or VITE_ prefix (Vite + legacy CRA names). */
export function readEnv(key: string): string | undefined {
  const reactKey = `REACT_APP_${key}`;
  const viteKey = `VITE_${key}`;
  const env = process.env as EnvRecord;
  return env[reactKey] ?? env[viteKey];
}

export function requireEnv(key: string): string {
  const value = readEnv(key);
  if (!value) {
    throw new Error(`Missing environment variable: REACT_APP_${key} or VITE_${key}`);
  }
  return value;
}
