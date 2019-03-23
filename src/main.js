import './styles/index.css';
import SeamlessScroll from './seamless-scroll.js';

var scroller = new SeamlessScroll({
  el: 'box', // 容器元素的 ID
  direction: 'left', // 方向（可选值：left, right, up, down）
  width: document.body.clientWidth, // 宽度（px）
  height: (document.body.clientWidth * 175) / 375, // 高度（px）
  delay: 1500, // 每屏停留的时长
  duration: 800, // 每屏切换的动画时长
  activeIndex: 0, // 默认激活的 item 索引，从 0 开始
  autoPlay: true, // 自动播放
  prevent: true, // 阻止父元素滚动
  onChange(index) {
    var dots = document.querySelectorAll('.dot');
    dots.forEach(dot => (dot.style.color = '#333'));
    document.querySelector(`.dot${index}`).style.color = 'red';
  }
});

// 按钮
document.getElementById('start').addEventListener('click', scroller.start);
document.getElementById('stop').addEventListener('click', scroller.stop);
document.getElementById('continue').addEventListener('click', scroller.continue);
document.getElementById('destory').addEventListener('click', ()=>{
  scroller.destory();
  console.log(scroller);
});

// 监听窗口变化
(function() {
  var resizing, resizeTimer;
  window.onresize = function() {
    if (!resizing) {
      resizing = true;
      console.log('停止播放');
      scroller.stop();
    }
    resizeTimer && clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      console.log('停下来了，可以继续播放了');
      resizing = false;
      scroller.resize(document.body.clientWidth, 300);
      scroller.continue();
    }, 100);
  };
})();

// 跳转
document.getElementById('left').addEventListener('click', function() {
  scroller.go('left');
});
document.getElementById('right').addEventListener('click', function() {
  scroller.go('right');
});
document.getElementById('up').addEventListener('click', function() {
  scroller.go('up');
});
document.getElementById('down').addEventListener('click', function() {
  scroller.go('down');
});

document.querySelector('.dot0').addEventListener('click', function() {
  scroller.go(0);
});
document.querySelector('.dot1').addEventListener('click', function() {
  scroller.go(1);
});
document.querySelector('.dot2').addEventListener('click', function() {
  scroller.go(2);
});
document.querySelector('.dot3').addEventListener('click', function() {
  scroller.go(3);
});
document.querySelector('.dot4').addEventListener('click', function() {
  scroller.go(4);
});

// 禁用 Safari 的双击缩放
if (/iphone/i.test(navigator.userAgent)) {
  var lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    var now = Date.now();
    if (now - lastTouchEnd <= 360) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  });
}
