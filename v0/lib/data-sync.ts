/**
 * 数据同步工具 - 用于v0前端与服务器的数据同步
 */

const SERVER_URL = "http://localhost:5000"

// localStorage键名
export const STORAGE_KEYS = {
  TASKS: "workboard-simple-tasks-v2",
  DISCOVERIES: "workboard-discoveries-v1"
} as const

// 数据类型定义
export type Task = { id: string; text: string; done?: boolean; date?: string }
export type Discovery = { id: string; text: string; date?: string }

/**
 * 获取当前localStorage中的数据
 */
export function getCurrentData() {
  const tasksStr = localStorage.getItem(STORAGE_KEYS.TASKS) || '[]'
  const discoveriesStr = localStorage.getItem(STORAGE_KEYS.DISCOVERIES) || '[]'
  
  try {
    const tasks: Task[] = JSON.parse(tasksStr)
    const discoveries: Discovery[] = JSON.parse(discoveriesStr)
    
    return {
      tasks,
      discoveries,
      stats: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.done).length,
        totalDiscoveries: discoveries.length
      }
    }
  } catch (error) {
    console.error('解析localStorage数据失败:', error)
    return {
      tasks: [],
      discoveries: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        totalDiscoveries: 0
      }
    }
  }
}

/**
 * 同步当前数据到服务器
 */
export async function syncToServer(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const currentData = getCurrentData()
    
    const response = await fetch(`${SERVER_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tasks: currentData.tasks,
        discoveries: currentData.discoveries
      })
    })
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`)
    }
    
    const result = await response.json()
    
    return {
      success: true,
      message: `同步成功！Tasks: ${result.synced.tasks}个, Discoveries: ${result.synced.discoveries}个`,
      data: result
    }
    
  } catch (error) {
    console.error('同步到服务器失败:', error)
    return {
      success: false,
      message: `同步失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 从服务器加载数据到localStorage
 */
export async function loadFromServer(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${SERVER_URL}/api/load`)
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.status === 'success') {
      // 直接设置localStorage
      localStorage.setItem(STORAGE_KEYS.TASKS, result.data[STORAGE_KEYS.TASKS])
      localStorage.setItem(STORAGE_KEYS.DISCOVERIES, result.data[STORAGE_KEYS.DISCOVERIES])
      
      // 触发存储事件以通知其他组件更新
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.TASKS,
        newValue: result.data[STORAGE_KEYS.TASKS]
      }))
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.DISCOVERIES,
        newValue: result.data[STORAGE_KEYS.DISCOVERIES]
      }))
      
      return {
        success: true,
        message: `数据加载成功！Tasks: ${result.parsed.tasks.length}个, Discoveries: ${result.parsed.discoveries.length}个`,
        data: result.parsed
      }
    } else {
      throw new Error(result.message || '加载失败')
    }
    
  } catch (error) {
    console.error('从服务器加载数据失败:', error)
    return {
      success: false,
      message: `加载失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 创建备份
 */
export async function createBackup(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${SERVER_URL}/api/backup`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`)
    }
    
    const result = await response.json()
    
    return {
      success: true,
      message: `备份创建成功: ${result.filename}`,
      data: result
    }
    
  } catch (error) {
    console.error('创建备份失败:', error)
    return {
      success: false,
      message: `备份失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 获取服务器统计信息
 */
export async function getServerStats(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${SERVER_URL}/api/stats`)
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`)
    }
    
    const stats = await response.json()
    
    return {
      success: true,
      message: '获取统计成功',
      data: stats
    }
    
  } catch (error) {
    console.error('获取服务器统计失败:', error)
    return {
      success: false,
      message: `获取统计失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 自动同步 - 可以定期调用来自动同步数据
 */
export async function autoSync(intervalMs: number = 5 * 60 * 1000): Promise<() => void> {
  const sync = async () => {
    const result = await syncToServer()
    if (result.success) {
      console.log('🔄 自动同步成功:', result.message)
    } else {
      console.warn('⚠️ 自动同步失败:', result.message)
    }
  }
  
  // 立即执行一次
  await sync()
  
  // 设置定时同步
  const intervalId = setInterval(sync, intervalMs)
  
  // 返回清理函数
  return () => {
    clearInterval(intervalId)
  }
}

/**
 * 检查服务器连接状态
 */
export async function checkServerConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_URL}/`, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
} 