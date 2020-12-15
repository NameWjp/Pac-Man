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

  // 设置地图上某点的值
  set(x, y, value) {
    if (this.data[y]) {
      this.data[y][x] = value;
    }
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

  // 寻址算法
  finder(params) {
    const defaults = {
      map: null,
      start: {},
      end: {},
      type: 'path'
    };
    const options = Object.assign({}, defaults, params);
    // 起点或终点在墙上不计算
    if (options.map[options.start.y][options.start.x] || options.map[options.end.y][options.end.x]) {
      return [];
    }

    let finded = false;
    const result = [];
    const yLength = options.map.length;
    const xLength = options.map[0].length;
    const steps = []; // 步骤映射
    for (let y = yLength; y--;) {
      steps[y] = new Array(xLength).fill(0);
    }

    // 获取地图上的值
    const _getValue = (x, y) => {
      if (options.map[y] && typeof options.map[y][x] !== 'undefined') {
        return options.map[y][x];
      }
      return -1;
    };

    // 判断是否可走，可走则放入列表
    const _next = (to) => {
      const value = _getValue(to.x, to.y);
      if (value < 1) {
        if (value === -1) {
          to.x = (to.x + xLength) % xLength;
          to.y = (to.x + yLength) % yLength;
          to.change = 1;
        }
        if (!steps[to.y][to.x]) {
          result.push(to);
        }
      }
    }

    // 递归从起点开始往四个方向找终点
    const _render = (list) => {
      const newList = [];
      const next = (from, to) => {
        const value = _getValue(to.x, to.y);
        if (value < 1) {
          // 走出中间没墙的位置
          if (value === -1) {
            to.x = (to.x + xLength) % xLength;
            to.y = (to.x + yLength) % yLength;
            to.change = 1;
          }
          // 下一个点记录从何处来的(注意这里从四个方向同时找，最先找到终点的一定是最优解)
          if (to.x === options.end.x && to.y === options.end.y) {  // 找到终点的情况
            steps[to.y][to.x] = from;
            finded = true;
          } else if (!steps[to.y][to.x]) {  // 找到是豆子的情况
            steps[to.y][to.x] = from;
            newList.push(to);
          }
        }
      };
      list.forEach((current) => {
        next(current, { y: current.y + 1, x: current.x });
        next(current, { y: current.y, x: current.x + 1 });
        next(current, { y: current.y - 1, x: current.x });
        next(current, { y: current.y, x: current.x - 1 });
      });
      if (!finded && newList.length) {
        _render(newList);
      }
    };

    // 起点开始，从四个方向分别去找终点，找到后会把 steps 中是豆的位置的值替换成上一个点来的坐标
    _render([options.start]);

    if (finded) {
      let current = options.end;
      if (options.type === 'path') {
        // 从终点往回找最优路径
        while (current.x !== options.start.x || current.y !== options.start.y) {
          result.unshift(current);
          current = steps[current.y][current.x];
        }
      } else if (options.type === 'next') {
        _next({ x: current.x + 1, y: current.y });
        _next({ x: current.x, y: current.y + 1 });
        _next({ x: current.x - 1, y: current.y });
        _next({ x: current.x, y: current.y + 1 });
      }
    }

    return result;
  }
}
