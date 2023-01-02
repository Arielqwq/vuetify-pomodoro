import { defineStore } from 'pinia'

export const useSettingsStore = defineStore({
  // 這個 store 的 id
  id: 'settings',
  // 這個 store 存了哪些資料
  state() {
    return {
      alarms: [
        { id: 1, name: 'Alarm', file: new URL('@/assets/alarm.mp3', import.meta.url).href },
        { id: 2, name: 'Yay', file: new URL('@/assets/yay.mp3', import.meta.url).href }
      ],
      selectedAlarms: 2,
      // 開啟通知(預設關閉)
      notify: false
    }
  },
  actions: {
    async toggleNotify() {
      // 如果通知狀態為 false
      // 如果 window 有 'Notification' 通知功能
      if (!this.notify && 'Notification' in window) {
        // 請求權限
        // permission請求權限結果
        const permission = await Notification.requestPermission()
        // granted 允許 denied 拒絕 default默認
        if (permission === 'granted') {
          // 則轉為 true
          this.notify = true
        }
      } else {
        this.notify = false
      }
    }
  },
  getters: {
    selectedAlarmFile() {
      const i = this.alarms.findIndex(alarm => alarm.id === this.selectedAlarms)
      return this.alarms[i].file
    }
  },
  persist: {
    key: 'pomodoro-settings',
    // 只存特定的
    // 寫文字非變數
    paths: ['selectedAlarms', 'notify']
  }
})
