import { Hono } from 'hono'
import { hashPassword } from './auth'
import { logUserAction } from './logger'

type Bindings = {
  DB: D1Database
}

const adminRoutes = new Hono<{ Bindings: Bindings }>()

// ============================
// 1. 企業管理機能
// ============================

// 全企業一覧取得（管理者のみ）
adminRoutes.get('/companies', async (c) => {
  const { DB } = c.env
  const user = c.get('user')

  try {
    // 企業情報取得
    const companies = await DB.prepare(`
      SELECT * FROM companies WHERE deleted_at IS NULL ORDER BY created_at DESC
    `).all()

    // 各企業のユーザー数とシステム数を取得
    const companiesWithCounts = await Promise.all(
      companies.results.map(async (company: any) => {
        const userCount = await DB.prepare(`
          SELECT COUNT(*) as count FROM users WHERE company_id = ? AND is_active = 1
        `).bind(company.id).first()
        
        const systemCount = await DB.prepare(`
          SELECT COUNT(*) as count FROM systems WHERE company_id = ?
        `).bind(company.id).first()

        return {
          ...company,
          user_count: (userCount as any)?.count || 0,
          system_count: (systemCount as any)?.count || 0
        }
      })
    )

    return c.json(companiesWithCounts)
  } catch (error) {
    console.error('Failed to fetch companies:', error)
    return c.json({ error: 'Failed to fetch companies' }, 500)
  }
})

// 新規企業作成
adminRoutes.post('/companies', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const body = await c.req.json()

  try {
    const result = await DB.prepare(`
      INSERT INTO companies (
        name, industry, employee_count, revenue, ai_level,
        main_challenges, contact_name, contact_position,
        contact_email, contact_phone, contract_amount, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      body.industry || null,
      body.employee_count || null,
      body.revenue || null,
      body.ai_level || 'beginner',
      body.main_challenges || null,
      body.contact_name || null,
      body.contact_position || null,
      body.contact_email || null,
      body.contact_phone || null,
      body.contract_amount || 0,
      body.payment_status || 'unpaid'
    ).run()

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      'CREATE_COMPANY',
      'company',
      result.meta.last_row_id as number,
      { name: body.name }
    )

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Failed to create company:', error)
    return c.json({ error: 'Failed to create company' }, 500)
  }
})

// 企業削除（論理削除）
adminRoutes.delete('/companies/:id', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    // 企業情報取得
    const company = await DB.prepare('SELECT name FROM companies WHERE id = ?').bind(id).first()
    
    // 論理削除
    await DB.prepare(`
      UPDATE companies 
      SET deleted_at = datetime('now'), is_active = 0 
      WHERE id = ?
    `).bind(id).run()

    // 関連ユーザーも無効化
    await DB.prepare(`
      UPDATE users SET is_active = 0 WHERE company_id = ?
    `).bind(id).run()

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      'DELETE_COMPANY',
      'company',
      parseInt(id),
      { name: company?.name }
    )

    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete company:', error)
    return c.json({ error: 'Failed to delete company' }, 500)
  }
})

// 企業有効/無効切り替え
adminRoutes.patch('/companies/:id/toggle-active', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const company = await DB.prepare('SELECT is_active, name FROM companies WHERE id = ?').bind(id).first() as any

    const newStatus = company.is_active === 1 ? 0 : 1

    await DB.prepare(`
      UPDATE companies SET is_active = ? WHERE id = ?
    `).bind(newStatus, id).run()

    // 関連ユーザーも同期
    await DB.prepare(`
      UPDATE users SET is_active = ? WHERE company_id = ?
    `).bind(newStatus, id).run()

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      newStatus === 1 ? 'ACTIVATE_COMPANY' : 'DEACTIVATE_COMPANY',
      'company',
      parseInt(id),
      { name: company.name, newStatus }
    )

    return c.json({ success: true, is_active: newStatus })
  } catch (error) {
    console.error('Failed to toggle company status:', error)
    return c.json({ error: 'Failed to toggle company status' }, 500)
  }
})

// ============================
// 2. ユーザー活動ログ
// ============================

// 活動ログ一覧取得
adminRoutes.get('/activity-logs', async (c) => {
  const { DB } = c.env
  const url = new URL(c.req.url)
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const companyId = url.searchParams.get('company_id')
  const userId = url.searchParams.get('user_id')

  try {
    let query = `
      SELECT 
        al.*,
        u.username,
        c.name as company_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN companies c ON al.company_id = c.id
      WHERE 1=1
    `
    const bindings: any[] = []

    if (companyId) {
      query += ` AND al.company_id = ?`
      bindings.push(parseInt(companyId))
    }

    if (userId) {
      query += ` AND al.user_id = ?`
      bindings.push(parseInt(userId))
    }

    query += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    const logs = await DB.prepare(query).bind(...bindings).all()

    // 総件数取得
    let countQuery = `SELECT COUNT(*) as total FROM activity_logs WHERE 1=1`
    const countBindings: any[] = []
    
    if (companyId) {
      countQuery += ` AND company_id = ?`
      countBindings.push(parseInt(companyId))
    }
    
    if (userId) {
      countQuery += ` AND user_id = ?`
      countBindings.push(parseInt(userId))
    }

    const countResult = await DB.prepare(countQuery).bind(...countBindings).first() as any

    return c.json({
      logs: logs.results,
      total: countResult.total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch activity logs:', error)
    return c.json({ error: 'Failed to fetch activity logs' }, 500)
  }
})

// ============================
// 3. 統計・分析ダッシュボード
// ============================

// 管理者用統計データ取得
adminRoutes.get('/statistics', async (c) => {
  const { DB } = c.env

  try {
    // 企業統計
    const companyStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_companies,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_companies,
        SUM(contract_amount) as total_contract_value,
        SUM(CASE WHEN payment_status = 'paid' THEN contract_amount ELSE 0 END) as paid_amount
      FROM companies
      WHERE deleted_at IS NULL
    `).first()

    // ユーザー統計
    const userStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
        SUM(CASE WHEN last_login >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as weekly_active_users
      FROM users
    `).first()

    // システム統計
    const systemStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_systems,
        SUM(COALESCE(actual_time_reduction, 0)) as total_time_reduction,
        SUM(COALESCE(actual_cost_reduction, 0)) as total_cost_reduction
      FROM systems
    `).first()

    // 課題統計
    const assignmentStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_assignments
      FROM assignments
    `).first()

    // セッション統計
    const sessionStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_sessions
      FROM sessions
    `).first()

    // 最近7日間の活動
    const recentActivity = await DB.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as activity_count
      FROM activity_logs
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date DESC
    `).all()

    // 企業別システム数ランキング
    const companyRanking = await DB.prepare(`
      SELECT 
        c.id,
        c.name,
        COUNT(s.id) as system_count,
        SUM(COALESCE(s.actual_cost_reduction, 0)) as total_cost_reduction
      FROM companies c
      LEFT JOIN systems s ON c.id = s.company_id
      WHERE c.deleted_at IS NULL AND c.is_active = 1
      GROUP BY c.id, c.name
      ORDER BY system_count DESC
      LIMIT 10
    `).all()

    return c.json({
      companyStats,
      userStats,
      systemStats,
      assignmentStats,
      sessionStats,
      recentActivity: recentActivity.results,
      companyRanking: companyRanking.results
    })
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// ============================
// 4. セッション管理
// ============================

// アクティブセッション一覧取得
adminRoutes.get('/sessions/active', async (c) => {
  const { DB } = c.env

  try {
    const sessions = await DB.prepare(`
      SELECT 
        s.*,
        u.username,
        u.role,
        c.name as company_name
      FROM user_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN companies c ON s.company_id = c.id
      WHERE s.expires_at > datetime('now')
      ORDER BY s.created_at DESC
    `).all()

    return c.json(sessions.results)
  } catch (error) {
    console.error('Failed to fetch active sessions:', error)
    return c.json({ error: 'Failed to fetch active sessions' }, 500)
  }
})

// 特定セッションを強制ログアウト
adminRoutes.delete('/sessions/:sessionId', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const sessionId = c.req.param('sessionId')

  try {
    const session = await DB.prepare('SELECT user_id FROM user_sessions WHERE id = ?').bind(sessionId).first() as any

    await DB.prepare('DELETE FROM user_sessions WHERE id = ?').bind(sessionId).run()

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      'FORCE_LOGOUT',
      'session',
      session?.user_id,
      { sessionId }
    )

    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete session:', error)
    return c.json({ error: 'Failed to delete session' }, 500)
  }
})

// ユーザーの全セッションを削除
adminRoutes.delete('/sessions/user/:userId', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const userId = c.req.param('userId')

  try {
    await DB.prepare('DELETE FROM user_sessions WHERE user_id = ?').bind(userId).run()

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      'REVOKE_ALL_SESSIONS',
      'user',
      parseInt(userId)
    )

    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user sessions:', error)
    return c.json({ error: 'Failed to delete user sessions' }, 500)
  }
})

// ============================
// 5. 一括データ操作
// ============================

// データエクスポート（CSV形式）
adminRoutes.get('/export/:type', async (c) => {
  const { DB } = c.env
  const type = c.req.param('type')

  try {
    let data: any[] = []
    let headers: string[] = []

    switch (type) {
      case 'users':
        const users = await DB.prepare(`
          SELECT u.*, c.name as company_name 
          FROM users u 
          LEFT JOIN companies c ON u.company_id = c.id
          ORDER BY u.created_at DESC
        `).all()
        data = users.results
        headers = ['id', 'username', 'company_name', 'role', 'is_active', 'created_at', 'last_login']
        break

      case 'companies':
        const companies = await DB.prepare('SELECT * FROM companies WHERE deleted_at IS NULL ORDER BY created_at DESC').all()
        data = companies.results
        headers = ['id', 'name', 'industry', 'employee_count', 'revenue', 'ai_level', 'contract_amount', 'payment_status']
        break

      case 'systems':
        const systems = await DB.prepare(`
          SELECT s.*, c.name as company_name 
          FROM systems s 
          LEFT JOIN companies c ON s.company_id = c.id
          ORDER BY s.created_at DESC
        `).all()
        data = systems.results
        headers = ['id', 'company_name', 'system_name', 'category', 'priority', 'status', 'actual_time_reduction', 'actual_cost_reduction']
        break

      default:
        return c.json({ error: 'Invalid export type' }, 400)
    }

    // CSVデータ生成
    const csvLines = [headers.join(',')]
    data.forEach((row: any) => {
      const values = headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        // カンマやクォートを含む場合はエスケープ
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      csvLines.push(values.join(','))
    })

    const csv = csvLines.join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Failed to export data:', error)
    return c.json({ error: 'Failed to export data' }, 500)
  }
})

// ユーザー一括作成（CSV）
adminRoutes.post('/import/users', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const body = await c.req.json()
  const { users: importUsers } = body

  try {
    const results = []
    
    for (const importUser of importUsers) {
      try {
        const passwordHash = await hashPassword(importUser.password)
        
        const result = await DB.prepare(`
          INSERT INTO users (username, password_hash, company_id, role, is_active)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          importUser.username,
          passwordHash,
          importUser.company_id,
          importUser.role || 'user',
          importUser.is_active !== undefined ? importUser.is_active : 1
        ).run()

        results.push({ success: true, username: importUser.username, id: result.meta.last_row_id })
      } catch (error: any) {
        results.push({ success: false, username: importUser.username, error: error.message })
      }
    }

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      'BULK_IMPORT_USERS',
      'user',
      undefined,
      { count: importUsers.length, successful: results.filter(r => r.success).length }
    )

    return c.json({ results })
  } catch (error) {
    console.error('Failed to import users:', error)
    return c.json({ error: 'Failed to import users' }, 500)
  }
})

// ============================
// 6. 通知・アラート管理
// ============================

// 通知履歴一覧
adminRoutes.get('/notifications', async (c) => {
  const { DB } = c.env
  const url = new URL(c.req.url)
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  try {
    const notifications = await DB.prepare(`
      SELECT 
        n.*,
        u.username
      FROM notification_history n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    const countResult = await DB.prepare('SELECT COUNT(*) as total FROM notification_history').first() as any

    return c.json({
      notifications: notifications.results,
      total: countResult.total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
})

// システム設定取得
adminRoutes.get('/settings', async (c) => {
  const { DB } = c.env

  try {
    const settings = await DB.prepare('SELECT * FROM system_settings').all()
    return c.json(settings.results)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return c.json({ error: 'Failed to fetch settings' }, 500)
  }
})

// システム設定更新
adminRoutes.put('/settings/:key', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const key = c.req.param('key')
  const body = await c.req.json()

  try {
    await DB.prepare(`
      UPDATE system_settings 
      SET value = ?, updated_at = datetime('now'), updated_by = ?
      WHERE key = ?
    `).bind(body.value, user.id, key).run()

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      'UPDATE_SETTING',
      'system_setting',
      undefined,
      { key, value: body.value }
    )

    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to update setting:', error)
    return c.json({ error: 'Failed to update setting' }, 500)
  }
})

// ============================
// 7. バックアップ管理
// ============================

// バックアップ履歴一覧
adminRoutes.get('/backups', async (c) => {
  const { DB } = c.env

  try {
    const backups = await DB.prepare(`
      SELECT 
        b.*,
        u.username as created_by_username
      FROM backup_history b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC
    `).all()

    return c.json(backups.results)
  } catch (error) {
    console.error('Failed to fetch backups:', error)
    return c.json({ error: 'Failed to fetch backups' }, 500)
  }
})

// バックアップ作成記録
adminRoutes.post('/backups', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const body = await c.req.json()

  try {
    const result = await DB.prepare(`
      INSERT INTO backup_history (backup_type, file_name, file_size, status, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      body.backup_type,
      body.file_name,
      body.file_size || null,
      body.status || 'completed',
      user.id
    ).run()

    await logUserAction(
      DB,
      user.id,
      user.companyId,
      'CREATE_BACKUP',
      'backup',
      result.meta.last_row_id as number,
      { backup_type: body.backup_type, file_name: body.file_name }
    )

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Failed to create backup record:', error)
    return c.json({ error: 'Failed to create backup record' }, 500)
  }
})

export default adminRoutes
