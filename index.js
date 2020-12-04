const _COLOR = ['#F00','#F93','#0CF','#F9C']; //NPC颜色
const _LIFE = 5; // 玩家生命值
const _SCORE = 0; // 玩家得分
// sin cos 分别用计算于 y 轴和 x 轴的偏移值（分别对应 右 下 左 上 四个方向）
const _SIN = [0, 1, 0, -1];
const _COS = [1, 0, -1, 0];

const game = new Game('canvas');

// 启动页面
(function() {
  const stage = game.createStage();
  // logo
  stage.createItem({
    x: game.width / 2,
    y: game.height * 0.45,
    width: 100,
    height: 100,
    frames: 3,
    draw(context) {
      // 根据内部计算器 times 计算出 t(0 -> 5 的整数) 重新绘制
      const t = Math.abs(5 - this.times % 10);

      context.fillStyle = '#FFE600';
      context.beginPath();
      context.arc(this.x, this.y, this.width / 2, t * 0.04 * Math.PI, (2 - t * 0.04) * Math.PI, false);
      context.lineTo(this.x, this.y);
      context.closePath();
      context.fill();
      
      context.fillStyle = '#000';
      context.beginPath();
      context.arc(this.x + 5, this.y - 27, 7, 0, 2 * Math.PI, false);
      context.closePath();
      context.fill();
    }
  });

  // 游戏名
  stage.createItem({
    x: game.width / 2,
    y: game.height * 0.6,
    draw(context) {
      context.font = 'bold 42px Helvetica';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#FFF';
      context.fillText('Pac-Man', this.x, this.y);
    }
  });
  
  // 事件绑定
  stage.bind('keydown', (e) => {
    switch(e.keyCode) {
      case 13:
      case 32:
        game.nextStage();
        break;
    }
  });
})();

// 游戏主程序
(function() {
  _GAMEData.forEach((config, index) => {
    let stage, map, beans, npcs, player, times;

    stage = game.createStage({
      update() {
        // todo 更新布景
      }
    });

    // 绘制地图
    map = stage.createMap({
      x: 60,
      y: 10,
      data: config['map'],
      cache: true,
      draw(context) {
        context.lineWidth = 2;
        for (let y = 0; y < this.yLength; y++) {
          for (let x = 0; x < this.xLength; x++) {
            const value = this.get(x, y);
            // 当前点位是墙体
            if (value) {
              /**
               * code 描述当前点位一般情况下: 右 下 左 上 位置的信息
               * 例如画左上圆弧的点位信息
               * 一般情况：    特殊情况:     推导:   
               *  0 0 0        1 1 1         1.当中间点与左边点的上下点均是 1 的情况，认为左边点为 0 (跟一般情况一样)
               *  0 1 1   =>   1 1 1    =>   2.当中间点与上边点的左右点均是 1 的情况，认为左边点为 0 (跟一般情况一样)
               *  0 1 0        1 1 0
               * 其他圆弧的推导相同
               */
              const code = [0, 0, 0, 0];
              // 右侧点
              if (this.get(x + 1, y) && !(this.get(x + 1, y - 1) && this.get(x + 1, y + 1) && this.get(x, y - 1) && this.get(x, y + 1))) {
                code[0] = 1;
              }
              // 上方点
              if (this.get(x, y + 1) && !(this.get(x - 1, y + 1) && this.get(x + 1, y + 1) && this.get(x - 1, y) && this.get(x + 1, y))) {
                code[1] = 1;
              }
              // 左侧点
              if (this.get(x - 1, y) && !(this.get(x - 1, y - 1) && this.get(x - 1, y + 1) && this.get(x, y - 1) && this.get(x, y + 1))) {
                code[2] = 1;
              }
              // 下方点
              if (this.get(x, y - 1) && !(this.get(x - 1, y - 1) && this.get(x + 1, y - 1) && this.get(x - 1, y) && this.get(x + 1, y))) {
                code[3] = 1;
              }
              if (code.indexOf(1) > -1) {
                context.strokeStyle = value === 2 ? '#FFF' : config.wallColor;
                const pos = this.coord2position(x, y);
                const radius = this.size / 2;
                switch(code.join('')) {
                  // 画左上圆弧 (pos.x 和 pos.y 均是单元格中点，画左上圆弧的时候圆心在右下角，x, y 需要各加 radius 长度)
                  case '1100':
                    context.beginPath();
                    context.arc(pos.x + radius, pos.y + radius, radius, Math.PI, 1.5 * Math.PI, false);
                    context.stroke();
                    context.closePath();
                    break;
                  // 画右上圆弧
                  case '0110':
                    context.beginPath();
                    context.arc(pos.x - radius, pos.y + radius, radius, 1.5 * Math.PI, 2 * Math.PI, false);
                    context.stroke();
                    context.closePath();
                    break;
                  // 画右下圆弧
                  case '0011': 
                    context.beginPath();
                    context.arc(pos.x - radius, pos.y - radius, radius, 0, 0.5 * Math.PI, false);
                    context.stroke();
                    context.closePath();
                    break;
                  // 画左下圆弧
                  case '1001': 
                    context.beginPath();
                    context.arc(pos.x + radius, pos.y - radius, radius, 0.5 * Math.PI, Math.PI, false);
                    context.stroke();
                    context.closePath();
                    break;
                  // 水平直线 (pos.x 和 pos.y 均是每个单元块的中点，所以这里起始点需要减去 radius 开始画)
                  case '1010':
                    context.beginPath();
                    context.moveTo(pos.x - radius, pos.y);
                    context.lineTo(pos.x + radius, pos.y);
                    context.stroke();
                    context.closePath();
                    break;
                  // 垂直竖线
                  case '0101':
                    context.beginPath();
                    context.moveTo(pos.x, pos.y - radius);
                    context.lineTo(pos.x, pos.y + radius);
                    context.stroke();
                    context.closePath();
                    break;
                }
              }
            }
          }
        }
      }
    });

    // 绘制豆子和能量豆
    beans = stage.createMap({
      x: 60,
      y: 10,
      data: config['map'],
      frames: 8,
      draw(context) {
        for (let y = 0; y < this.yLength; y++) {
          for (let x = 0; x < this.xLength; x++) {
            if (!this.get(x, y)) {
              const pos = this.coord2position(x, y);
              const side = 2;
              context.fillStyle = '#F5F5DC';
              // 能量豆位置
              if (config['goods'][`${x},${y}`]) {
                context.beginPath();
                context.arc(pos.x, pos.y, 3 + this.times % 2, 0, 2 * Math.PI, false);
                context.closePath();
                context.fill();
              } else {
                context.fillRect(pos.x - side, pos.y - side, 2 * side, 2 * side);
              }
            }
          }
        }
      }
    });

    // 关卡得分
    stage.createItem({
      x: 690,
      y: 80,
      draw(context) {
        context.font = 'bold 26px Helvetica';
        context.textAlign = 'left';
        context.textBaseline = 'bottom';
        context.fillStyle = '#C33';
        context.fillText('SCORE', this.x, this.y);
        context.font = '26px Helvetica';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillStyle = '#FFF';
        context.fillText(_SCORE, this.x + 12, this.y);
        context.font = 'bold 26px Helvetica';
        context.textAlign = 'left';
        context.textBaseline = 'bottom';
        context.fillStyle = '#C33';
        context.fillText('LEVEL', this.x, this.y + 72);
        context.font = 'bold 26px Helvetica';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillStyle = '#FFF';
        context.fillText(this.game.index, this.x + 12, this.y + 72);
      }
    });

    // 暂停状态展示
    stage.createItem({
      x: 690,
      y: 285,
      frames: 25,
      draw(context) {
        if (stage.status === 2 && this.times % 2) {
          context.font = '24px Helvetica';
          context.textAlign = 'left';
          context.textBaseline = 'center';
          context.fillStyle = '#FFF';
          context.fillText('PAUSE', this.x, this.y);
        }
      }
    });

    // 生命值
    stage.createItem({
      x: 705,
      y: 510,
      width: 30,
      height: 30,
      draw(context) {
        const leftLife = _LIFE - 1;
        const max = Math.min(leftLife, 5);
        for (let i = 0; i < max; i++) {
          const x = this.x + 40 * i;
          const y = this.y;
          context.fillStyle = '#FFE600';
          context.beginPath();
          context.arc(x, y, this.width / 2, 0.15 * Math.PI, -0.15 * Math.PI, false);
          context.lineTo(x, y);
          context.closePath();
          context.fill();
        }
        context.font = '26px Helvetica';
        context.textAlign = 'left';
        context.textBaseline = 'center';
        context.fillStyle = '#FFF';
        context.fillText(`X ${leftLife}`, this.x - 15, this.y + 30);
      }
    });

    // 幽灵
    for (let i = 0; i < 4; i++) {
      stage.createItem({
        width: 30,
        height: 30,
        direction: 3,
        color: _COLOR[i],
        location: map,
        coord: { x: 12 + i, y: 14 },
        vector: { x: 12 + i, y: 14 },
        type: 2,
        frames: 10,
        speed: 1,
        timeout: Math.floor(Math.random() * 120),
        update() {
          // todo update
        },
        draw(context) {
          const isSick = false;
          if (this.status !== 4) {
            context.fillStyle = isSick ? '#BABABA' : this.color;
            context.beginPath();
            // 画幽灵身体
            context.arc(this.x, this.y, this.width * 0.5, 0, Math.PI, true);
            // 画幽灵脚
            switch(this.times % 2) {
              case 0: 
                context.lineTo(this.x - this.width * 0.5, this.y + this.height * 0.4);
                // quadraticCurveTo 用于画曲线，前两个坐标是控制点坐标，控制曲线弯曲程度，后两个点是终点坐标(默认起始点是当前路径最新的点)
                context.quadraticCurveTo(this.x - this.width * 0.4, this.y + this.height * 0.5, this.x - this.width * 0.2, this.y + this.height * 0.3);
                context.quadraticCurveTo(this.x, this.y + this.height * 0.5, this.x + this.width * 0.2, this.y + this.height * 0.3);
                context.quadraticCurveTo(this.x + this.width * 0.4, this.y + this.height * 0.5, this.x + this.width * 0.5, this.y + this.height * 0.4);
                break;
              case 1: 
                context.lineTo(this.x - this.width * 0.5, this.y + this.height * 0.3);
                context.quadraticCurveTo(this.x - this.width * 0.25, this.y + this.height * 0.5, this.x, this.y + this.height * 0.3);
                context.quadraticCurveTo(this.x + this.width * 0.25, this.y + this.height * 0.5, this.x + this.width * 0.5, this.y + this.height * 0.3);
                break;
            }
            context.closePath();
            context.fill();
          }
          context.fillStyle = '#FFF';
          if (isSick) {
            context.arc(this.x - this.width * 0.15, this.y - this.height * 0.21, this.width * 0.08, 0, 2 * Math.PI, false);
            context.arc(this.x + this.width * 0.15, this.y - this.height * 0.21, this.width * 0.08, 0, 2 * Math.PI, false);
          } else {
            // 画幽灵的眼睛
            context.beginPath();
            context.arc(this.x - this.width * 0.15, this.y - this.height * 0.21, this.width * 0.12, 0, 2 * Math.PI, false);
            context.arc(this.x + this.width * 0.15, this.y - this.height * 0.21, this.width * 0.12, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
            context.fillStyle = '#000';
            context.beginPath();
            context.arc(this.x - this.width * (0.15 - 0.04 * _COS[this.direction]), this.y - this.height * (0.21 - 0.04 * _SIN[this.direction]), this.width * 0.07, 0, 2 * Math.PI, false);
            context.arc(this.x + this.width * (0.15 + 0.04 * _COS[this.direction]), this.y - this.height * (0.21 - 0.04 * _SIN[this.direction]), this.width * 0.07, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
          }
        }
      })
    }

    // 画完 npc 后保留引用，用于后续逻辑
    npcs = stage.getItemsByType(2);
    
    /**
     * 主角
     * 运行逻辑：
     * 初始化的过程中，通过设置的 coord 去计算出画布坐标，每次更新的时候通过画布坐标重新计算出 coord (元整 x y 标记是否有偏移量)，
     * 有偏移量的时候继续移动并处理吃豆情况，正好处于中心点时判断下一个方向，如果合法则重新赋值一点偏移量，使下次循环继续移动
     */
    player = stage.createItem({
      width: 30,
      height: 30,
      type: 1,
      location: map,
      coord: { x: 13.5, y: 23 },
      direction: 2,
      speed: 2,
      frames: 10,
      update() {
        const coord = this.coord;
        if (!coord.offset) {    // 没有偏移量
          // 处理玩家的合法方向键
          if (typeof this.control.direction !== 'undefined') {
            if (!map.get(coord.x + _COS[this.control.direction], coord.y + _SIN[this.control.direction])) {
              this.direction = this.control.direction;
            }
          }
          this.control = {};

          const value = map.get(coord.x + _COS[this.direction], coord.y + _SIN[this.direction]);
          if (value === 0) {
            this.x += this.speed * _COS[this.direction];
            this.y += this.speed * _SIN[this.direction];
          } else if (value < 0) {
            this.x -= map.size * (map.xLength - 1) * _COS[this.direction];
            this.y -= map.size * (map.yLength - 1) * _SIN[this.direction];
          }
        } else {    // 有偏移量
          this.x += this.speed * _COS[this.direction];
          this.y += this.speed * _SIN[this.direction];
        }
      },
      draw(context) {
        context.fillStyle = "#FFE600";
        context.beginPath();
        // 玩家正常状态
        if (stage.status !== 3) {
          if (this.times % 2) {
            context.arc(this.x, this.y, this.width / 2, (0.5 * this.direction + 0.20) * Math.PI, (0.5 * this.direction - 0.20) * Math.PI, false);
          } else {
            context.arc(this.x, this.y, this.width / 2, (0.5 * this.direction + 0.01) * Math.PI, (0.5 * this.direction - 0.01) * Math.PI, false);
          }
        }
        context.lineTo(this.x, this.y);
        context.closePath();
        context.fill();
      }
    });

    // 事件绑定
    stage.bind('keydown', (e) => {
      switch(e.keyCode) {
        case 13: // 回车
        case 32: // 空格
          this.status = this.status === 2 ? 1 : 2;
          break;
        case 39: // 右
          player.control = { direction: 0 };
          break;
        case 40: // 下
          player.control = { direction: 1 };
          break;
        case 37: // 左
          player.control = { direction: 2 };
          break;
        case 38: 
          player.control = { direction: 3 };
          break;  
      }
    })
  });
})();

game.init();