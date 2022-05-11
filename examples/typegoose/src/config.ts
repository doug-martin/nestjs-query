export interface AuthConfig {
  header: string;
}
export interface Config {
  auth: AuthConfig;
}

export const config: Config = {
  auth: {
    header: 'super-secret',
  },
};
