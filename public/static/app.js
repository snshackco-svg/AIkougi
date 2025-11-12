// AIkougi フロントエンドアプリケーション

const COMPANY_ID = 1; // デモ用に固定（本番では認証後に設定）
let currentView = 'dashboard';
let dashboardData = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  renderSidebar();
  await loadDashboard();
  
  // URLハッシュに基づいてビューを切り替え
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

function handleRouteChange() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  navigateTo(hash);
}

async function navigateTo(view) {
  currentView = view;
  
  // サイドバーのアクティブ状態を更新
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${view}`) {
      link.classList.add('active');
    }
  });
  
  // ビューをロード
  switch(view) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'sessions':
      await loadSessions();
      break;
    case 'systems':
      await loadSystems();
      break;
    case 'measurements':
      await loadMeasurements();
      break;
    case 'company':
      await loadCompany();
      break;
    default:
      await loadDashboard();
  }
}

function renderSidebar() {
  const appDiv = document.getElementById('app');
  
  const html = `
    <div class="sidebar">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-blue-900">
          <i class="fas fa-graduation-cap mr-2"></i>
          AIkougi
        </h1>
        <p class="text-xs text-gray-500 mt-1">マルチAI統合エンジニア養成</p>
      </div>
      
      <nav class="sidebar-nav py-4">
        <a href="#dashboard" class="active">
          <i class="fas fa-chart-line"></i>
          <span>ダッシュボード</span>
        </a>
        <a href="#sessions">
          <i class="fas fa-calendar-alt"></i>
          <span>講義スケジュール</span>
        </a>
        <a href="#systems">
          <i class="fas fa-project-diagram"></i>
          <span>システム開発</span>
        </a>
        <a href="#measurements">
          <i class="fas fa-chart-bar"></i>
          <span>効果測定</span>
        </a>
        <a href="#company">
          <i class="fas fa-building"></i>
          <span>企業プロフィール</span>
        </a>
      </nav>
      
      <div class="p-6 border-t border-gray-200 mt-auto">
        <div class="text-xs text-gray-500">
          <i class="fas fa-info-circle mr-1"></i>
          システムバージョン 1.0
        </div>
      </div>
    </div>
    
    <div class="main-content" id="main-content">
      <div class="flex items-center justify-center h-64">
        <div class="loading" style="width: 40px; height: 40px; border-width: 4px;"></div>
      </div>
    </div>
  `;
  
  appDiv.innerHTML = html;
}

// ダッシュボード読み込み
async function loadDashboard() {
  try {
    const response = await axios.get(`/api/dashboard/${COMPANY_ID}`);
    dashboardData = response.data;
    renderDashboard();
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showError('ダッシュボードの読み込みに失敗しました');
  }
}

function renderDashboard() {
  const { company, sessionStats, nextSession, systems, totalEffect } = dashboardData;
  
  // すべてのデータのnullチェック
  if (!company || !sessionStats || !systems) {
    console.error('Dashboard data is incomplete:', dashboardData);
    showError('ダッシュボードデータの取得に失敗しました');
    return;
  }
  
  const completionRate = sessionStats.total > 0 
    ? Math.round((sessionStats.completed / sessionStats.total) * 100) 
    : 0;
  
  const systemsInProgress = systems.filter(s => s.status === 'development' || s.status === 'testing').length;
  const systemsCompleted = systems.filter(s => s.status === 'production' || s.status === 'operation').length;
  
  // totalEffectのnullチェック
  const totalTime = totalEffect?.time || 0;
  const totalCost = totalEffect?.cost || 0;
  
  const html = `
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          <i class="fas fa-chart-line mr-3 text-blue-900"></i>
          ダッシュボード
        </h1>
        <p class="text-gray-600">${company.name} - プログラム進捗状況</p>
      </div>
      
      <!-- KPI統計 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">プログラム進捗</div>
              <div class="stat-value">${sessionStats.completed}<span class="text-lg text-gray-500">/24</span></div>
              <div class="text-sm text-gray-500">完了セッション</div>
            </div>
            <div class="text-5xl text-blue-500 opacity-20">
              <i class="fas fa-tasks"></i>
            </div>
          </div>
          <div class="progress-bar mt-4">
            <div class="progress-fill" style="width: ${completionRate}%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">${completionRate}% 完了</div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">累計削減時間</div>
              <div class="stat-value">${totalTime.toFixed(1)}<span class="text-lg text-gray-500">h/日</span></div>
              <div class="text-sm text-gray-500">業務効率化</div>
            </div>
            <div class="text-5xl text-teal-500 opacity-20">
              <i class="fas fa-clock"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">開発システム</div>
              <div class="stat-value">${systems.length}<span class="text-lg text-gray-500">個</span></div>
              <div class="text-sm text-gray-500">プロジェクト数</div>
            </div>
            <div class="text-5xl text-purple-500 opacity-20">
              <i class="fas fa-project-diagram"></i>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t text-sm">
            <div class="flex justify-between mb-1">
              <span class="text-gray-600">開発中:</span>
              <span class="font-semibold text-yellow-600">${systemsInProgress}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">稼働中:</span>
              <span class="font-semibold text-green-600">${systemsCompleted}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- 次回セッション -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4 flex items-center">
            <i class="fas fa-calendar-check mr-2 text-blue-900"></i>
            次回セッション
          </h2>
          ${nextSession ? `
            <div class="border-l-4 border-blue-500 pl-4 py-2">
              <div class="font-semibold text-lg mb-2">第${nextSession.session_number}回: ${nextSession.theme}</div>
              <div class="text-gray-600 mb-2">
                <i class="far fa-calendar mr-2"></i>
                ${formatDateTime(nextSession.scheduled_date)}
              </div>
              <div class="flex items-center text-sm">
                <span class="badge badge-scheduled">予定</span>
                <span class="ml-2 text-gray-500">Phase ${nextSession.phase}</span>
              </div>
            </div>
          ` : `
            <div class="text-gray-500 text-center py-8">
              <i class="fas fa-check-circle text-4xl mb-2 text-green-500"></i>
              <p>全セッション完了しました！</p>
            </div>
          `}
        </div>
        
        <!-- システム開発状況 -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4 flex items-center">
            <i class="fas fa-project-diagram mr-2 text-blue-900"></i>
            開発中システム
          </h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">開発中</span>
              <span class="font-bold text-2xl text-yellow-600">${systemsInProgress}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">本番稼働</span>
              <span class="font-bold text-2xl text-green-600">${systemsCompleted}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t">
              <span class="text-gray-600 font-semibold">合計</span>
              <span class="font-bold text-2xl text-gray-900">${systems.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- システム一覧 -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <i class="fas fa-list mr-2 text-blue-900"></i>
          12システム開発プロジェクト
        </h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>システム名</th>
                <th>ステータス</th>
                <th>進捗</th>
                <th>削減効果</th>
              </tr>
            </thead>
            <tbody>
              ${systems.map(system => `
                <tr class="cursor-pointer hover:bg-gray-50" onclick="viewSystem(${system.system_number})">
                  <td class="font-semibold">${system.system_number}</td>
                  <td>
                    <div class="font-medium">${system.name}</div>
                    <div class="text-sm text-gray-500">${system.purpose || ''}</div>
                  </td>
                  <td>
                    <span class="badge badge-${system.status}">${getStatusLabel(system.status)}</span>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <div class="progress-bar w-24 mr-2">
                        <div class="progress-fill" style="width: ${system.progress}%"></div>
                      </div>
                      <span class="text-sm font-medium">${system.progress}%</span>
                    </div>
                  </td>
                  <td>
                    ${system.actual_time_reduction 
                      ? `<span class="text-green-600 font-medium">${system.actual_time_reduction}h/日</span>` 
                      : `<span class="text-gray-400">未測定</span>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = html;
}

// セッション一覧読み込み
async function loadSessions() {
  try {
    const response = await axios.get(`/api/sessions/${COMPANY_ID}`);
    const sessions = response.data;
    renderSessions(sessions);
  } catch (error) {
    console.error('Failed to load sessions:', error);
    showError('セッションの読み込みに失敗しました');
  }
}

function renderSessions(sessions) {
  const phase1 = sessions.filter(s => s.phase === 1);
  const phase2 = sessions.filter(s => s.phase === 2);
  const phase3 = sessions.filter(s => s.phase === 3);
  
  const html = `
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            <i class="fas fa-calendar-alt mr-3 text-blue-900"></i>
            24回講義スケジュール
          </h1>
          <p class="text-gray-600">マルチAI統合エンジニア養成プログラム（企業別カスタマイズ可能）</p>
        </div>
      </div>
      
      <!-- Phase 1: 個別習得 -->
      <div class="card mb-6 phase-1">
        <h2 class="text-2xl font-bold mb-4 text-blue-600">
          <i class="fas fa-layer-group mr-2"></i>
          Phase 1: 個別習得 (第1-12回)
        </h2>
        <div class="timeline">
          ${phase1.map(session => renderSessionTimeline(session)).join('')}
        </div>
      </div>
      
      <!-- Phase 2: 統合 -->
      <div class="card mb-6 phase-2">
        <h2 class="text-2xl font-bold mb-4 text-purple-600">
          <i class="fas fa-layer-group mr-2"></i>
          Phase 2: 統合 (第13-18回)
        </h2>
        <div class="timeline">
          ${phase2.map(session => renderSessionTimeline(session)).join('')}
        </div>
      </div>
      
      <!-- Phase 3: マスター -->
      <div class="card mb-6 phase-3">
        <h2 class="text-2xl font-bold mb-4 text-pink-600">
          <i class="fas fa-layer-group mr-2"></i>
          Phase 3: マスター (第19-24回)
        </h2>
        <div class="timeline">
          ${phase3.map(session => renderSessionTimeline(session)).join('')}
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = html;
}

function renderSessionTimeline(session) {
  const lessonContent = safeParseJSON(session.lesson_content);
  const devContent = safeParseJSON(session.development_content);
  
  return `
    <div class="timeline-item ${session.status === 'completed' ? 'completed' : ''}">
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-bold text-lg">第${session.session_number}回: ${session.theme}</h3>
            <div class="text-sm text-gray-500 mt-1">
              <i class="far fa-calendar mr-1"></i>
              ${formatDateTime(session.scheduled_date)}
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${renderSessionStatusButtons(session)}
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div class="bg-blue-50 p-3 rounded-lg">
            <div class="font-semibold text-blue-900 mb-2">
              <i class="fas fa-book mr-1"></i>授業内容 (30分)
            </div>
            ${lessonContent.objectives ? `
              <ul class="text-sm space-y-1">
                ${lessonContent.objectives.map(obj => `<li class="text-gray-700">• ${obj}</li>`).join('')}
              </ul>
            ` : '<p class="text-sm text-gray-500">内容未設定</p>'}
          </div>
          
          <div class="bg-green-50 p-3 rounded-lg">
            <div class="font-semibold text-green-900 mb-2">
              <i class="fas fa-code mr-1"></i>開発内容 (30分)
            </div>
            <div class="text-sm text-gray-700">
              <div><strong>テーマ:</strong> ${devContent.theme || '未設定'}</div>
              <div><strong>目標:</strong> ${devContent.goal || '未設定'}</div>
            </div>
          </div>
        </div>
        
        ${session.notes ? `
          <div class="mt-3 p-3 bg-yellow-50 rounded-lg">
            <div class="font-semibold text-yellow-900 mb-1 text-sm">
              <i class="fas fa-sticky-note mr-1"></i>メモ
            </div>
            <p class="text-sm text-gray-700">${session.notes}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderSessionStatusButtons(session) {
  const statuses = [
    { value: 'scheduled', label: '予定', color: 'gray', icon: 'clock' },
    { value: 'completed', label: '完了', color: 'green', icon: 'check-circle' },
    { value: 'cancelled', label: 'キャンセル', color: 'red', icon: 'times-circle' }
  ];
  
  return statuses.map(status => {
    const isActive = session.status === status.value;
    return `
      <button 
        onclick="updateSessionStatus(${session.session_number}, '${status.value}')"
        class="px-3 py-1 rounded-lg text-sm font-medium transition-all ${
          isActive 
            ? `bg-${status.color}-100 text-${status.color}-700 border-2 border-${status.color}-500` 
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'
        }"
        title="${status.label}">
        <i class="fas fa-${status.icon} mr-1"></i>
        ${status.label}
      </button>
    `;
  }).join('');
}

// システム一覧読み込み
async function loadSystems() {
  try {
    const response = await axios.get(`/api/systems/${COMPANY_ID}`);
    const systems = response.data;
    renderSystemsList(systems);
  } catch (error) {
    console.error('Failed to load systems:', error);
    showError('システムの読み込みに失敗しました');
  }
}

function renderSystemsList(systems) {
  const html = `
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            <i class="fas fa-project-diagram mr-3 text-blue-900"></i>
            システム開発プロジェクト
          </h1>
          <p class="text-gray-600">各社カスタマイズ開発システム一覧（${systems.length}個）</p>
        </div>
        <button onclick="showAddSystemModal()" class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i>
          新規システム追加
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${systems.map(system => `
          <div class="card">
            <div class="flex items-start justify-between mb-3">
              <div class="text-3xl font-bold text-gray-300">
                ${system.system_number}
              </div>
              <div class="flex gap-2">
                <span class="badge badge-${system.status}">${getStatusLabel(system.status)}</span>
              </div>
            </div>
            
            <h3 class="font-bold text-lg mb-2">${system.name}</h3>
            <p class="text-sm text-gray-600 mb-4">${system.purpose || ''}</p>
            
            <div class="mb-3">
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="text-gray-600">進捗</span>
                <span class="font-semibold">${system.progress}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${system.progress}%"></div>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-sm pt-3 border-t mb-3">
              <div>
                <div class="text-gray-500">削減効果</div>
                ${system.actual_time_reduction 
                  ? `<div class="font-semibold text-green-600">${system.actual_time_reduction}h/日</div>`
                  : `<div class="text-gray-400">未測定</div>`
                }
              </div>
              <div class="text-right">
                <div class="text-gray-500">削減金額</div>
                ${system.actual_cost_reduction 
                  ? `<div class="font-semibold text-green-600">${system.actual_cost_reduction}万円</div>`
                  : `<div class="text-gray-400">未測定</div>`
                }
              </div>
            </div>
            
            <div class="flex gap-2">
              <button onclick="showEditSystemModal(${system.system_number})" class="btn btn-outline flex-1 text-sm py-2">
                <i class="fas fa-edit mr-1"></i>編集
              </button>
              <button onclick="deleteSystem(${system.system_number})" class="btn btn-outline text-sm py-2 text-red-600 border-red-600 hover:bg-red-50">
                <i class="fas fa-trash mr-1"></i>削除
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- システム追加/編集モーダル -->
    <div id="systemModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold" id="modalTitle">システム追加</h2>
          <button onclick="closeSystemModal()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <form id="systemForm" onsubmit="saveSystem(event)">
          <input type="hidden" id="systemNumber" />
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1">システム名 *</label>
              <input type="text" id="systemName" required 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 見積書自動生成システム" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-1">目的・解決する課題 *</label>
              <textarea id="systemPurpose" required rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 見積書作成の自動化により営業工数を削減"></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">使用AIツール</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" class="ai-tool-checkbox" value="Genspark" />
                    <span class="ml-2">Genspark</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ai-tool-checkbox" value="ChatGPT" />
                    <span class="ml-2">ChatGPT</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ai-tool-checkbox" value="Claude" />
                    <span class="ml-2">Claude</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ai-tool-checkbox" value="Gemini" />
                    <span class="ml-2">Gemini</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ai-tool-checkbox" value="Comet" />
                    <span class="ml-2">Comet</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-1">ステータス</label>
                <select id="systemStatus" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="planning">企画中</option>
                  <option value="development">開発中</option>
                  <option value="testing">テスト中</option>
                  <option value="production">本番稼働</option>
                  <option value="operation">運用中</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-1">進捗率: <span id="progressValue">0</span>%</label>
              <input type="range" id="systemProgress" min="0" max="100" value="0" 
                class="w-full" oninput="document.getElementById('progressValue').textContent = this.value" />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">実績削減時間（時間/日）</label>
                <input type="number" id="actualTime" step="0.1" min="0" value="0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-1">実績削減金額（万円）</label>
                <input type="number" id="actualCost" step="1" min="0" value="0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-1">メモ</label>
              <textarea id="systemMemo" rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="開発メモや特記事項"></textarea>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button type="submit" class="btn btn-primary flex-1">
              <i class="fas fa-save mr-2"></i>
              保存
            </button>
            <button type="button" onclick="closeSystemModal()" class="btn btn-outline flex-1">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = html;
}

// 効果測定読み込み
async function loadMeasurements() {
  try {
    const response = await axios.get(`/api/measurements/${COMPANY_ID}`);
    const data = response.data;
    renderMeasurements(data);
  } catch (error) {
    console.error('Failed to load measurements:', error);
    showError('効果測定データの読み込みに失敗しました');
  }
}

function renderMeasurements(data) {
  const { systemEffects, totalEffect } = data;
  
  const html = `
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          <i class="fas fa-chart-bar mr-3 text-blue-900"></i>
          効果測定・ROI管理
        </h1>
        <p class="text-gray-600">システム開発による削減効果の可視化</p>
      </div>
      
      <!-- 効果統計 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="stat-card">
          <div class="stat-label">累計削減時間</div>
          <div class="stat-value">${totalEffect.actual_time.toFixed(1)}<span class="text-lg text-gray-500">h/日</span></div>
          <div class="text-sm text-gray-500 mb-2">目標: ${totalEffect.expected_time.toFixed(1)}h/日</div>
          <div class="progress-bar">
            <div class="progress-fill bg-teal-500" style="width: ${Math.min((totalEffect.actual_time / totalEffect.expected_time) * 100, 100)}%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            達成率: ${totalEffect.expected_time > 0 ? Math.round((totalEffect.actual_time / totalEffect.expected_time) * 100) : 0}%
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">累計削減金額</div>
          <div class="stat-value">${totalEffect.actual_cost.toFixed(0)}<span class="text-lg text-gray-500">万円</span></div>
          <div class="text-sm text-gray-500 mb-2">目標: ${totalEffect.expected_cost.toFixed(0)}万円</div>
          <div class="progress-bar">
            <div class="progress-fill bg-green-500" style="width: ${Math.min((totalEffect.actual_cost / totalEffect.expected_cost) * 100, 100)}%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            達成率: ${totalEffect.expected_cost > 0 ? Math.round((totalEffect.actual_cost / totalEffect.expected_cost) * 100) : 0}%
          </div>
        </div>
      </div>
      
      <!-- システム別効果 -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4">システム別削減効果</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>システム名</th>
                <th>ステータス</th>
                <th>進捗率</th>
                <th>削減時間</th>
                <th>削減金額</th>
              </tr>
            </thead>
            <tbody>
              ${systemEffects.map(system => {
                return `
                  <tr>
                    <td class="font-semibold">${system.system_number}</td>
                    <td>
                      <div class="font-medium">${system.name}</div>
                    </td>
                    <td><span class="badge badge-${system.status}">${getStatusLabel(system.status)}</span></td>
                    <td>
                      <div class="flex items-center">
                        <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div class="bg-blue-500 rounded-full h-2" style="width: ${system.progress}%"></div>
                        </div>
                        <span class="text-sm font-medium">${system.progress}%</span>
                      </div>
                    </td>
                    <td>
                      ${system.actual_time_reduction 
                        ? `<span class="font-semibold text-green-600">${system.actual_time_reduction}h/日</span>` 
                        : `<span class="text-gray-400">-</span>`
                      }
                    </td>
                    <td>
                      ${system.actual_cost_reduction 
                        ? `<span class="font-semibold text-green-600">${system.actual_cost_reduction}万円</span>` 
                        : `<span class="text-gray-400">-</span>`
                      }
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = html;
}

// 企業情報読み込み
async function loadCompany() {
  try {
    const response = await axios.get(`/api/companies/${COMPANY_ID}`);
    const company = response.data;
    renderCompany(company);
  } catch (error) {
    console.error('Failed to load company:', error);
    showError('企業情報の読み込みに失敗しました');
  }
}

function renderCompany(company) {
  const challenges = safeParseJSON(company.main_challenges);
  
  const html = `
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          <i class="fas fa-building mr-3 text-blue-900"></i>
          企業プロフィール
        </h1>
        <p class="text-gray-600">受講企業の基本情報</p>
      </div>
      
      <div class="card mb-6">
        <h2 class="text-xl font-bold mb-4">基本情報</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="text-sm text-gray-500 mb-1">企業名</div>
            <div class="font-semibold text-lg">${company.name}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">業界</div>
            <div class="font-semibold">${company.industry || '-'}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">従業員数</div>
            <div class="font-semibold">${company.employee_count ? company.employee_count + '名' : '-'}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">売上規模</div>
            <div class="font-semibold">${company.revenue || '-'}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">AI活用レベル</div>
            <div><span class="badge badge-development">${getAILevelLabel(company.ai_level)}</span></div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">契約開始日</div>
            <div class="font-semibold">${formatDate(company.contract_start_date)}</div>
          </div>
        </div>
      </div>
      
      <div class="card mb-6">
        <h2 class="text-xl font-bold mb-4">担当者情報</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="text-sm text-gray-500 mb-1">氏名</div>
            <div class="font-semibold">${company.contact_name}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">役職</div>
            <div class="font-semibold">${company.contact_position || '-'}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">メールアドレス</div>
            <div class="font-semibold">${company.contact_email || '-'}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">電話番号</div>
            <div class="font-semibold">${company.contact_phone || '-'}</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-xl font-bold mb-4">主要な業務課題</h2>
        ${challenges && challenges.length > 0 ? `
          <ul class="space-y-2">
            ${challenges.map(challenge => `
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                <span>${challenge}</span>
              </li>
            `).join('')}
          </ul>
        ` : `
          <p class="text-gray-500">登録されていません</p>
        `}
      </div>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = html;
}

// ユーティリティ関数
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function getStatusLabel(status) {
  const labels = {
    planning: '企画中',
    development: '開発中',
    testing: 'テスト中',
    production: '本番稼働',
    operation: '運用中',
    scheduled: '予定',
    completed: '完了',
    cancelled: 'キャンセル',
    rescheduled: '再スケジュール'
  };
  return labels[status] || status;
}

function getAILevelLabel(level) {
  const labels = {
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級'
  };
  return labels[level] || level;
}

function getPaymentStatusLabel(status) {
  const labels = {
    pending: '未払い',
    paid: '支払済',
    partial: '一部支払'
  };
  return labels[status] || status;
}

function safeParseJSON(str) {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

function showError(message) {
  document.getElementById('main-content').innerHTML = `
    <div class="max-w-2xl mx-auto mt-20">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-xl font-bold text-red-900 mb-2">エラーが発生しました</h2>
        <p class="text-red-700">${message}</p>
        <button onclick="location.reload()" class="btn btn-primary mt-4">
          <i class="fas fa-redo mr-2"></i>再読み込み
        </button>
      </div>
    </div>
  `;
}

// セッション管理関数

async function updateSessionStatus(sessionNumber, newStatus) {
  try {
    // 現在のセッション情報を取得
    const response = await axios.get(`/api/sessions/${COMPANY_ID}/${sessionNumber}`);
    const session = response.data;
    
    // ステータスのみ更新
    const data = {
      scheduled_date: session.scheduled_date,
      theme: session.theme,
      lesson_content: session.lesson_content,
      development_content: session.development_content,
      status: newStatus,
      notes: session.notes
    };
    
    await axios.put(`/api/sessions/${COMPANY_ID}/${sessionNumber}`, data);
    
    // 成功通知（控えめに）
    const statusLabel = {
      'scheduled': '予定',
      'completed': '完了',
      'cancelled': 'キャンセル'
    }[newStatus];
    
    // ページをリロードせずに表示を更新
    await loadSessions();
    
    // 小さな成功メッセージ
    showToast(`第${sessionNumber}回を「${statusLabel}」に変更しました`);
  } catch (error) {
    console.error('Failed to update session status:', error);
    alert('ステータスの更新に失敗しました');
  }
}

function showToast(message) {
  // 既存のトーストがあれば削除
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // トーストを作成
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  // 3秒後に削除
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// システム管理関数

function showAddSystemModal() {
  document.getElementById('modalTitle').textContent = '新規システム追加';
  document.getElementById('systemForm').reset();
  document.getElementById('systemNumber').value = '';
  document.getElementById('progressValue').textContent = '0';
  document.getElementById('systemModal').classList.remove('hidden');
}

async function showEditSystemModal(systemNumber) {
  try {
    const response = await axios.get(`/api/systems/${COMPANY_ID}/${systemNumber}`);
    const system = response.data.system;
    
    document.getElementById('modalTitle').textContent = 'システム編集';
    document.getElementById('systemNumber').value = system.system_number;
    document.getElementById('systemName').value = system.name;
    document.getElementById('systemPurpose').value = system.purpose || '';
    document.getElementById('systemStatus').value = system.status;
    document.getElementById('systemProgress').value = system.progress;
    document.getElementById('progressValue').textContent = system.progress;
    document.getElementById('actualTime').value = system.actual_time_reduction || 0;
    document.getElementById('actualCost').value = system.actual_cost_reduction || 0;
    document.getElementById('systemMemo').value = system.project_memo || '';
    
    // AIツールのチェックボックスを設定
    const aiTools = safeParseJSON(system.ai_tools);
    document.querySelectorAll('.ai-tool-checkbox').forEach(checkbox => {
      checkbox.checked = aiTools.includes(checkbox.value);
    });
    
    document.getElementById('systemModal').classList.remove('hidden');
  } catch (error) {
    console.error('Failed to load system:', error);
    alert('システム情報の読み込みに失敗しました');
  }
}

function closeSystemModal() {
  document.getElementById('systemModal').classList.add('hidden');
}

async function saveSystem(event) {
  event.preventDefault();
  
  const systemNumber = document.getElementById('systemNumber').value;
  const isEdit = systemNumber !== '';
  
  // 選択されたAIツールを配列にする
  const selectedAITools = Array.from(document.querySelectorAll('.ai-tool-checkbox:checked'))
    .map(cb => cb.value);
  
  const data = {
    name: document.getElementById('systemName').value,
    purpose: document.getElementById('systemPurpose').value,
    ai_tools: JSON.stringify(selectedAITools),
    status: document.getElementById('systemStatus').value,
    progress: parseInt(document.getElementById('systemProgress').value),
    actual_time_reduction: parseFloat(document.getElementById('actualTime').value) || null,
    actual_cost_reduction: parseFloat(document.getElementById('actualCost').value) || null,
    project_memo: document.getElementById('systemMemo').value
  };
  
  try {
    if (isEdit) {
      // 更新
      await axios.put(`/api/systems/${COMPANY_ID}/${systemNumber}`, data);
      alert('システム情報を更新しました');
    } else {
      // 新規追加
      await axios.post(`/api/systems/${COMPANY_ID}`, data);
      alert('新しいシステムを追加しました');
    }
    
    closeSystemModal();
    await loadSystems();
  } catch (error) {
    console.error('Failed to save system:', error);
    alert('システムの保存に失敗しました');
  }
}

async function deleteSystem(systemNumber) {
  if (!confirm(`システム ${systemNumber} を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
    return;
  }
  
  try {
    await axios.delete(`/api/systems/${COMPANY_ID}/${systemNumber}`);
    alert('システムを削除しました');
    await loadSystems();
  } catch (error) {
    console.error('Failed to delete system:', error);
    alert('システムの削除に失敗しました');
  }
}

function viewSystem(systemNumber) {
  showEditSystemModal(systemNumber);
}
