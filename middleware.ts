import { InsforgeMiddleware } from '@insforge/nextjs/middleware';

export default InsforgeMiddleware({
  baseUrl: process.env.INSFORGE_BASE_URL!,
  publicRoutes: ['/auth/callback', '/', '/leaderboard'],
  cookieName: 'insforge_token',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
