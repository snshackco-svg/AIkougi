// 管理者専用API機能
// このファイルは index.tsx からインポートして使用します

import type { Context } from 'hono'
import { hashPassword } from './auth'

// ============================
// 活動ログ記録ヘルパー
// ============================

export async function logActivity(
  DB: D1Database,
  userId: number,
  companyId: number,
  action: string,
  entityType: string,
  entityId: number | null,
  details: any,
  request?: any
) {
  try {
    const detailsJson = JSON.stringify(details)
    const ipAddress = request?.headers?.get('cf-connecting-ip') || request?.headers?.get('x-forwarded-for') || 'unknown'
    const userAgent = request?.headers?.get('user-agent') || 'unknown'
    
    await DB.prepare(`
      INSERT INTO activity_logs (user_id, company_id, action, entity_type, entity_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, companyId, action, entityType, entityId, detailsJson, ipAddress, userAgent).run()
  } catch (error) {
    console.error('Failed to log activity:', error)
    // ログ記録失敗は処理を止めない
  }
}

// ============================
// 企業管理API
// ============================

// 全企業一覧（管理者のみ）
export async function getAllCompanies(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  
  try {
    const companies = await DB.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT s.id) as system_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
      LEFT JOIN systems s ON c.id = s.company_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all()
    
    return c.json(companies.results)
  } catch (error) {
    console.error('Failed to fetch companies:', error)
    return c.json({ error: 'Failed to fetch companies' }, 500)
  }
}

// 企業作成（管理者のみ）
export async function createCompany(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const body = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO companies (
        name, industry, employee_count, revenue, ai_level, 
        main_challenges, contact_name, contact_position, 
        contact_email, contact_phone, contract_amount, 
        payment_status, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      body.industry || '',
      body.employee_count || null,
      body.revenue || null,
      body.ai_level || 1,
      body.main_challenges || '',
      body.contact_name || '',
      body.contact_position || '',
      body.contact_email || '',
      body.contact_phone || '',
      body.contract_amount || 0,
      body.payment_status || 'pending',
      body.is_active !== undefined ? body.is_active : 1
    ).run()
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'create', 'company', result.meta.last_row_id, {
      company_name: body.name
    }, c.req.raw)
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Failed to create company:', error)
    return c.json({ error: 'Failed to create company' }, 500)
  }
}

// 企業削除（管理者のみ）
export async function deleteCompany(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const companyId = c.req.param('id')
  
  try {
    // 企業情報を取得
    const company = await DB.prepare('SELECT * FROM companies WHERE id = ?').bind(companyId).first()
    
    if (!company) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    // 関連データを削除（カスケード削除）
    // 1. カリキュラムデータ
    await DB.prepare('DELETE FROM curriculums WHERE company_id = ?').bind(companyId).run()
    
    // 2. システムデータ
    await DB.prepare('DELETE FROM systems WHERE company_id = ?').bind(companyId).run()
    
    // 3. セッションデータ
    await DB.prepare('DELETE FROM sessions WHERE company_id = ?').bind(companyId).run()
    
    // 4. 効果測定データ
    await DB.prepare('DELETE FROM measurements WHERE company_id = ?').bind(companyId).run()
    
    // 5. ユーザーセッション
    await DB.prepare('DELETE FROM user_sessions WHERE company_id = ?').bind(companyId).run()
    
    // 6. ユーザーアカウント
    await DB.prepare('DELETE FROM users WHERE company_id = ?').bind(companyId).run()
    
    // 7. 通知
    await DB.prepare('DELETE FROM notifications WHERE company_id = ?').bind(companyId).run()
    
    // 8. 活動ログ（保持するか削除するかは要件次第 - ここでは保持）
    
    // 9. 企業自体を削除
    await DB.prepare('DELETE FROM companies WHERE id = ?').bind(companyId).run()
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'delete', 'company', parseInt(companyId), {
      company_name: company.name
    }, c.req.raw)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete company:', error)
    return c.json({ error: 'Failed to delete company' }, 500)
  }
}

// 企業の有効/無効切り替え（管理者のみ）
export async function toggleCompanyStatus(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const companyId = c.req.param('id')
  const { is_active } = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE companies SET is_active = ? WHERE id = ?
    `).bind(is_active, companyId).run()
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'update', 'company', parseInt(companyId), {
      action: is_active ? 'activated' : 'deactivated'
    }, c.req.raw)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to toggle company status:', error)
    return c.json({ error: 'Failed to toggle company status' }, 500)
  }
}

// ============================
// 活動ログAPI
// ============================

// 活動ログ一覧取得（管理者のみ）
export async function getActivityLogs(c: Context) {
  const { DB } = c.env
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const companyId = c.req.query('company_id')
  const action = c.req.query('action')
  const entityType = c.req.query('entity_type')
  
  const offset = (page - 1) * limit
  
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
      query += ' AND al.company_id = ?'
      bindings.push(companyId)
    }
    
    if (action) {
      query += ' AND al.action = ?'
      bindings.push(action)
    }
    
    if (entityType) {
      query += ' AND al.entity_type = ?'
      bindings.push(entityType)
    }
    
    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?'
    bindings.push(limit, offset)
    
    const logs = await DB.prepare(query).bind(...bindings).all()
    
    // 総件数を取得
    let countQuery = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1'
    const countBindings: any[] = []
    
    if (companyId) {
      countQuery += ' AND company_id = ?'
      countBindings.push(companyId)
    }
    if (action) {
      countQuery += ' AND action = ?'
      countBindings.push(action)
    }
    if (entityType) {
      countQuery += ' AND entity_type = ?'
      countBindings.push(entityType)
    }
    
    const countResult = await DB.prepare(countQuery).bind(...countBindings).first()
    
    return c.json({
      logs: logs.results,
      pagination: {
        page,
        limit,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch activity logs:', error)
    return c.json({ error: 'Failed to fetch activity logs' }, 500)
  }
}

// ============================
// 統計ダッシュボードAPI
// ============================

// 統計データ取得（管理者のみ）
export async function getAdminStats(c: Context) {
  const { DB } = c.env
  
  try {
    // 企業統計
    const companyStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM companies
    `).first()
    
    // ユーザー統計
    const userStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users
      FROM users
    `).first()
    
    // システム統計
    const systemStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning
      FROM systems
    `).first()
    
    // カリキュラム統計
    const curriculumStats = await DB.prepare(`
      SELECT COUNT(*) as total FROM curriculums
    `).first()
    
    // セッション統計
    const sessionStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
      FROM sessions
    `).first()
    
    // 総削減効果
    const totalEffects = await DB.prepare(`
      SELECT 
        COALESCE(SUM(actual_time_reduction), 0) as total_time,
        COALESCE(SUM(actual_cost_reduction), 0) as total_cost
      FROM systems
    `).first()
    
    // 企業別システム数トップ10
    const topCompanies = await DB.prepare(`
      SELECT 
        c.name,
        COUNT(s.id) as system_count,
        COALESCE(SUM(s.actual_cost_reduction), 0) as total_cost_reduction
      FROM companies c
      LEFT JOIN systems s ON c.id = s.company_id
      WHERE c.is_active = 1
      GROUP BY c.id, c.name
      ORDER BY system_count DESC
      LIMIT 10
    `).all()
    
    // 月別システム作成数（過去12ヶ月）
    const monthlySystemCreation = await DB.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM systems
      WHERE created_at >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `).all()
    
    // 最近の活動（直近50件）
    const recentActivities = await DB.prepare(`
      SELECT 
        al.*,
        u.username,
        c.name as company_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN companies c ON al.company_id = c.id
      ORDER BY al.created_at DESC
      LIMIT 50
    `).all()
    
    return c.json({
      companyStats,
      userStats,
      systemStats,
      curriculumStats,
      sessionStats,
      totalEffects,
      topCompanies: topCompanies.results,
      monthlySystemCreation: monthlySystemCreation.results,
      recentActivities: recentActivities.results
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return c.json({ error: 'Failed to fetch admin stats' }, 500)
  }
}

// ============================
// セッション管理API
// ============================

// アクティブセッション一覧（管理者のみ）
export async function getActiveSessions(c: Context) {
  const { DB } = c.env
  
  try {
    const sessions = await DB.prepare(`
      SELECT 
        s.id,
        s.created_at,
        s.expires_at,
        u.username,
        u.role,
        c.name as company_name
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN companies c ON s.company_id = c.id
      WHERE s.expires_at > datetime('now')
      ORDER BY s.created_at DESC
    `).all()
    
    return c.json(sessions.results)
  } catch (error) {
    console.error('Failed to fetch active sessions:', error)
    return c.json({ error: 'Failed to fetch active sessions' }, 500)
  }
}

// セッション強制終了（管理者のみ）
export async function revokeSession(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const sessionId = c.req.param('sessionId')
  
  try {
    // セッション情報を取得してログに記録
    const session = await DB.prepare(`
      SELECT s.*, u.username 
      FROM user_sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = ?
    `).bind(sessionId).first()
    
    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }
    
    // セッション削除
    await DB.prepare('DELETE FROM user_sessions WHERE id = ?').bind(sessionId).run()
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'revoke', 'session', null, {
      revoked_user: session.username,
      session_id: sessionId
    }, c.req.raw)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to revoke session:', error)
    return c.json({ error: 'Failed to revoke session' }, 500)
  }
}

// ============================
// データエクスポートAPI
// ============================

// CSVエクスポート（管理者のみ）
export async function exportData(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const { type, company_id } = await c.req.json()
  
  try {
    let data: any[] = []
    let headers: string[] = []
    let filename = ''
    
    switch (type) {
      case 'companies':
        const companies = await DB.prepare(`
          SELECT * FROM companies ORDER BY name
        `).all()
        data = companies.results as any[]
        headers = ['ID', '企業名', '業種', '従業員数', '売上高', 'AI習熟度', '主な課題', '契約金額', '支払い状況']
        filename = 'companies.csv'
        break
        
      case 'users':
        const users = await DB.prepare(`
          SELECT u.*, c.name as company_name 
          FROM users u 
          LEFT JOIN companies c ON u.company_id = c.id 
          ORDER BY u.created_at DESC
        `).all()
        data = users.results as any[]
        headers = ['ID', 'ユーザー名', '企業名', 'ロール', '有効', '作成日時', '最終ログイン']
        filename = 'users.csv'
        break
        
      case 'systems':
        let systemQuery = 'SELECT s.*, c.name as company_name FROM systems s LEFT JOIN companies c ON s.company_id = c.id'
        if (company_id) {
          systemQuery += ` WHERE s.company_id = ${company_id}`
        }
        systemQuery += ' ORDER BY s.created_at DESC'
        
        const systems = await DB.prepare(systemQuery).all()
        data = systems.results as any[]
        headers = ['ID', '企業名', 'システム番号', 'システム名', '目的', 'AIツール', 'ステータス', '進捗', '時間削減', 'コスト削減']
        filename = company_id ? `systems_company_${company_id}.csv` : 'systems_all.csv'
        break
        
      case 'curriculums':
        let curriculumQuery = 'SELECT cu.*, c.name as company_name, s.name as system_name FROM curriculums cu LEFT JOIN companies c ON cu.company_id = c.id LEFT JOIN systems s ON cu.system_id = s.id'
        if (company_id) {
          curriculumQuery += ` WHERE cu.company_id = ${company_id}`
        }
        curriculumQuery += ' ORDER BY cu.created_at DESC'
        
        const curriculums = await DB.prepare(curriculumQuery).all()
        data = curriculums.results as any[]
        headers = ['ID', '企業名', 'システム名', 'カリキュラム名', '説明', '順序']
        filename = company_id ? `curriculums_company_${company_id}.csv` : 'curriculums_all.csv'
        break
        
      default:
        return c.json({ error: 'Invalid export type' }, 400)
    }
    
    // CSV生成
    const csvRows = [headers.join(',')]
    for (const row of data) {
      const values = Object.values(row).map(val => {
        // CSVエスケープ処理
        const str = String(val || '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      csvRows.push(values.join(','))
    }
    const csvContent = csvRows.join('\n')
    
    // BOM付きUTF-8で返す（Excel対応）
    const bom = '\uFEFF'
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'export', type, null, {
      filename,
      row_count: data.length
    }, c.req.raw)
    
    return new Response(bom + csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Failed to export data:', error)
    return c.json({ error: 'Failed to export data' }, 500)
  }
}

// ============================
// 一括ユーザーインポートAPI
// ============================

// ユーザー一括インポート（管理者のみ）
export async function importUsers(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const { users } = await c.req.json()
  
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    }
    
    for (const userData of users) {
      try {
        // バリデーション
        if (!userData.username || !userData.password || !userData.company_id) {
          results.failed++
          results.errors.push({
            user: userData.username || 'unknown',
            error: 'Missing required fields'
          })
          continue
        }
        
        // パスワードハッシュ化
        const passwordHash = await hashPassword(userData.password)
        
        // ユーザー作成
        await DB.prepare(`
          INSERT INTO users (username, password_hash, company_id, role, is_active)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          userData.username,
          passwordHash,
          userData.company_id,
          userData.role || 'user',
          userData.is_active !== undefined ? userData.is_active : 1
        ).run()
        
        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          user: userData.username,
          error: error.message || 'Unknown error'
        })
      }
    }
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'import', 'users', null, {
      total: users.length,
      success: results.success,
      failed: results.failed
    }, c.req.raw)
    
    return c.json(results)
  } catch (error) {
    console.error('Failed to import users:', error)
    return c.json({ error: 'Failed to import users' }, 500)
  }
}

// ============================
// 通知API
// ============================

// 通知一覧取得
export async function getNotifications(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  
  try {
    const notifications = await DB.prepare(`
      SELECT * FROM notifications 
      WHERE (user_id = ? OR user_id IS NULL) 
        AND (company_id = ? OR company_id IS NULL)
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(user.id, user.companyId).all()
    
    return c.json(notifications.results)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
}

// 通知作成（管理者のみ）
export async function createNotification(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const { title, message, type, user_id, company_id, link } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO notifications (user_id, company_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(user_id || null, company_id || null, title, message, type || 'info', link || null).run()
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'create', 'notification', result.meta.last_row_id, {
      title,
      target_user: user_id,
      target_company: company_id
    }, c.req.raw)
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return c.json({ error: 'Failed to create notification' }, 500)
  }
}

// 通知を既読にする
export async function markNotificationAsRead(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const notificationId = c.req.param('id')
  
  try {
    await DB.prepare(`
      UPDATE notifications SET is_read = 1 
      WHERE id = ? AND (user_id = ? OR user_id IS NULL)
    `).bind(notificationId, user.id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
}

// 全通知を既読にする
export async function markAllNotificationsAsRead(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  
  try {
    await DB.prepare(`
      UPDATE notifications SET is_read = 1 
      WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
    `).bind(user.id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return c.json({ error: 'Failed to mark all notifications as read' }, 500)
  }
}

// ============================
// バックアップ・復元API
// ============================

// バックアップ記録の取得（管理者のみ）
export async function getBackups(c: Context) {
  const { DB } = c.env
  
  try {
    const backups = await DB.prepare(`
      SELECT b.*, u.username as created_by_username, c.name as company_name
      FROM backups b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN companies c ON b.company_id = c.id
      ORDER BY b.created_at DESC
    `).all()
    
    return c.json(backups.results)
  } catch (error) {
    console.error('Failed to fetch backups:', error)
    return c.json({ error: 'Failed to fetch backups' }, 500)
  }
}

// バックアップ作成記録（管理者のみ）
// 注: 実際のバックアップファイル作成はCloudflare Pages環境では困難
// この関数はバックアップの記録のみを行います
export async function createBackupRecord(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const { backup_type, company_id, file_name, file_size } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO backups (backup_type, company_id, file_name, file_size, created_by, status)
      VALUES (?, ?, ?, ?, ?, 'completed')
    `).bind(backup_type, company_id || null, file_name, file_size || 0, user.id).run()
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'backup', backup_type, result.meta.last_row_id, {
      file_name,
      company_id
    }, c.req.raw)
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Failed to create backup record:', error)
    return c.json({ error: 'Failed to create backup record' }, 500)
  }
}

// 削除されたシステムの一覧取得（管理者のみ）
export async function getDeletedSystems(c: Context) {
  const { DB } = c.env
  const companyId = c.req.query('company_id')
  
  try {
    let query = `
      SELECT ds.*, u.username as deleted_by_username, c.name as company_name
      FROM deleted_systems ds
      LEFT JOIN users u ON ds.deleted_by = u.id
      LEFT JOIN companies c ON ds.company_id = c.id
      WHERE 1=1
    `
    
    const bindings: any[] = []
    if (companyId) {
      query += ' AND ds.company_id = ?'
      bindings.push(companyId)
    }
    
    query += ' ORDER BY ds.deleted_at DESC LIMIT 100'
    
    const deletedSystems = await DB.prepare(query).bind(...bindings).all()
    
    return c.json(deletedSystems.results)
  } catch (error) {
    console.error('Failed to fetch deleted systems:', error)
    return c.json({ error: 'Failed to fetch deleted systems' }, 500)
  }
}

// システム復元（管理者のみ）
export async function restoreSystem(c: Context) {
  const { DB } = c.env
  const user = c.get('user')
  const deletedSystemId = c.req.param('id')
  
  try {
    // 削除されたシステムを取得
    const deletedSystem = await DB.prepare(`
      SELECT * FROM deleted_systems WHERE id = ?
    `).bind(deletedSystemId).first() as any
    
    if (!deletedSystem) {
      return c.json({ error: 'Deleted system not found' }, 404)
    }
    
    // システムを復元
    const result = await DB.prepare(`
      INSERT INTO systems (
        company_id, system_number, name, description, 
        implementation_form, vendor_package, development_language,
        infrastructure, db_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      deletedSystem.company_id,
      deletedSystem.original_id,
      deletedSystem.name,
      deletedSystem.description,
      deletedSystem.implementation_form,
      deletedSystem.vendor_package,
      deletedSystem.development_language,
      deletedSystem.infrastructure,
      deletedSystem.db_type
    ).run()
    
    // 削除記録から削除
    await DB.prepare('DELETE FROM deleted_systems WHERE id = ?').bind(deletedSystemId).run()
    
    // ログ記録
    await logActivity(DB, user.id, user.companyId, 'restore', 'system', result.meta.last_row_id, {
      original_name: deletedSystem.name,
      company_id: deletedSystem.company_id
    }, c.req.raw)
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Failed to restore system:', error)
    return c.json({ error: 'Failed to restore system' }, 500)
  }
}
