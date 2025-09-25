// src/types/next-auth.d.ts
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

declare module 'next-auth/next' {
  export function getServerSession(...args: any[]): Promise<any>;
}

declare module 'next-auth/react' {
  export function useSession(...args: any[]): any;
  export function signIn(...args: any[]): Promise<any>;
  export function signOut(...args: any[]): Promise<any>;
  export const SessionProvider: any;
}