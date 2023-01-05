<!-- 如全清空會有錯誤需至少放入 template -->
<!-- 預設首頁 -->
<template lang="pug">
v-row.text-center.mt-5#home
  //- v-col(cols="12")
  //-   h1 {{ currentText }}
  //-   h1 {{ currentTime }}
  //- v-col(cols="12")
  //-   v-btn(v-if="status !== 1" icon="mdi-play" variant="text" @click="startTimer")
  //-   v-btn(v-if="status === 1" icon="mdi-pause" variant="text" @click="pauseTimer")
  //-   v-btn(v-if="currentItem.length > 0" icon="mdi-skip-next" variant="text" @click="finishTimer")

  //- v-col(order-sm="second").v-col-12.v-col-md-6
    v-col.v-col-12
      v-text-field(ref="input" v-model="newItem" variant="underlined" label="新增事項" :rules="[rules.required, rules.length]" @keydown.enter="onInputSubmit")
        template(#append)
          v-btn(icon="mdi-plus" variant="text" @click="onInputSubmit")
    v-col.v-col-12
      h1.text-center ＬＩＳＴ
      v-col.v-col-12
        v-table#all
          thead
            tr
              th.text-center.w-25 新增日期
              th.text-center 項目內容
          tbody
            tr(v-for="item in items" :key="item.id")
              td {{ item.nowTime }}
              td {{ item.name }}

  v-col.ma-10.v-col-12.v-col-md-6.d-flex.flex-wrap.align-content-center.order-sm-first
    v-col.v-col-12.text-center
      p.text-h3.text-md-h1.font-weight-bold {{ currentTime }}
    v-col.v-col-12.text-center
      h1 {{ currentText }}
      v-btn.mr-5.mt-5(v-if="status !== 1" icon="mdi-play" varient="text" @click="startTimer")
      v-btn.mr-5.mt-5(v-else icon="mdi-pause" varient="text" @click="pauseTimer")
      v-btn.mt-5(v-if="currentItem.length > 0" icon="mdi-skip-next" varient="text" @click="finishTimer")
    v-col.v-col-6.my-8#tomatoImg
      //- v-img(src="../styles/walkingtomato.gif" style="height:400px; width:300px; display:inline;")

</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useListStore } from '@/stores/list'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import '../styles/style.css'

const list = useListStore()
const { currentItem, items, timeleft } = storeToRefs(list)
const { start, countdown, finish, addItem } = list

const settings = useSettingsStore()
const { selectedAlarmFile, notify } = storeToRefs(settings)

// 0 = 停止
// 1 = 倒數中
// 2 = 暫停
const status = ref(0)
const input = ref(null)
const newItem = ref('') //
let timer = 0
//
// const rules = {
//   required(v) {
//     return !!v || "欄位必填";
//   },
//   length(v) {
//     return v.length >= 3 || "必須三個字以上";
//   },
// };
const onInputSubmit = async () => {
  // validate 驗證 設定為 promise 因此需使用 async/await
  // 會回傳陣列，[]裡存放驗證內容
  const valid = await input.value.validate()
  console.log(valid)
  // 判斷如有錯誤訊息時，EX: '需輸入至少 3 個字元' (錯誤訊息字數 > 0 => return)
  if (valid.length > 0) return
  // 建議寫在 state / actions
  addItem(newItem.value)
  // addItem(newItem.value)
  // $el 取得元件的 html
  // .blur() 取消 focus (新增完事項後 input 不會再出現'欄位必填'錯誤)
  input.value.$el.querySelector('input').blur()
  // 重置清空 input.value
  input.value.reset()
}
// 換頁時觸發 vue 內建元件功能
onUnmounted(() => {
  console.log('Home unmounted')
})
// 上面用不到免用 ref
//

const startTimer = () => {
  // 代辦事項第一個拿出來倒數
  if (status.value === 0 && items.value.length > 0) {
    start()
  }
  // 如果有東西
  if (currentItem.value.length > 0) {
    // 改為倒數中
    status.value = 1
    timer = setInterval(() => {
      // 剩餘秒數 timeleft
      // 動到數值所以寫在 actoins funciton
      countdown()
      if (timeleft.value === 0) {
        finishTimer()
      }
    }, 1000)
  }
}
// 暫停
const pauseTimer = () => {
  // 換 icon
  status.value = 2
  clearInterval(timer)
}
// 完成
const finishTimer = () => {
  clearInterval(timer)
  // 換 icon
  status.value = 0
  const audio = new Audio()
  audio.src = selectedAlarmFile.value
  // 播音樂
  audio.play()
  if (notify.value) {
    // eslint-disable-next-line
    const notification = new Notification("事項完成", {
      body: currentText.value,
      icon: 'https://github.com/wdaweb.png'
    })
  }
  finish()
  // 如果還有事項時循環跑
  if (items.value.length > 0) {
    startTimer()
  }
}
// 事項文字
const currentText = computed(() => {
  // 如果 items 有東西時則顯示 點擊開始
  return currentItem.value.length > 0
    ? currentItem.value
    : items.value.length > 0
      ? 'CLICK TO START'
      : 'NO EVENTS'
})

// 事項倒數計時
const currentTime = computed(() => {
  // 分鐘
  const m = Math.floor(timeleft.value / 60)
    .toString()
    .padStart(2, '0')
  // 秒數
  const s = (timeleft.value % 60).toString().padStart(2, '0')
  return m + ':' + s
})
</script>
<style></style>
