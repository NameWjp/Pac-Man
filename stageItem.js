// 单元类
class StageItem {
  static _id = 0;

  constructor(params = {}, game, stage) {
    this.game = game;       // 与所属游戏绑定
    this.stage = stage;     // 与所属布景绑定
    this.id = StageItem._id++;    // 标识符
    this.params = params;

    this.settings = {
      x: 0,                   // 位置坐标:横坐标
      y: 0,                   // 位置坐标:纵坐标
      width: 20,              // 宽
      height: 20,             // 高
      type: 0,                // 对象类型,0表示普通对象(不与地图绑定),1表示玩家控制对象,2表示程序控制对象
      color: '#F00',          // 标记颜色
      status: 1,              // 对象状态,0表示未激活/结束,1表示正常,2表示暂停,3表示临时状态,4表示异常
      direction: 0,           // 当前定位方向,0表示右,1表示下,2表示左,3代表上（这样设计方便画主角各个方向的圆弧）
      speed: 0,               // 移动速度
      // 地图相关   
      location: null,         // 定位地图,Map对象
      coord: null,            // 如果对象与地图绑定,需设置地图坐标;若不绑定,则设置位置坐标
      path: [],               // NPC自动行走的路径
      vector: null,           // 目标坐标
      // 布局相关   
      frames: 1,              // 速度等级,即多少帧 times 变化一次
      times: 0,               // 刷新画布计数(用于循环动画状态判断)
      timeout: 0,             // 倒计时(用于过程动画状态判断)
      control: {},            // 控制缓存,到达定位点时处理
      update: function(){},   // 更新参数信息
      draw: function(){}      // 绘制
    }

    Object.assign(this, this.settings, this.params);

    // 如果有 location 属性，则说明是动态属性（例如 主角，幽灵），此时映射主角的画布坐标
    if (this.location) {
      Object.assign(this, this.location.coord2position(this.coord.x, this.coord.y));
    }
  }

  // 重置单元类
  reset() {
    Object.assign(this, this.settings, this.params);
    if (this.location) {
      Object.assign(this, this.location.coord2position(this.coord.x, this.coord.y));
    }
  }
}