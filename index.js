const _NPC = ['#F00','#F93','#0CF','#F9C']; //NPC颜色
const _LIFE = 5; // 玩家生命值
const _SCORE = 0; // 玩家得分

const game = new Game('canvas');

// 启动页面
// (function() {
//   const stage = game.createStage();
//   // logo
//   stage.createItem({
//     x: game.width / 2,
//     y: game.height * 0.45,
//     width: 100,
//     height: 100,
//     frames: 3,
//     draw(context) {
//       // 根据内部计算器 times 计算出 t(0 -> 5 的整数) 重新绘制
//       const t = Math.abs(5 - this.times % 10);

//       context.fillStyle = '#FFE600';
//       context.beginPath();
//       context.arc(this.x, this.y, this.width / 2, t * 0.04 * Math.PI, (2 - t * 0.04) * Math.PI, false);
//       context.lineTo(this.x, this.y);
//       context.closePath();
//       context.fill();
      
//       context.fillStyle = "#000";
//       context.beginPath();
//       context.arc(this.x + 5, this.y - 27, 7, 0, 2 * Math.PI, false);
//       context.closePath();
//       context.fill();
//     }
//   });

//   // 游戏名
//   stage.createItem({
//     x: game.width / 2,
//     y: game.height * 0.6,
//     draw(context) {
//       context.font = 'bold 42px Helvetica';
//       context.textAlign = 'center';
//       context.textBaseline = 'middle';
//       context.fillStyle = '#FFF';
//       context.fillText('Pac-Man', this.x, this.y);
//     }
//   });
  
//   // 事件绑定
//   stage.bind('keydown', (e) => {
//     switch(e.keyCode) {
//       case 13:
//       case 32:
//         game.nextStage();
//         break;
//     }
//   });
// })();

// 游戏主程序
(function() {
  _GAMEData.forEach((config, index) => {
    let stage, map, beans, items, player, times;

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
              // 右侧点 ()
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
                  default:
                    break;
                }
              }
            }
          }
        }
      }
    });
  })
})()

game.init();