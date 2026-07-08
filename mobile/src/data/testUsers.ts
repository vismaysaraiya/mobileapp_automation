function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} - set it in .env (see .env.example). Never hardcode credentials in source.`);
  }
  return value;
}

export const testUsers = {
  standard: {
    get mobileNumber(): string {
      return requireEnv('NMMT_TEST_MOBILE');
    },
    get password(): string {
      return requireEnv('NMMT_TEST_PASSWORD');
    },
  },
};
