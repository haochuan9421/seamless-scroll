/**
 * 判断是否是非负数
 * @param {Sting} field 字段名
 * @param {*} value 值
 */
function isNonNegativeNumber(field, value) {
  const checked = typeof value === 'number' && value >= 0 && value !== Infinity;
  if (!checked) {
    throw new Error(`${field} option must be a non-negative number`);
  }
}

/**
 * 判断是否是布尔值
 * @param {Sting} field 字段名
 * @param {*} value 值
 */
function isBoolean(field, value) {
  if (value !== true && value !== false) {
    throw new Error(`${field} option must be a boolean`);
  }
}

/**
 * 为配置参数设置默认值并检测是否符合要求
 * @param {Object} opts
 */
function checkOpts(opts) {
  // 必须是对象
  if (Object.prototype.toString.apply(opts) !== '[object Object]') {
    throw new Error('config must be an object');
  }
  // 设置默认值
  if (opts.direction === undefined) {
    opts.direction = 'left';
  }
  if (opts.duration === undefined) {
    opts.duration = 300;
  }
  if (opts.delay === undefined) {
    opts.delay = 3000;
  }
  if (opts.activeIndex === undefined) {
    opts.activeIndex = 0;
  }
  if (opts.autoPlay === undefined) {
    opts.autoPlay = true;
  }
  if (opts.prevent === undefined) {
    opts.prevent = true;
  }
  // 校验参数
  if (typeof opts.el !== 'object' && !document.getElementById(opts.el)) {
    throw new Error('el option must be an existing HTML Element');
  }
  if (['left', 'right', 'up', 'down'].indexOf(opts.direction) === -1) {
    throw new Error('direction option must be one of ["left", "right", "up", "down"]');
  }
  isNonNegativeNumber('width', opts.width);
  isNonNegativeNumber('height', opts.height);
  isNonNegativeNumber('duration', opts.duration);
  isNonNegativeNumber('delay', opts.delay);
  isNonNegativeNumber('activeIndex', opts.activeIndex);
  isBoolean('autoPlay', opts.autoPlay);
  isBoolean('prevent', opts.prevent);
  if (opts.onChange && typeof opts.onChange !== 'function') {
    throw new Error('onChange option must be a function');
  }
}

// /**
//  * 获取当前浏览器 requestAnimationFrame 的执行间隔（效果不好，暂时直接使用1000 / 60）
//  * @param {Function} cb 回调函数，入参为两次间隔的毫秒数
//  */
// function getFrameDiff(cb){
//   let start;
//   requestAnimationFrame(step);
//   function step(timestamp){
//     if(start){
//       cb(timestamp - start);
//     }else{
//       start = timestamp;
//       requestAnimationFrame(step);
//     }
//   }
// }

// 这两个方法支持到：IOS7+, Safari6.2+, Android5+，IE10+
const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
if (!requestAnimationFrame) {
  throw new Error('seamless-scroll can\'t work, because of requestAnimationFrame is support in your browser！');
}
// translate 兼容到：IOS9+, Safari9.1+, Android5+, IE10+。虽然使用定位 + left/top，也可以实现本插件的效果，但是效果不如 translate
if ('transition' in document.body.style === false) {
  console.log('seamless-scroll may not work, because of css transition is support in your browser！');
}

function SeamlessScroll(opts) {
  if (!(this instanceof SeamlessScroll)) {
    throw new TypeError('SeamlessScroll must be called by the \'new\' keyword as a constructor');
  }
  const _this = this;
  // 参数校验
  checkOpts(opts);
  // 获取 DOM 元素
  const wrap = typeof opts.el === 'object' ? opts.el : document.getElementById(opts.el); // 父容器
  const list = wrap.children[0]; // 列表
  const items = list.children; // 子元素
  const length = items.length; // 子元素数量

  // 初始化内部变量
  let isHorizontal = opts.direction === 'left' || opts.direction === 'right', // 是否是水平方向移动
    delayTimer, // 屏与屏切换时的延迟定时器
    oneStep = (((isHorizontal ? opts.width : opts.height) / opts.duration) * 1000) / 60, // 每一小步移动的距离（requestAnimationFrame 的回调函数执行次数通常是每秒60次）
    moveRequestId, // requestAnimationFrame 的返回值
    destination, // 目标位置
    startX, // 触摸开始时的 X 轴坐标
    startY, // 触摸开始时的 Y 轴坐标
    startLeft, // 触摸开始时的左偏移量
    startTop, // 触摸开始时的上偏移量
    startTime, // 触摸开始时的时间戳
    startIndex, // 触摸开始时，触摸的元素的索引值
    leftOffset, // 左偏移量（通过读取元素的样式也可以获取，但这样通过 JS 变量来记录，对性能的开销显然小于直接对 DOM 操作的开销）
    topOffset, // 上偏移量
    stopped; // 是否已被停止

  // 监听内部索引值的变化，并在被更改时调用 opts.onChange 方法通知外部
  let observerObj = { _innerActive: opts.activeIndex + 1 }; // 内部索引
  Object.defineProperty(observerObj, 'innerActive', {
    configurable: false,
    enumerable: true,
    get() {
      return observerObj._innerActive;
    },
    set(value) {
      observerObj._innerActive = value;
      value > 0 && value < length + 1 && opts.onChange && opts.onChange(value - 1);
    }
  });

  // 设置父容器样式
  wrap.style.display = 'block';
  wrap.style.width = opts.width + 'px';
  wrap.style.height = opts.height + 'px';
  wrap.style.overflow = 'hidden';

  // 设置列表样式
  list.style.display = 'block';
  if (isHorizontal) {
    list.style.height = opts.height + 'px';
    list.style.width = opts.width * (length + 2) + 'px';
  } else {
    list.style.height = opts.height * (length + 2) + 'px';
    list.style.width = opts.width + 'px';
  }

  // 设置元素样式
  for (let i = 0; i < length; i++) {
    items[i].style.display = 'block';
    items[i].style.width = opts.width + 'px';
    items[i].style.height = opts.height + 'px';
    if (isHorizontal) {
      items[i].style.float = 'left';
    }
  }

  // 前后各补充一个边界元素，以实现“无缝”的视觉效果
  const firstItem = items[0].cloneNode(true);
  const lastItem = items[length - 1].cloneNode(true);
  list.insertBefore(lastItem, items[0]);
  list.appendChild(firstItem);

  // 开始
  if (opts.autoPlay) {
    play();
  } else {
    resetStatus();
  }

  /**
   * 获取当前屏的索引
   * 当用户用手指快速滑动时，或者通过 go 方法指定式的操作跳转时
   * 用户潜意识里通常会认为占据屏幕大部分面积的那一屏是当前屏
   */
  function getVisualIndex() {
    let index;
    if (isHorizontal) {
      index = Math.round(Math.abs(leftOffset) / opts.width);
    } else {
      index = Math.round(Math.abs(topOffset) / opts.height);
    }
    if (index === 0) {
      // 补位到最前面的那一屏
      index = length;
    } else if (index === length + 1) {
      // 补位到最后面的那一屏
      index = 1;
    }
    return --index;
  }

  /**
   * 重置状态
   */
  function resetStatus() {
    // 如果到达临界状态，更新内部索引，以达到“无缝”的效果
    if (observerObj.innerActive > length) {
      observerObj.innerActive = 1;
    } else if (observerObj.innerActive < 1) {
      observerObj.innerActive = length;
    }
    // 偏移量立即回归到准确的位置
    if (isHorizontal) {
      leftOffset = -opts.width * observerObj.innerActive;
      list.style.transform = `translateX(${leftOffset}px)`;
    } else {
      topOffset = -opts.height * observerObj.innerActive;
      list.style.transform = `translateY(${topOffset}px)`;
    }
  }

  /**
   * 播放时，每移动一屏，调一次 play 方法，以重置状态和确认新的目标位置
   */
  function play(delay = opts.delay) {
    // 重置状态
    resetStatus();
    // 停留一段时间后，确认新的目标位置，并开始下一波的移动
    delayTimer = setTimeout(function() {
      switch (opts.direction) {
        case 'left':
          observerObj.innerActive++;
          destination = -opts.width * observerObj.innerActive;
          break;
        case 'up':
          observerObj.innerActive++;
          destination = -opts.height * observerObj.innerActive;
          break;
        case 'right':
          observerObj.innerActive--;
          destination = -opts.width * observerObj.innerActive;
          break;
        case 'down':
          observerObj.innerActive--;
          destination = -opts.height * observerObj.innerActive;
          break;
        default:
          break;
      }
      move(opts.direction, oneStep);
    }, delay);
  }

  /**
   * 调用 requestAnimationFrame，一小步一小步的移动，直到到达目标位置
   * @param {Number} direction 目标位置
   * @param {Number} step 一小步的距离，步子越大，速度越快
   */
  function move(direction, step) {
    // https://developer.mozilla.org/zh-CN/docs/Web/CSS/will-change(效果还不如不加的流畅)
    // if ('willChange' in list.style && list.style.willChange === '') {
    //   list.style.willChange = 'transform';
    // }

    function moveStep() {
      // 由于 cancelAnimationFrame 的兼容性比较差，stop 方法触发时并不一定能让这个递归动作取消，也就是移动停止
      // 所以需要通过配合 stopped 字段来决定行止
      if (stopped) {
        return;
      }
      switch (direction) {
        case 'left':
          leftOffset -= step;
          if (leftOffset > destination) {
            // 即使向前走一步也不会超出目标，那就走呗
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            // 到达或超过了目标位置后，如果已经播放过了，那就可以调用 play 方法继续了，如果从来没播放过，调整好位置，静静的待着
            delayTimer ? play() : resetStatus();
          }
          break;
        case 'right':
          leftOffset += step;
          if (leftOffset < destination) {
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            delayTimer ? play() : resetStatus();
          }
          break;
        case 'up':
          topOffset -= step;
          if (topOffset > destination) {
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            delayTimer ? play() : resetStatus();
          }
          break;
        case 'down':
          topOffset += step;
          if (topOffset < destination) {
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            delayTimer ? play() : resetStatus();
          }
          break;
        default:
          break;
      }
    }
    moveRequestId = requestAnimationFrame(moveStep);
  }

  /**
   * 调用 requestAnimationFrame，一小步一小步的移动，分两段走，以达到“最短距离”的视觉效果
   * @param {Number} direction 目标位置
   * @param {Number} step 一小步的距离，步子越大，速度越快
   */
  function bestMove(direction, step) {
    let max = 0; // 偏移量的正边界
    let min = -(length + 1) * (isHorizontal ? opts.width : opts.height); // 偏移量的负边界
    function moveStep() {
      if (stopped) {
        return;
      }
      switch (direction) {
        case 'left':
          if (leftOffset < destination && leftOffset - step > min) {
            // 一直移动到最右侧
            leftOffset -= step;
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (leftOffset - step <= min) {
            // 临界状态，重置
            leftOffset = -opts.width;
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (leftOffset - step > destination) {
            // 继续向左移动
            leftOffset -= step;
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            delayTimer ? play() : resetStatus();
          }
          break;
        case 'right':
          if (leftOffset > destination && leftOffset + step < max) {
            leftOffset += step;
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (leftOffset + step >= max) {
            leftOffset = -opts.width * length;
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (leftOffset + step < destination) {
            leftOffset += step;
            list.style.transform = `translateX(${leftOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            delayTimer ? play() : resetStatus();
          }
          break;
        case 'up':
          if (topOffset < destination && topOffset - step > min) {
            topOffset -= step;
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (topOffset - step <= min) {
            topOffset = -opts.height;
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (topOffset - step > destination) {
            topOffset -= step;
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            delayTimer ? play() : resetStatus();
          }
          break;
        case 'down':
          if (topOffset > destination && topOffset + step < max) {
            topOffset += step;
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (topOffset + step >= max) {
            topOffset = -opts.height * length;
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else if (topOffset + step < destination) {
            topOffset += step;
            list.style.transform = `translateY(${topOffset}px)`;
            moveRequestId = requestAnimationFrame(moveStep);
          } else {
            delayTimer ? play() : resetStatus();
          }
          break;
        default:
          break;
      }
    }
    moveRequestId = requestAnimationFrame(moveStep);
  }

  // 触摸开始
  function touchStartHandler(event) {
    _this.stop();
    startTime = Date.now();
    startX = event.touches[0].pageX;
    startY = event.touches[0].pageY;
    startLeft = leftOffset;
    startTop = topOffset;
    startIndex = getVisualIndex();
  }
  wrap.addEventListener('touchstart', touchStartHandler);

  // 滑动
  function touchMoveHandler(event) {
    // 防止父级滚动
    opts.prevent && event.preventDefault();
    let diff, max, min;
    if (isHorizontal) {
      diff = event.touches[0].pageX - startX;
      leftOffset = startLeft + diff;
      // 不能超出边界位置
      max = 0;
      min = -opts.width * (length + 1);
      if (leftOffset > max) {
        leftOffset = max;
      } else if (leftOffset < min) {
        leftOffset = min;
      }
      list.style.transform = `translateX(${leftOffset}px)`;
    } else {
      diff = event.touches[0].pageY - startY;
      topOffset = startTop + diff;
      max = 0;
      min = -opts.height * (length + 1);
      if (topOffset > max) {
        topOffset = max;
      } else if (topOffset < min) {
        topOffset = min;
      }
      list.style.transform = `translateY(${topOffset}px)`;
    }
  }
  wrap.addEventListener('touchmove', touchMoveHandler);

  // 触摸结束
  function touchEndHandler(event) {
    let moveTime = Date.now() - startTime;
    if (isHorizontal) {
      let endX = event.changedTouches[0].pageX;
      let speedX = (endX - startX) / moveTime;
      if (speedX < -0.6) {
        // 向左快速滑
        _this.go(startIndex === length - 1 ? 0 : startIndex + 1);
      } else if (speedX > 0.6) {
        // 向右快速滑
        _this.go(startIndex === 0 ? length - 1 : startIndex - 1);
      } else {
        // 慢慢的滑，停下来后，贴到最近的那一边
        observerObj.innerActive = Math.round(Math.abs(leftOffset) / opts.width);
        destination = -opts.width * observerObj.innerActive;
        // 开始下一波移动
        stopped = false;
        move(leftOffset < destination ? 'right' : 'left', Math.abs(destination - leftOffset) / 15);
      }
    } else {
      let endY = event.changedTouches[0].pageY;
      let speedY = (endY - startY) / moveTime;
      if (speedY < -0.6) {
        _this.go(startIndex === length - 1 ? 0 : startIndex + 1);
      } else if (speedY > 0.6) {
        _this.go(startIndex === 0 ? length - 1 : startIndex - 1);
      } else {
        observerObj.innerActive = Math.round(Math.abs(topOffset) / opts.height);
        destination = -opts.height * observerObj.innerActive;
        // 开始下一波移动
        stopped = false;
        move(topOffset < destination ? 'down' : 'up', Math.abs(destination - topOffset) / 15);
      }
    }
  }
  wrap.addEventListener('touchend', touchEndHandler);

  // 开始（该方法只能调用一次，用于非自动播放时，手动开始播放）
  this.start = function() {
    if (delayTimer) {
      // setTimeout 的返回值是正整数，一旦 play 方法被调用，该值即为 Truthy
      return;
    }
    stopped = false;
    play(0); // 0ms 延迟，立即开始移动
  };

  // 暂停
  this.stop = function() {
    stopped = true;
    delayTimer && clearTimeout(delayTimer);
    moveRequestId && cancelAnimationFrame && cancelAnimationFrame(moveRequestId);
  };

  // 继续
  this.continue = function() {
    // 只允许在“播放过”且“被停止”的状态下调用
    if (delayTimer && stopped) {
      stopped = false;
      move(opts.direction, oneStep);
    }
  };

  // 以最短的距离从当前位置移动到目标屏
  this.go = function(target) {
    if (typeof target !== 'number' && ['left', 'right', 'up', 'down'].indexOf(target) === -1) {
      throw new Error('only support index or one of ["left", "right", "up", "down"]');
    }

    // 想跳转的索引
    let index;
    if (typeof target === 'number') {
      index = target;
    } else if ((isHorizontal && ['left', 'right'].indexOf(target) === -1) || (!isHorizontal && ['up', 'down'].indexOf(target) === -1)) {
      // 方向冲突
      throw new Error('direction conflict');
    } else {
      index = getVisualIndex();
      if (target === 'left' || target === 'up') {
        index = index === length - 1 ? 0 : index + 1;
      } else {
        index = index === 0 ? length - 1 : index - 1;
      }
    }
    // 使得 innerActive 不落在两侧的补位屏上
    observerObj.innerActive = Math.max(Math.min(index + 1, length), 1);

    // 停止原本的活动状态
    _this.stop();

    // 到下一帧再开始新的动作，这么做的原因在于：
    // cancelAnimationFrame 的兼容性并不好，stop 方法的执行并不能保证原本 move/bestMove 方法中 requestAnimationFrame 动作已经取消
    // 等一帧，让 stopped 字段先发挥作用

    requestAnimationFrame(function() {
      // 此时之前的 move/bestMove 动作已经结束，重置 stopped 为 false，以开始新的动作
      stopped = false;
      if (isHorizontal) {
        let len = opts.width * length;
        // 如果此时出现了补位屏，立即重置位置
        if (leftOffset > -opts.width) {
          leftOffset -= len;
        } else if (leftOffset < -len) {
          leftOffset += len;
        }
        list.style.transform = `translateX(${leftOffset}px)`;
        // 确认目标位置，并以最短的距离直接从当前位置移动到目标屏（比如从第五屏到第二屏，如果按照 5，4，3，2 的顺序走，是不如5，1，2 的顺序的）
        destination = -opts.width * observerObj.innerActive;
        let diff = Math.abs(destination - leftOffset);
        if (diff <= len / 2) {
          move(leftOffset < destination ? 'right' : 'left', diff / 20);
        } else {
          bestMove(leftOffset < destination ? 'left' : 'right', (len - diff) / 20);
        }
      } else {
        let len = opts.height * length;
        if (topOffset > -opts.height) {
          topOffset -= len;
        } else if (topOffset < -len) {
          topOffset += len;
        }
        list.style.transform = `translateY(${topOffset}px)`;
        destination = -opts.height * observerObj.innerActive;
        let diff = Math.abs(destination - topOffset);
        if (diff <= len / 2) {
          move(topOffset < destination ? 'down' : 'up', diff / 20);
        } else {
          bestMove(topOffset < destination ? 'up' : 'down', (len - diff) / 20);
        }
      }
    });
  };

  // 重置宽高
  this.resize = function(width, height) {
    isNonNegativeNumber('width', width);
    isNonNegativeNumber('height', height);
    // 保存之前的宽高
    let widthBak = opts.width;
    let heightBak = opts.height;
    // 更新内部数据
    opts.width = width;
    opts.height = height;
    oneStep = (((isHorizontal ? width : height) / opts.duration) * 1000) / 60;
    // 更新样式
    wrap.style.width = width + 'px';
    wrap.style.height = height + 'px';
    if (isHorizontal) {
      list.style.height = height + 'px';
      list.style.width = width * (length + 2) + 'px';
      // 等比缩放偏移量和目标位置的值
      destination = destination * (width / widthBak);
      leftOffset = leftOffset * (width / widthBak);
      list.style.transform = `translateX(${leftOffset}px)`;
    } else {
      list.style.height = height * (length + 2) + 'px';
      list.style.width = width + 'px';
      destination = destination * (height / heightBak);
      topOffset = topOffset * (height / heightBak);
      list.style.transform = `translateY(${leftOffset}px)`;
    }
    for (let i = 0; i < length + 2; i++) {
      items[i].style.width = width + 'px';
      items[i].style.height = height + 'px';
    }
  };

  // 销毁
  this.destory = function() {
    // 停止移动
    _this.stop();
    // 移除监听器
    wrap.removeEventListener('touchstart', touchStartHandler);
    wrap.removeEventListener('touchmove', touchMoveHandler);
    wrap.removeEventListener('touchend', touchEndHandler);
    // 清除添加的样式
    // 1. 父容器样式
    wrap.style.display = '';
    wrap.style.width = '';
    wrap.style.height = '';
    wrap.style.overflow = '';

    // 2. 列表样式
    list.style.display = '';
    list.style.height = '';
    list.style.width = '';
    list.style.transform = '';

    // 3. 移除边界元素
    list.removeChild(items[0]);
    list.removeChild(items[length]);

    // 4. 元素样式
    for (let i = 0; i < length; i++) {
      items[i].style.display = '';
      items[i].style.width = '';
      items[i].style.height = '';
      if (isHorizontal) {
        items[i].style.float = '';
      }
    }
    // 释放内存 (JS 有自带垃圾回收机制，而且似乎也没有办法从构造函数内部删除已创建的实例)
    // 参考链接：https://stackoverflow.com/questions/21118952/javascript-create-and-destroy-class-instance-through-class-method
    for (let key in _this) {
      delete _this[key];
    }
    _this['__proto__'] = null;
  };
}

export default SeamlessScroll;
