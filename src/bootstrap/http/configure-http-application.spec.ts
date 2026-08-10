import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'config/config.types';
import { configureHttpApplication } from './configure-http-application';

describe('configureHttpApplication', () => {
  it('applies the shared HTTP policy and returns the selected process port', () => {
    const configService = {
      get: jest.fn().mockReturnValue(Environment.Test),
      getOrThrow: jest.fn().mockReturnValue(4100),
    };
    const enableVersioning = jest.fn();
    const useGlobalPipes = jest.fn();
    const app = {
      enableVersioning,
      get: jest.fn().mockImplementation((provider: unknown) => {
        if (provider === ConfigService) {
          return configService;
        }

        throw new Error('Unexpected provider');
      }),
      useGlobalPipes,
    } as unknown as INestApplication;

    const port = configureHttpApplication(app, {
      portConfigKey: 'PORT',
    });

    expect(port).toBe(4100);
    expect(configService.getOrThrow).toHaveBeenCalledWith('PORT');
    expect(useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
      prefix: 'v',
      defaultVersion: '1',
    });
  });
});
