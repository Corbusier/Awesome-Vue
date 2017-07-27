import * as types from './mutation-types'

export default {
    // 增加总时间
  [types.ADD_TOTAL_TIME] (state, time) {
    state.totalTime = parseFloat(state.totalTime) + parseFloat(time)
  },
  // 减少总时间
  [types.DEC_TOTAL_TIME] (state, time) {
    state.totalTime = parseFloat(state.totalTime) - parseFloat(time)
  },
  // 新增计划
  [types.SAVE_PLAN] (state, plan) {
    // 设置默认值，未来我们可以做登入直接读取昵称和头像
    const avatar = 'https://images.unsplash.com/photo-1463579934088-98fe605ed062?dpr=1&auto=format&fit=crop&w=1199&h=799&q=80&cs=tinysrgb&crop=';
    
    state.list.push(
      Object.assign({ name: 'Via', avatar: avatar }, plan)
    )
  },
  // 删除某计划
  [types.DELETE_PLAN] (state, idx) {
    state.list.splice(idx, 1);
  }
};