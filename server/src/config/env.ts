import dotenv from 'dotenv';

dotenv.config();

const getStringFromEnvironment = (environmentKey: string, defaultValue?: string): string => {
  const environmentValue = process.env[environmentKey];

  if (environmentValue && environmentValue.length > 0) {
    return environmentValue;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing required environment variable: ${environmentKey}`);
};

const getNumberFromEnvironment = (environmentKey: string, defaultValue: number): number => {
  const environmentValue = process.env[environmentKey];
  const numericEnvironmentValue = environmentValue ? Number(environmentValue) : defaultValue;

  if (Number.isNaN(numericEnvironmentValue)) {
    throw new Error(`Invalid numeric environment variable: ${environmentKey}`);
  }

  return numericEnvironmentValue;
};

export type ClassicalOcrProvider = 'azure' | 'google' | 'none';

export interface ClassicalOcrConfiguration {
  providerName: ClassicalOcrProvider;
  azureEndpoint: string | null;
  azureKey: string | null;
  googleProjectId: string | null;
  googleCredentialsPath: string | null;
  googleVisionApiKey: string | null;
}

export interface ApplicationConfiguration {
  environment: string;
  port: number;
  classicalOcr: ClassicalOcrConfiguration;
}

const resolveClassicalOcrProvider = (): ClassicalOcrProvider => {
  const providerFromEnvironment = getStringFromEnvironment('OCR_PROVIDER', 'none').toLowerCase();

  if (providerFromEnvironment === 'azure' || providerFromEnvironment === 'google') {
    return providerFromEnvironment;
  }

  return 'none';
};

export const applicationConfiguration: ApplicationConfiguration = {
  environment: getStringFromEnvironment('NODE_ENV', 'development'),
  port: getNumberFromEnvironment('PORT', 4000),
  classicalOcr: {
    providerName: resolveClassicalOcrProvider(),
    azureEndpoint: process.env.AZURE_OCR_ENDPOINT ?? null,
    azureKey: process.env.AZURE_OCR_KEY ?? null,
    googleProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID ?? null,
    googleCredentialsPath: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH ?? null,
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY ?? null
  }
};
