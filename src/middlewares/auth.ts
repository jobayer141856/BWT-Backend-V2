import type { PublicUrlProps } from '@/lib/types';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { compareSync, hash } from 'bcrypt-ts';
import { sign, verify } from 'hono/jwt';

import env from '@/env';

export async function HashPass(password: string) {
  const hashPassword = await hash(password, env.SALT);

  return hashPassword;
}

export async function ComparePass(password: string, hashPassword: string) {
  return compareSync(password, hashPassword);
}

export function isHashedPassword(password: string): boolean {
  // bcrypt hashes typically start with $2a$, $2b$, or $2y$ and are 60 characters long
  const bcryptPattern = /^\$2[ayb]\$\d{2}\$.{53}$/;
  return bcryptPattern.test(password);
}

export async function CreateToken(payload: JWTPayload) {
  return sign(payload, env.PRIVATE_KEY);
}

export async function VerifyToken(token: string) {
  const decodedPayload = await verify(token, env.PRIVATE_KEY);

  return !!decodedPayload;
}

export function isPublicRoute(url: string, method: string, query?: Record<string, string>) {
  // Dynamic public route check for /work endpoints
  const isWorkPublic = url.startsWith('/v1/work') && query?.public === 'true';

  if (isWorkPublic) {
    return true;
  }

  const publicUrls: PublicUrlProps[] = [
    { url: '/v1/hr/user/login', method: 'POST' },
    { url: '/v1/hr/employee-login', method: 'POST' },
    { url: '/v1/public', method: 'GET' },
    { url: '/v1/other/model/value/label', method: 'GET' },
    { url: '/v1/other/brand/value/label', method: 'GET' },
    { url: '/v1/work/info', method: 'POST' },
    { url: '/v1/work/order', method: 'POST' },
    { url: '/v1/uploads', method: 'GET' },
    { url: '/v1/work/order', method: 'GET' }, // ! public route need to add
    { url: '/v1/work/info', method: 'GET' }, // ! public route need to add
    { url: '/v1/work/order-by-info', method: 'GET' }, // ! public route need to add
    { url: '/v1/work/diagnosis-by-order', method: 'GET' }, // ! public route need to add
    { url: '/v1/work/process', method: 'GET' }, // ! public route need to add
  ];

  // Check for api-docs routes
  if (url.startsWith('/api-docs')) {
    return true;
  }

  return publicUrls.some(route => url.startsWith(route.url) && route.method === method);
}

export const ALLOWED_ROUTES: string[] = [
  'http://localhost:3005',
  'http://localhost:3000',
  'http://192.168.10.58:5090',
  'http://103.147.163.46:5090',
  'http://192.168.10.58:4070',
  'http://103.147.163.46:4070',
  'http://192.168.10.58:4076',
  'http://103.147.163.46:4076',
];
