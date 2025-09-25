import * as NextAuthModule from 'next-auth';
import { authOptions } from '@/lib/auth';

const NextAuth: any = (NextAuthModule as any).default || NextAuthModule;
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };