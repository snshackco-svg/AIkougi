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
  
  const completionRate = sessionStats.total > 0 
    ? Math.round((sessionStats.completed / sessionStats.total) * 100) 
    : 0;
  
  const systemsInProgress = systems.filter(s => s.status === 'development' || s.status === 'testing').length;
  const systemsCompleted = systems.filter(s => s.status === 'production' || s.status === 'operation').length;
  
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
      <div class="stats-grid mb-8">
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
              <div class="stat-value">${totalEffect.time.toFixed(1)}<span class="text-lg text-gray-500">h/日</span></div>
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
              <div class="stat-label">累計削減金額</div>
              <div class="stat-value">${totalEffect.cost.toFixed(0)}<span class="text-lg text-gray-500">万円</span></div>
              <div class="text-sm text-gray-500">コスト削減効果</div>
            </div>
            <div class="text-5xl text-green-500 opacity-20">
              <i class="fas fa-yen-sign"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-label">投資回収率 (ROI)</div>
              <div class="stat-value">${totalEffect.roi.toFixed(1)}<span class="text-lg text-gray-500">%</span></div>
              <div class="text-sm text-gray-500">費用対効果</div>
            </div>
            <div class="text-5xl text-orange-500 opacity-20">
              <i class="fas fa-chart-line"></i>
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
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          <i class="fas fa-calendar-alt mr-3 text-blue-900"></i>
          24回講義スケジュール
        </h1>
        <p class="text-gray-600">マルチAI統合エンジニア養成プログラム</p>
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
          <div>
            <h3 class="font-bold text-lg">第${session.session_number}回: ${session.theme}</h3>
            <div class="text-sm text-gray-500 mt-1">
              <i class="far fa-calendar mr-1"></i>
              ${formatDateTime(session.scheduled_date)}
            </div>
          </div>
          <span class="badge badge-${session.status}">${getStatusLabel(session.status)}</span>
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
            ` : ''}
          </div>
          
          <div class="bg-green-50 p-3 rounded-lg">
            <div class="font-semibold text-green-900 mb-2">
              <i class="fas fa-code mr-1"></i>開発内容 (30分)
            </div>
            <div class="text-sm text-gray-700">
              <div><strong>テーマ:</strong> ${devContent.theme || ''}</div>
              <div><strong>目標:</strong> ${devContent.goal || ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
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
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          <i class="fas fa-project-diagram mr-3 text-blue-900"></i>
          12システム開発プロジェクト
        </h1>
        <p class="text-gray-600">各社カスタマイズ開発システム一覧</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${systems.map(system => `
          <div class="card cursor-pointer" onclick="viewSystem(${system.system_number})">
            <div class="flex items-start justify-between mb-3">
              <div class="text-3xl font-bold text-gray-300">
                ${system.system_number}
              </div>
              <span class="badge badge-${system.status}">${getStatusLabel(system.status)}</span>
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
            
            <div class="flex items-center justify-between text-sm pt-3 border-t">
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
          </div>
        `).join('')}
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
      
      <!-- ROI統計 -->
      <div class="stats-grid mb-8">
        <div class="stat-card">
          <div class="stat-label">累計削減時間</div>
          <div class="stat-value">${totalEffect.actual_time.toFixed(1)}<span class="text-lg text-gray-500">h/日</span></div>
          <div class="text-sm text-gray-500">目標: ${totalEffect.expected_time.toFixed(1)}h/日</div>
          <div class="progress-bar mt-2">
            <div class="progress-fill bg-teal-500" style="width: ${Math.min((totalEffect.actual_time / totalEffect.expected_time) * 100, 100)}%"></div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">累計削減金額</div>
          <div class="stat-value">${totalEffect.actual_cost.toFixed(0)}<span class="text-lg text-gray-500">万円</span></div>
          <div class="text-sm text-gray-500">目標: ${totalEffect.expected_cost.toFixed(0)}万円</div>
          <div class="progress-bar mt-2">
            <div class="progress-fill bg-green-500" style="width: ${Math.min((totalEffect.actual_cost / totalEffect.expected_cost) * 100, 100)}%"></div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">投資回収率 (ROI)</div>
          <div class="stat-value">${totalEffect.roi.toFixed(1)}<span class="text-lg text-gray-500">%</span></div>
          <div class="text-sm ${totalEffect.roi >= 100 ? 'text-green-600' : 'text-orange-600'}">
            ${totalEffect.roi >= 100 ? '✓ 投資回収済み' : '進行中'}
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">契約金額</div>
          <div class="stat-value">${(totalEffect.contract_amount / 10000).toFixed(0)}<span class="text-lg text-gray-500">万円</span></div>
          <div class="text-sm text-gray-500">年間プログラム費用</div>
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
                <th>削減時間</th>
                <th>削減金額</th>
                <th>達成率</th>
              </tr>
            </thead>
            <tbody>
              ${systemEffects.map(system => {
                const timeRate = system.expected_time_reduction > 0 
                  ? Math.round((system.actual_time_reduction / system.expected_time_reduction) * 100)
                  : 0;
                return `
                  <tr>
                    <td class="font-semibold">${system.system_number}</td>
                    <td>
                      <div class="font-medium">${system.name}</div>
                    </td>
                    <td><span class="badge badge-${system.status}">${getStatusLabel(system.status)}</span></td>
                    <td>
                      ${system.actual_time_reduction 
                        ? `<span class="font-semibold text-green-600">${system.actual_time_reduction}h/日</span>` 
                        : `<span class="text-gray-400">-</span>`
                      }
                      <div class="text-xs text-gray-500">目標: ${system.expected_time_reduction}h/日</div>
                    </td>
                    <td>
                      ${system.actual_cost_reduction 
                        ? `<span class="font-semibold text-green-600">${system.actual_cost_reduction}万円</span>` 
                        : `<span class="text-gray-400">-</span>`
                      }
                      <div class="text-xs text-gray-500">目標: ${system.expected_cost_reduction}万円</div>
                    </td>
                    <td>
                      ${timeRate > 0 
                        ? `<span class="${timeRate >= 100 ? 'text-green-600' : 'text-orange-600'} font-semibold">${timeRate}%</span>`
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
      
      <div class="card mb-6">
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
      
      <div class="card">
        <h2 class="text-xl font-bold mb-4">契約情報</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div class="text-sm text-gray-500 mb-1">契約金額</div>
            <div class="font-semibold text-2xl text-green-600">${(company.contract_amount / 10000).toFixed(0)}万円</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">支払いステータス</div>
            <div><span class="badge ${company.payment_status === 'paid' ? 'badge-production' : 'badge-development'}">${getPaymentStatusLabel(company.payment_status)}</span></div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">契約期間</div>
            <div class="font-semibold">12ヶ月</div>
          </div>
        </div>
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

function viewSystem(systemNumber) {
  alert(`システム${systemNumber}の詳細ページは次のフェーズで実装予定です`);
}
