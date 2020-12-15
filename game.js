// 游戏类
class Game {
  constructor(id, params = {}) {
    const settings = {
      width: 960,   // 画布宽度
      height: 640   // 画布高度
    };

    // 合并用户参数
    Object.assign(this, settings, params);

    // 创建画布
    const $canvas = document.getElementById(id);
    $canvas.width = this.width;
    $canvas.height = this.height;

    this.context = $canvas.getContext('2d');   // 画布上下文环境
    this.stages = [];                         // 布景对象队列
    this.events = {};                         // 事件集合
    this.index = 0;                           // 当前布景索引
    this.handler = null;                      // 帧动画控制
  }

  // 游戏初始化
  init() {
    this.index = 0;
    this.start();
  }

  // 动画开始
  start() {
    let f = 0; // 定义运行了多少帧
    const context = this.context;
    const width = this.width;
    const height = this.height;

    const fn = () => {
      const stage = this.stages[this.index];
      context.clearRect(0, 0, width, height);   // 清除画布
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);
      f++;

      // 死亡动画，场景重置倒计时
      if (stage.timeout) {
        stage.timeout--;
      }

      if (stage.update() !== false) {   // update 返回 false,则不绘制
        // stage中的map处理
        stage.maps.forEach((map) => {
          // 更新 times 次数
          if (!(f % map.frames)) {
            map.times = f / map.frames;
          }
          // 缓存静态数据，例如地图
          if (map.cache) {
            if (!map.cacheData) {
              context.save();
              map.draw(context);
              map.cacheData = context.getImageData(0 ,0, this.width, this.height);
              context.restore();
            } else {
              context.putImageData(map.cacheData, 0, 0);
            }
          } else {
            map.update();
            map.draw(context);
          }
        });
        // stage中的item处理
        stage.items.forEach((item) => {
          // 更新 times 次数
          if (!(f % item.frames)) {
            item.times = f / item.frames;
          }
          // 对象和布景都不处于暂停状态
          if (stage.status === 1 && item.status !== 2) {
            // 如果与地图关联，每次将自己的坐标根据画布坐标更新
            if (item.location) {
              item.coord = item.location.position2coord(item.x, item.y);
            }
            // 倒计时帧数，用于判断幽灵是否恢复正常状态
            if (item.timeout) {
              item.timeout--;
            }
            item.update();
          }
          item.draw(context);
        });
      }

      this.handler = requestAnimationFrame(fn);
    }

    this.handler = requestAnimationFrame(fn);
  }

  // 动画结束
  stop() {
    this.handler && cancelAnimationFrame(this.handler);
  }

  // 下个布景
  nextStage() {
    if (this.index < this.stages.length - 1) {
      return this.setStage(++this.index);
    } else {
      throw new Error('unfound new stage.')
    }
  }

  // 指定布景
  setStage(index) {
    // 清除上一个布景状态
    this.stages[this.index].status = 0;
    // 更新 index
    this.index = index;
    // 初始化新布景状态
    this.stages[index].reset();
    this.stages[index].status = 1;

    return this.stages[index];
  }

  // 创建布景
  createStage(options = {}) {
    const stage = new Stage(options, this);
    this.stages.push(stage);
    return stage;
  }

  getStages() {
    return this.stages;
  }
}
