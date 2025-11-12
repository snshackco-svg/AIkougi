import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors())

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './' }))

// レンダラー設定
app.use(renderer)

// ============================
// API Routes
// ============================

// ダッシュボードデータ取得
app.get('/api/dashboard/:companyId', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')

  try {
    // 企業情報
    const company = await DB.prepare('SELECT * FROM companies WHERE id = ?').bind(companyId).first()

    // セッション進捗（完了数/24）
    const sessionStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM sessions WHERE company_id = ?
    `).bind(companyId).first()

    // 次回セッション
    const nextSession = await DB.prepare(`
      SELECT * FROM sessions 
      WHERE company_id = ? AND status = 'scheduled' AND scheduled_date >= datetime('now')
      ORDER BY scheduled_date ASC LIMIT 1
    `).bind(companyId).first()

    // システム一覧（進捗付き）
    const systems = await DB.prepare(`
      SELECT * FROM systems WHERE company_id = ? ORDER BY system_number ASC
    `).bind(companyId).all()

    // 累計削減効果
    const totalEffect = await DB.prepare(`
      SELECT 
        COALESCE(SUM(actual_time_reduction), 0) as total_time,
        COALESCE(SUM(actual_cost_reduction), 0) as total_cost
      FROM systems WHERE company_id = ? AND actual_time_reduction IS NOT NULL
    `).bind(companyId).first()

    // ROI計算
    const contractAmount = company?.contract_amount || 4000000
    const totalCostReduction = (totalEffect?.total_cost || 0) * 10000 // 万円を円に変換
    const roi = contractAmount > 0 ? ((totalCostReduction / contractAmount) * 100).toFixed(1) : '0.0'

    return c.json({
      company,
      sessionStats,
      nextSession,
      systems: systems.results,
      totalEffect: {
        time: totalEffect?.total_time || 0,
        cost: totalEffect?.total_cost || 0,
        roi: parseFloat(roi)
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
})

// 企業情報取得
app.get('/api/companies/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const company = await DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first()
    if (!company) {
      return c.json({ error: 'Company not found' }, 404)
    }
    return c.json(company)
  } catch (error) {
    return c.json({ error: 'Failed to fetch company' }, 500)
  }
})

// 企業情報更新
app.put('/api/companies/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()

  try {
    await DB.prepare(`
      UPDATE companies SET 
        name = ?, industry = ?, employee_count = ?, revenue = ?,
        ai_level = ?, main_challenges = ?, contact_name = ?,
        contact_position = ?, contact_email = ?, contact_phone = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name, body.industry, body.employee_count, body.revenue,
      body.ai_level, body.main_challenges, body.contact_name,
      body.contact_position, body.contact_email, body.contact_phone, id
    ).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update company' }, 500)
  }
})

// セッション一覧取得
app.get('/api/sessions/:companyId', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')

  try {
    const sessions = await DB.prepare(`
      SELECT * FROM sessions WHERE company_id = ? ORDER BY session_number ASC
    `).bind(companyId).all()

    return c.json(sessions.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch sessions' }, 500)
  }
})

// セッション詳細取得
app.get('/api/sessions/:companyId/:sessionNumber', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')
  const sessionNumber = c.req.param('sessionNumber')

  try {
    const session = await DB.prepare(`
      SELECT * FROM sessions WHERE company_id = ? AND session_number = ?
    `).bind(companyId, sessionNumber).first()

    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }

    return c.json(session)
  } catch (error) {
    return c.json({ error: 'Failed to fetch session' }, 500)
  }
})

// セッション更新
app.put('/api/sessions/:companyId/:sessionNumber', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')
  const sessionNumber = c.req.param('sessionNumber')
  const body = await c.req.json()

  try {
    await DB.prepare(`
      UPDATE sessions SET 
        scheduled_date = ?, theme = ?, lesson_content = ?,
        development_content = ?, status = ?, notes = ?,
        updated_at = datetime('now')
      WHERE company_id = ? AND session_number = ?
    `).bind(
      body.scheduled_date, body.theme, body.lesson_content,
      body.development_content, body.status, body.notes,
      companyId, sessionNumber
    ).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update session' }, 500)
  }
})

// システム一覧取得
app.get('/api/systems/:companyId', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')

  try {
    const systems = await DB.prepare(`
      SELECT * FROM systems WHERE company_id = ? ORDER BY system_number ASC
    `).bind(companyId).all()

    return c.json(systems.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch systems' }, 500)
  }
})

// システム詳細取得
app.get('/api/systems/:companyId/:systemNumber', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')
  const systemNumber = c.req.param('systemNumber')

  try {
    const system = await DB.prepare(`
      SELECT * FROM systems WHERE company_id = ? AND system_number = ?
    `).bind(companyId, systemNumber).first()

    if (!system) {
      return c.json({ error: 'System not found' }, 404)
    }

    // 関連する効果測定データも取得
    const measurements = await DB.prepare(`
      SELECT * FROM measurements WHERE system_id = ? ORDER BY measurement_date DESC
    `).bind(system.id).all()

    return c.json({
      system,
      measurements: measurements.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch system' }, 500)
  }
})

// システム追加
app.post('/api/systems/:companyId', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')
  const body = await c.req.json()

  try {
    // 最大のsystem_numberを取得
    const maxNumber = await DB.prepare(`
      SELECT MAX(system_number) as max_num FROM systems WHERE company_id = ?
    `).bind(companyId).first()
    
    const nextNumber = (maxNumber?.max_num || 0) + 1

    const result = await DB.prepare(`
      INSERT INTO systems (
        company_id, system_number, name, purpose, ai_tools, status,
        progress, assigned_session, expected_time_reduction, expected_cost_reduction,
        project_memo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      companyId, nextNumber, body.name, body.purpose, body.ai_tools || '[]',
      body.status || 'planning', body.progress || 0, body.assigned_session || null,
      body.expected_time_reduction || 0, body.expected_cost_reduction || 0,
      body.project_memo || ''
    ).run()

    return c.json({ success: true, id: result.meta.last_row_id, system_number: nextNumber })
  } catch (error) {
    console.error('Failed to create system:', error)
    return c.json({ error: 'Failed to create system' }, 500)
  }
})

// システム更新
app.put('/api/systems/:companyId/:systemNumber', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')
  const systemNumber = c.req.param('systemNumber')
  const body = await c.req.json()

  try {
    await DB.prepare(`
      UPDATE systems SET 
        name = ?, purpose = ?, ai_tools = ?, status = ?,
        progress = ?, expected_time_reduction = ?, expected_cost_reduction = ?,
        actual_time_reduction = ?, actual_cost_reduction = ?, project_memo = ?,
        updated_at = datetime('now')
      WHERE company_id = ? AND system_number = ?
    `).bind(
      body.name, body.purpose, body.ai_tools, body.status,
      body.progress, body.expected_time_reduction, body.expected_cost_reduction,
      body.actual_time_reduction, body.actual_cost_reduction, body.project_memo,
      companyId, systemNumber
    ).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update system' }, 500)
  }
})

// システム削除
app.delete('/api/systems/:companyId/:systemNumber', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')
  const systemNumber = c.req.param('systemNumber')

  try {
    await DB.prepare(`
      DELETE FROM systems WHERE company_id = ? AND system_number = ?
    `).bind(companyId, systemNumber).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete system' }, 500)
  }
})

// 効果測定データ取得
app.get('/api/measurements/:companyId', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')

  try {
    // システム別の効果集計
    const systemEffects = await DB.prepare(`
      SELECT 
        s.system_number, s.name, s.status,
        s.expected_time_reduction, s.expected_cost_reduction,
        s.actual_time_reduction, s.actual_cost_reduction,
        s.progress
      FROM systems s
      WHERE s.company_id = ?
      ORDER BY s.system_number ASC
    `).bind(companyId).all()

    // 月別の累計効果
    const monthlyEffects = await DB.prepare(`
      SELECT 
        strftime('%Y-%m', measurement_date) as month,
        SUM(time_reduction) as time,
        SUM(cost_reduction) as cost
      FROM measurements
      WHERE company_id = ?
      GROUP BY month
      ORDER BY month ASC
    `).bind(companyId).all()

    // 総合効果
    const totalEffect = await DB.prepare(`
      SELECT 
        COALESCE(SUM(actual_time_reduction), 0) as total_time,
        COALESCE(SUM(actual_cost_reduction), 0) as total_cost,
        COALESCE(SUM(expected_time_reduction), 0) as expected_time,
        COALESCE(SUM(expected_cost_reduction), 0) as expected_cost
      FROM systems WHERE company_id = ?
    `).bind(companyId).first()

    // ROI計算
    const company = await DB.prepare('SELECT contract_amount FROM companies WHERE id = ?').bind(companyId).first()
    const contractAmount = company?.contract_amount || 4000000
    const totalCostReduction = (totalEffect?.total_cost || 0) * 10000
    const roi = contractAmount > 0 ? ((totalCostReduction / contractAmount) * 100).toFixed(1) : '0.0'

    return c.json({
      systemEffects: systemEffects.results,
      monthlyEffects: monthlyEffects.results,
      totalEffect: {
        actual_time: totalEffect?.total_time || 0,
        actual_cost: totalEffect?.total_cost || 0,
        expected_time: totalEffect?.expected_time || 0,
        expected_cost: totalEffect?.expected_cost || 0,
        roi: parseFloat(roi),
        contract_amount: contractAmount
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch measurements' }, 500)
  }
})

// 効果測定データ追加
app.post('/api/measurements/:companyId', async (c) => {
  const { DB } = c.env
  const companyId = c.req.param('companyId')
  const body = await c.req.json()

  try {
    const result = await DB.prepare(`
      INSERT INTO measurements (company_id, system_id, measurement_date, time_reduction, cost_reduction, measurement_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      companyId, body.system_id, body.measurement_date,
      body.time_reduction, body.cost_reduction,
      body.measurement_method, body.notes
    ).run()

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to add measurement' }, 500)
  }
})

// ============================
// Frontend Routes
// ============================

// ホーム（ダッシュボード）
app.get('/', (c) => {
  return c.render(
    <div>
      <div id="app"></div>
    </div>
  )
})

export default app
