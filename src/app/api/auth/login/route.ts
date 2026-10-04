import { NextResponse } from 'next/server';
import type { PesmadUser } from '../../../../lib/identity/types';

type Authenticate = (input: { username: string; password: string }) => Promise<{
  identity: PesmadUser;
  idToken: string;
}>;

export async function handleLoginRequest(_body: unknown, _authenticate: Authenticate): Promise<Response> {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501, headers: { 'cache-control': 'no-store' } });
}

export async function POST(): Promise<Response> {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501, headers: { 'cache-control': 'no-store' } });
}
