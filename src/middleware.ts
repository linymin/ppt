import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 强制设置 CSP 头，明确允许 'unsafe-eval'
  // 这通常能解决 "blocks the use of 'eval'" 的问题
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' https:;"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * 1. /api/ 路由 (API 路由通常不需要 CSP，或者由各自处理) -> 其实 API 也可能返回 HTML 错误页，所以匹配也没事
     * 2. _next/static (静态文件)
     * 3. _next/image (图片优化)
     * 4. favicon.ico (图标)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
