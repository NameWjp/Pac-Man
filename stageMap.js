// 地图类
class StageMap {
  static _id = 0;

  constructor(params = {}, game, stage) {
    this.game = game;       // 与所属游戏绑定
    this.stage = stage;     // 与所属布景绑定
    this.id = StageMap._id++;    // 标识符
    this.params = params;

    this.settings = {
      x: 0,                   // 地图起点横坐标
      y: 0,                   // 地图起点纵坐标
      size: 20,               // 地图单元的宽度
      data: [],               // 地图数据
      xLength: 0,             // 二维数组 x 轴长度
      yLength: 0,             // 二维数组 y 轴长度
      // 布局相关
      frames: 1,              // 速度等级,即多少帧 times 变化一次
      times: 0,               // 刷新画布计数(用于循环动画状态判断)
      cache: false,           // 是否缓存(如静态则设置缓存)
      update: function(){},   // 更新地图数据
      draw: function(){},     // 绘制地图
    }

    Object.assign(this, this.settings, this.params);

    // 更新相关属性
    this.data = JSON.parse(JSON.stringify(this.data));
    this.yLength = this.data.length;
    this.xLength = this.data[0].length;
    this.cacheData = null;
  }

  // 获取地图上某点的值
  get(x, y) {
    if (this.data[y] && typeof this.data[y][x] !== 'undefined') {
      return this.data[y][x];
    }
    return -1;
  }

  // 重置地图类
  reset() {
    Object.assign(this, this.settings, this.params);

    // 更新相关属性
    this.data = JSON.parse(JSON.stringify(this.data));
    this.yLength = this.data.length;
    this.xLength = this.data[0].length;
    this.cacheData = null;
  }

  // 地图坐标转画布坐标(x, y 为中心点的坐标)
  coord2position(x, y) {
    return {
      x: this.x + x * this.size + this.size / 2,
      y: this.y + y * this.size + this.size / 2
    };
  }

  // 画布坐标转地图坐标
  position2coord(x, y) {
    const fx = Math.abs(x - this.x) % this.size - this.size / 2;
    const fy = Math.abs(y - this.y) % this.size - this.size / 2;
    return {
      x: Math.floor((x - this.x) / this.size),
      y: Math.floor((y - this.y) / this.size),
      offset: Math.sqrt(fx * fx + fy * fy)
    }
  }
}
