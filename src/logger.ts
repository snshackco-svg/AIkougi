/**
 * 活動ログ記録ヘルパー
 */

export interface LogParams {
  userId: number
  companyId: number
  action: string
  resourceType: string
  resourceId?: number
  details?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * 活動ログを記録
 */
export async function logActivity(
  DB: D1Database,
  params: LogParams
): Promise<void> {
  try {
    await DB.prepare(`
      INSERT INTO activity_logs 
      (user_id, company_id, action, resource_type, resource_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      params.userId,
      params.companyId,
      params.action,
      params.resourceType,
      params.resourceId || null,
      params.details || null,
      params.ipAddress || null,
      params.userAgent || null
    ).run()
  } catch (error) {
    console.error('Failed to log activity:', error)
    // ログ記録失敗しても本処理には影響させない
  }
}

/**
 * ログ記録ミドルウェア
 * 全APIリクエストのログを自動記録
 */
export function loggerMiddleware() {
  return async (c: any, next: any) => {
    const user = c.get('user')
    const method = c.req.method
    const path = c.req.path
    
    // ログ記録対象外のパスをスキップ
    if (path.startsWith('/static/') || path === '/api/auth/session') {
      await next()
      return
    }
    
    // リクエスト処理
    await next()
    
    // ログインしているユーザーのみログ記録
    if (user && c.env.DB) {
      const action = `${method} ${path}`
      const details = JSON.stringify({
        status: c.res.status,
        method,
        path
      })
      
      await logActivity(c.env.DB, {
        userId: user.id,
        companyId: user.companyId,
        action,
        resourceType: 'api',
        details,
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
        userAgent: c.req.header('user-agent')
      })
    }
  }
}

/**
 * 特定のアクションを明示的に記録するヘルパー
 */
export async function logUserAction(
  DB: D1Database,
  userId: number,
  companyId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  details?: any
) {
  await logActivity(DB, {
    userId,
    companyId,
    action,
    resourceType,
    resourceId,
    details: details ? JSON.stringify(details) : undefined
  })
}
