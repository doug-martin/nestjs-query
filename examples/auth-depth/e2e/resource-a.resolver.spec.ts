import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { refresh } from './fixtures';
import { AuthService } from '../src/auth/auth.service';

describe('Authorizers (auth - e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  let resourceAAuthorizerSpy: jest.SpyInstance | null = null;
  let resourceBAuthorizerSpy: jest.SpyInstance | null = null;
  let resourceCAuthorizerSpy: jest.SpyInstance | null = null;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        forbidUnknownValues: true,
      }),
    );

    await app.init();
    await refresh(app.get(Connection));
  });

  beforeEach(async () => {
    const authService = app.get(AuthService);
    jwtToken = (await authService.login({ username: 'nestjs-query', id: 1 })).accessToken;

    const ResourceADTOAuthorizer = app.get('ResourceADTOAuthorizer', { strict: false });
    const ResourceBDTOAuthorizer = app.get('ResourceBDTOAuthorizer', { strict: false });
    const ResourceCDTOAuthorizer = app.get('ResourceCDTOAuthorizer', { strict: false });
    resourceAAuthorizerSpy = jest.spyOn(ResourceADTOAuthorizer.authOptions, 'authorize');
    resourceBAuthorizerSpy = jest.spyOn(ResourceBDTOAuthorizer.authOptions, 'authorize');
    resourceCAuthorizerSpy = jest.spyOn(ResourceCDTOAuthorizer.authOptions, 'authorize');
  });

  afterAll(() => refresh(app.get(Connection)));

  describe('Authorizers', () => {
    it('should call all involved authorizers', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          resourceA(id: 1) {
            id
            resourceBs {
              edges {
                node {
                  id
                  resourceCs {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              resourceA: {
                id: '1',
                resourceBs: {
                  edges: [
                    {
                      node: {
                        id: '1',
                        resourceCs: {
                          edges: [
                            {
                              node: {
                                id: '1',
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          });
          // TODO: proof what instanced called what authorizer?
          expect(resourceAAuthorizerSpy).toHaveBeenCalledTimes(1);
          expect(resourceBAuthorizerSpy).toHaveBeenCalledTimes(1);
          expect(resourceCAuthorizerSpy).toHaveBeenCalledTimes(1);
        }));
  });

  afterAll(async () => {
    await app.close();
  });
});
