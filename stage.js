// 布景类
class Stage {
  constructor(params = {}, game) {
    this.game = game;                 // 与所属游戏绑定
    this.index = game.stages.length;  // 布景索引(给每个布景标号，标记布景在 stages 中的位置)
    this.params = params;

    this.settings = {
      status: 0,              // 布景状态,0表示未激活/结束,1表示正常,2表示暂停,3表示临时状态
      maps: [],               // 地图队列
      audios: [],             // 音频资源
      images: [],             // 图片资源
      items: [],              // 单元队列
      timeout: 0,             // 倒计时(用于过程动画状态判断)
      update: function(){}    // 嗅探,处理布局下不同对象的相对关系
    }

    Object.assign(this, this.settings, this.params);
  }

  // 重置
  reset() {
    Object.assign(this, this.settings, this.params);
    this.resetItems();
    this.resetMaps();
  }

  // 重置物体位置
  resetItems() {
    this.items.forEach((item) => {
      Object.assign(item, item.settings, item.params);
    })
  }

  // 重置地图
  resetMaps() {

  }

  // 绑定事件
  bind(eventType, callback) {
    const events = this.game.events;

    if (!events[eventType]) {
      events[eventType] = {};
      window.addEventListener(eventType, (e) => {
        e.preventDefault();
        const key = 's' + this.game.index;
        if (events[eventType][key]) {
          events[eventType][key](e);
        }
      })
    }

    events[eventType]['s' + this.index] = callback.bind(this);
  }

  // 添加对象
  createItem(options = {}) {
    const item = new Item(options, this.game, this);
    this.items.push(item);
    return item;
  }
}