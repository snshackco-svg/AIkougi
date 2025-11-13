// 認証ヘルパー関数
import { Context } from 'hono'
import bcrypt from 'bcryptjs'

// セッションIDを生成
export function generateSessionId(): string {
  return crypto.randomUUID()
}

// パスワードをハッシュ化
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// パスワードを検証
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// セッションの有効期限を計算 (7日間)
export function getSessionExpiry(): string {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)
  return expiry.toISOString()
}

// Cookieからセッションを取得
export function getSessionFromCookie(c: Context): string | null {
  const cookie = c.req.header('Cookie')
  if (!cookie) return null
  
  const match = cookie.match(/session_id=([^;]+)/)
  return match ? match[1] : null
}

// セッションを検証してユーザー情報を取得
export async function validateSession(DB: D1Database, sessionId: string) {
  const session = await DB.prepare(`
    SELECT s.*, u.username, u.role, u.company_id
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now') AND u.is_active = 1
  `).bind(sessionId).first()
  
  return session
}

// セッションを作成
export async function createSession(DB: D1Database, userId: number, companyId: number): Promise<string> {
  const sessionId = generateSessionId()
  const expiresAt = getSessionExpiry()
  
  await DB.prepare(`
    INSERT INTO user_sessions (id, user_id, company_id, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(sessionId, userId, companyId, expiresAt).run()
  
  return sessionId
}

// セッションを削除
export async function deleteSession(DB: D1Database, sessionId: string): Promise<void> {
  await DB.prepare('DELETE FROM user_sessions WHERE id = ?').bind(sessionId).run()
}

// 古いセッションをクリーンアップ
export async function cleanupExpiredSessions(DB: D1Database): Promise<void> {
  await DB.prepare(`DELETE FROM user_sessions WHERE expires_at < datetime('now')`).run()
}
