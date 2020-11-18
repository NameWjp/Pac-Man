const _NPC = ['#F00','#F93','#0CF','#F9C']; //NPC颜色
const _LIFE = 5; // 玩家生命值
const _SCORE = 0; // 玩家得分

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
    draw: function(context) {
      // 根据内部计算器 times 计算出 t(0 -> 5 的整数) 重新绘制
      const t = Math.abs(5 - this.times % 10);
      context.beginPath();
      context.fillStyle = '#FFE600';
      context.arc(this.x, this.y, this.width / 2, t * 0.04 * Math.PI, (2 - t * 0.04) * Math.PI, false);
      context.lineTo(this.x, this.y);
      context.closePath();
      context.fill();
      
      context.beginPath();
      context.fillStyle = "#000";
      context.arc(this.x + 5, this.y - 27, 7, 0, 2 * Math.PI, false);
      context.closePath();
      context.fill();
    }
  });

  // 游戏名
  stage.createItem({
    x: game.width / 2,
    y: game.height * 0.6,
    draw: function(context) {
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

game.init();