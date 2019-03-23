# seamless-scroll

<p align="center">
  <a href="https://www.npmjs.com/package/seamless-scroll">
    <img src="https://img.shields.io/npm/v/seamless-scroll.svg" alt="Version">
  </a>
  <a href="https://npmcharts.com/compare/seamless-scroll?minimal=true">
    <img src="https://img.shields.io/npm/dm/seamless-scroll.svg" alt="Downloads">
  </a>
  <a href="https://www.jsdelivr.com/package/npm/seamless-scroll">
    <img src="https://data.jsdelivr.com/v1/package/npm/seamless-scroll/badge?style=rounded" alt="jsdelivr">
  </a>
  <a href="https://www.jsdelivr.com/package/npm/seamless-scroll">
    <img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/seamless-scroll/lib/seamless-scroll.min.js?compression=gzip" alt="size">
  </a>
  <a href="https://github.com/HaoChuan9421/seamless-scroll/issues">
    <img src="https://img.shields.io/github/issues-closed/haochuan9421/seamless-scroll.svg" alt="Issues">
  </a>
  <a href="https://github.com/HaoChuan9421/seamless-scroll/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/seamless-scroll.svg" alt="License">
  </a>
</p>

> 一款媲美原生 App 体验的“无缝滚动”插件。借助 `requestAnimationFrame` 和 `translate` 实现。智能识别用户手势意图。

<img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/demo.gif" width="375" />

[扫码体验](https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/qrcode.png)&emsp;[点击预览](https://haochuan9421.github.io/seamless-scroll-demo/)&emsp;[示例代码](https://github.com/HaoChuan9421/seamless-scroll-demo/)

<img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/qrcode.png" width="200" />

## Browser support

| <img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/chrome.png" width="16px" height="16px" /></br>Chrome | <img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/firefox.png" width="16px" height="16px" /></br>Firefox | <img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/safari.png" width="16px" height="16px" /></br>Safari | <img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/ie.png" width="16px" height="16px" /></br>IE | <img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/ios.png" width="16px" height="16px" /></br>iOS | <img src="https://github.com/HaoChuan9421/seamless-scroll/raw/master/assets/android.png" width="16px" height="16px" /></br>Android |
| :------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------: |
|                                                             &check;                                                              |                                                              &check;                                                               |                                                               9.1+                                                               |                                                           10+                                                            |                                                             9+                                                             |                                                                 5+                                                                 |

## Installation

```bash
npm i seamless-scroll
# 或者
yarn add seamless-scroll
```

## Quick Start

为了插件更好的运行，页面的 DOM 结构需按照下面的约定设置：

```html
<!-- 容器 -->
<div id="box">
  <!-- 列表 -->
  <ul>
    <!-- 子元素们 -->
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>5</li>
  </ul>
  <!-- 此处可以添加“小圆点指示器”或“前进后退箭头”等 DOM 元素-->
</div>
```

初始化一个简单的“无缝滚动”实例：

```js
// 引入插件
import SeamlessScroll from 'seamless-scroll';

// 创建实例
const scroller = new SeamlessScroll({
  el: 'box',
  direction: 'left',
  width: 375,
  height: 175,
  autoPlay: false
});

// 用户点击“开始按钮”时，调用实例的 start 方法，开始播放
const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', function() {
  scroller.start();
});
```

## 参数

| 参数名        | 说明                                                                                                   | 可选值                        | 默认值 | 必填 |
| ------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------- | ------ | ---- |
| `el`          | 容器元素。可以是已经获取到的 `DOM` 对象，也可以是元素 `id`                                             | `DOMElement` 或 `String`      | 无     | 是   |
| `direction`   | 滚动的方向                                                                                             | `left`, `right`, `up`, `down` | `left` | 否   |
| `width`       | 容器的宽度，单位 `px`                                                                                  | `Number`                      | 无     | 是   |
| `height`      | 容器的高度，单位 `px`                                                                                  | `Number`                      | 无     | 是   |
| `delay`       | 每屏停留的时间，单位 `ms`                                                                              | `Number`                      | `3000` | 否   |
| `duration`    | 滚动一屏需要的时间，单位 `ms`                                                                          | `Number`                      | `300`  | 否   |
| `activeIndex` | 默认显示的元素在列表中的索引，从 `0` 开始                                                              | `Number`                      | `0`    | 否   |
| `autoPlay`    | 是否自动开始播放，如果设置为 `false`，稍后可以调用实例的 `start` 方法手动开始                          | `Boolean`                     | `true` | 否   |
| `prevent`     | 阻止页面滚动，通常用于竖向播放的情况，设置为 `true` 时，可避免用户在组件内的滑动手势导致的页面上下滚动 | `Boolean`                     | `true` | 否   |
| `onChange`    | 屏与屏之间切换时的回调函数，入参为当前屏的索引，可用于自定义小圆点指示器这样的场景                     | `Function`                    | 无     | 否   |

## 实例方法

#### `start`

非自动播放时，调用此方法可手动开始播放。只能调用一次，仅限于 `autoPlay` 为 `false` 且从未开始的情况下使用。

#### `stop`

停止播放。

#### `continue`

继续播放。配合 `stop` 方法使用。

#### `go`

直接滚动的某个索引的位置，或者向某个方向滚动一屏。你可以借助此方法实现快速跳转或者前后切换的业务场景。该方法跳转的逻辑是选取目标屏与当前屏的最短距离进行位移，比如从 `第5屏` 到 `第2屏`，会按照 `5，1，2` 的顺序移动，而不是 `5，4，3，2` 的顺序，这样的好处在于真正形成视觉上的 “**无缝**” 效果。

- 示例：`scroller.go(0)` 或 `scroller.go('left')`
- 参数类型：`Number` 或 `left`, `right`, `up`, `down`

#### `resize`

更新容器的宽高。

- 示例：`scroller.resize(375, 175) // width, height`
- 参数类型：`Number`，单位 `px`

比如下面这段代码，就是在监听到浏览器窗口大小改变后，重新设置了宽高。

```js
(function() {
  var resizing, resizeTimer;
  window.onresize = function() {
    if (!resizing) {
      // 第一次触发，停止 scroller 的滚动
      resizing = true;
      scroller.stop();
    }
    resizeTimer && clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // 停下来后，重设 scroller 的宽高，并继续之前的播放
      resizing = false;
      scroller.resize(document.body.clientWidth, 300);
      scroller.continue();
    }, 100);
  };
})();
```

## Features

1. `60fps` 的流畅体验，基于 `requestAnimationFrame` 和 `translate` 实现。
2. 对“快速滑动切换”和“缓慢拖动”等手势场景的智能处理。
3. 选取最优路径跳转，达到真正意义上“**无缝**”的视觉体验。

[了解更多](https://github.com/HaoChuan9421/blog/issues/12)

## License

[MIT](https://github.com/HaoChuan9421/vue-ueditor-wrap/blob/master/LICENSE)
