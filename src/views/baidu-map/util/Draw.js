import {GeoJSON, ClipperLib, Clipper, Snapping} from './Plugin'

const markerImg = require('@/assets/HT.png');

const YSL = {
  data: function () {
    return {
      map: null,
      stylePolygon: {
        strokeColor: '#3388ff', // 边线颜色。
        fillColor: '#bccde4', // 填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 1, // 边线的宽度，以像素为单位。
        strokeOpacity: 0.8, // 边线透明度，取值范围0 - 1。
        fillOpacity: 0.6, // 填充的透明度，取值范围0 - 1。
        strokeStyle: 'dashed' // 边线的样式，solid或dashed。
      },
      styleMarker: {
        icon: new BMap.Icon(markerImg, new BMap.Size(8, 8)), // 点上的实心图标
        enableClicking: false // 是否可点击
      },
      snappable: true, // 鼠标吸附功能开关
      prohibitSelfIntersection: true, // 禁止自相交开关
      doesSelfIntersect: false, // 当前区域是否自交
      enabledDraw: false, // 绘图状态
      hintMarker: null, // 吸附marker
      hintLabel: null, // 提示标题
      polygon: null,
      points: [],
      markers: [], // 节点上的marker集合
      updateLabelDate: null, // 修改提示标题后的计时时间
    }
  },
  methods: {
    initialize() {
      this.map = new BMap.Map('mapContainer', {enableMapClick: false});
      this.map.centerAndZoom('北京', 11);
      this.map.enableScrollWheelZoom();
    },

    enableDraw() {
      if (!this.map) {
        return;
      }

      if (this.enabledDraw) {
        return;
      }

      // 启用绘图模式
      this.enabledDraw = true;

      // 添加Marker光标
      this.hintMarker = new BMap.Marker({}, this.styleMarker);
      this.map.addOverlay(this.hintMarker);

      // 添加提示标签
      this.hintLabel = new BMap.Label("", {offset: new BMap.Size(5, -25)});

      // 添加多边形区域
      this.polygon = new BMap.Polygon({}, Object.assign({enableClicking: false}, this.stylePolygon));
      this.polygon.setStrokeWeight(2);
      this.map.addOverlay(this.polygon);

      // 修改地图光标
      this.map.setDefaultCursor('crosshair');

      // 临时关闭地图双击放大
      this.map.disableDoubleClickZoom();

      // 单击创建一个多边形节点
      this.map.addEventListener('click', this.clickAction);

      // 双击完成绘制
      this.map.addEventListener('dblclick', this.dblclickAction);

      // 移动同步提示线
      this.map.addEventListener('mousemove', this.moveHintMarker);

      // 右键单击移除一个节点
      this.map.addEventListener("rightclick", this.rightclickAction);

      // 按下Esc事件 停用绘图模式
      document.addEventListener("keydown", this.escAction);
    },

    disableDraw() {

      if (!this.enabledDraw) {
        return;
      }

      // 停用绘图模式
      this.enabledDraw = false;

      // 清理吸附数据
      if (this.snappable) {
        Snapping._cleanupSnapping();
      }

      // 移除Marker光标
      this.map.removeOverlay(this.hintMarker);

      // 移除提示标题
      this.map.removeOverlay(this.hintLabel);

      // 移除多边形
      this.map.removeOverlay(this.polygon);

      this.markers.forEach(m => {
        this.map.removeOverlay(m);
      });

      // 清空数据
      this.points = [];
      this.markers = [];
      this.hintMarker = null;
      this.hintLabel = null;
      this.polygon = null;

      // 还原地图双击放大
      this.map.enableDoubleClickZoom();

      // 解除监听事件
      this.map.removeEventListener('click', this.clickAction);
      this.map.removeEventListener('dblclick', this.dblclickAction);
      this.map.removeEventListener('mousemove', this.moveHintMarker);
      this.map.removeEventListener("rightclick", this.rightclickAction);
      // 按下Esc事件 停用绘图模式
      document.removeEventListener("keydown", this.escAction);

      // 重置地图光标
      this.map.setDefaultCursor("url('http://api0.map.bdimg.com/images/openhand.cur'), default");
    },
    // 切换绘图模式
    toggleDraw() {
      if (this.enabledDraw) {
        this.disableDraw();
      } else {
        this.enableDraw();
      }
    },
    setLabelText(text, styles) {

      // 提示错误信息后 2秒内不可修改标题
      if (this.updateLabelDate) {
        var now = new Date();
        if (now - this.updateLabelDate < 1000 * 2) {
          return;
        } else {
          this.updateLabelDate = null
        }
      }

      // 默认修改标题背景成白色
      this.hintLabel.setStyle({backgroundColor: 'white'});

      // 节点为空 则移除提示标题
      if (this.points == null || this.points.length === 0) {
        this.map.removeOverlay(this.hintLabel);
      } else if (text) {
        // 如果有传入文本 则为错误提示标题
        this.hintLabel.setContent(text);
        // 背景改为黄色
        this.hintLabel.setStyle({backgroundColor: 'yellow'});
        // 初始化计时器 暂时不可改变标题
        this.updateLabelDate = new Date();
      } else if (this.doesSelfIntersect) {
        this.hintLabel.setContent("不能交叉画图");
      } else if (this.points.length === 1) {
        this.map.addOverlay(this.hintLabel);
        this.hintLabel.setContent("点击继续绘制");
      } else if (this.points.length >= 2) {
        this.hintLabel.setContent("点击继续绘制，双击结束，右键回退，Esc键清除");
      }
    },
    /**
     * 删除一个节点
     */
    deleteAPoint() {

      // 删除最后一个节点
      this.points.pop();

      // 移除节点对应的marker
      this.map.removeOverlay(this.markers[this.markers.length - 1]);
      this.markers.pop();

      // 拼接一个临时点 位置为提示marker坐标
      var drawPoint = this.points.concat(this.hintMarker.getPosition());

      // 设置区域坐标点
      this.polygon.setPath(drawPoint);
    },
    escAction(e) {
      // 点击键盘Esc键
      if (e.keyCode === 27) {
        this.disableDraw();
      }
    },
    _handleSelfIntersection() {
      // if (this.points.length < 3 ) return;

      // 防止低版本浏览器单击事件触发移动事件
      // 扩展运算符数组深拷贝
      let [...paths] = this.polygon.getPath();
      // 如果最后一个点与提示marker光标坐标相同，则移除最后一个点
      if (this.points.length >= 3 && ClipperLib.op_Equality(this.points[this.points.length - 1], this.hintMarker.getPosition())) {
        paths.pop();
      }

      // 好的，我们需要检查这里的自相交。
      // 检查自相交
      this.doesSelfIntersect = ClipperLib.containKinks(GeoJSON.toGeoJSON(paths));

      // 修改自交样式
      if (this.doesSelfIntersect) {
        this.polygon.setStrokeColor('red');
        this.setLabelText();
      } else {
        this.polygon.setStrokeColor(this.stylePolygon.strokeColor);
        this.setLabelText();
      }
    },
    // 鼠标移动事件
    moveHintMarker(e) {

      // 同步提示标题
      this.hintLabel.setPosition(e.point);
      // 同步marker光标
      this.hintMarker.setPosition(e.point);
      // 同步区域临时节点
      this.polygon.setPositionAt(this.points.length, e.point);

      // 如果启用了吸附功能，就执行它
      if (this.snappable) {
        // 假拖动事件 = 鼠标移动事件 e
        const fakeDragEvent = e;
        fakeDragEvent.target = this.hintMarker; // target 目标是 圆点提示光标
        fakeDragEvent.polygon = this.polygon; // polygon 多边形覆盖物
        Snapping._handleSnapping(fakeDragEvent); // 处理吸附函数
      }

      // 如果禁止了自相交，就执行它
      // 暂停自交验证：单击事件触发的鼠标移动事件不执行自交验证，防止单击添加Marker后边框变红
      if (this.prohibitSelfIntersection) {
        this._handleSelfIntersection();
      }
    },
    rightclickAction() {
      if (this.points.length === 0) {
        return;
      }

      // 删除最后一个节点
      this.deleteAPoint();

      // 如果禁止了自相交，就执行它
      if (this.prohibitSelfIntersection) {
        this._handleSelfIntersection();
      }
    },
    // 鼠标单击事件
    clickAction() {
      // 点数组长度大于 1 并且 点数组最后一个点坐标与当前点坐标相等
      // 防止创建相同点和自交点
      if (this.points.length > 1 && ClipperLib.op_Equality(this.points[this.points.length - 1], this.hintMarker.getPosition())) {
        return false;
      }

      this.points.push(this.hintMarker.getPosition());
      // 在当前位置拼接一个动态点，跟随鼠标移动
      var drawPoint = this.points.concat(this.hintMarker.getPosition());
      this.polygon.setPath(drawPoint);

      // 节点提示
      let marker = new BMap.Marker(this.hintMarker.getPosition(), this.styleMarker);
      this.map.addOverlay(marker);
      this.markers.push(marker);

      // 设置提示标题
      this.setLabelText();
    },
    // 鼠标双击事件
    dblclickAction() {
      // 点数组长度 小于 3个坐标点 或 当前区域自交
      if (this.points.length < 3) return;
      if (this.doesSelfIntersect) {
        // 双击保存失败时，不添加点，移除最后一个点
        // 删除最后一个节点
        this.deleteAPoint();
        return;
      }
      this.polygon.setPath(this.points);
      // this.polygon.setStrokeWeight(1);

      try {
        // 处理裁剪去重 (要裁剪的区域, 地图上的所有覆盖物)
        const results = Clipper.execute(this.polygon, this.map.getOverlays());
        // 添加裁剪后的区域
        let _polygon = new BMap.Polygon(results, this.stylePolygon);
        this.map.addOverlay(_polygon);

        // 开启编辑模式
        this.toggleEdit(_polygon);

        // 关闭绘图
        this.disableDraw();
      } catch (e) {
        // 删除最后一个节点
        this.deleteAPoint();
        if (e.name === 'ClipperError') {
          setTimeout(() => {
            this.setLabelText(e.message);
          }, 100)
        }
      }
    }
  }
}
export default YSL;

////////////////////// 地图控件 //////////////////////

export function Control(_map, toggle) {

  // 设置11级缩放级别
  function Zoom11() {
    this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
    this.defaultOffset = new BMap.Size(10, 40);
  }

  Zoom11.prototype = new BMap.Control();
  Zoom11.prototype.initialize = function (map) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode('11级'));
    div.style.cursor = 'pointer';
    div.style.border = '1px solid gray';
    div.style.backgroundColor = 'white';
    div.onclick = () => {
      map.setZoom(11);
    };
    map.getContainer().appendChild(div);
    return div;
  };

  // 设置15级缩放级别
  function Zoom15() {
    this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
    this.defaultOffset = new BMap.Size(60, 40);
  }

  Zoom15.prototype = new BMap.Control();
  Zoom15.prototype.initialize = function (map) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode('15级'));
    div.style.cursor = 'pointer';
    div.style.border = '1px solid gray';
    div.style.backgroundColor = 'white';
    div.onclick = () => {
      map.setZoom(15);
    };
    map.getContainer().appendChild(div);
    return div;
  };

  // 清除覆盖物
  function ClearOverlays() {
    this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
    this.defaultOffset = new BMap.Size(10, 70);
  }

  ClearOverlays.prototype = new BMap.Control();
  ClearOverlays.prototype.initialize = function (map) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode('清除覆盖物'));
    div.style.cursor = 'pointer';
    div.style.border = '1px solid gray';
    div.style.backgroundColor = 'white';
    div.onclick = () => {
      map.clearOverlays();
    };
    map.getContainer().appendChild(div);
    return div;
  };

  // 绘制多边形
  function DrawControl() {
    // 默认停靠位置和偏移量
    this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
    this.defaultOffset = new BMap.Size(10, 10);
  }

  // 通过JavaScript 的prototype 属性继承于BMap.Control
  DrawControl.prototype = new BMap.Control();

  // 自定义控件必须实现initialize 方法，并且将控件的DOM 元素返回
  // 在本方法中创建个div 元素作为控件的容器，并将其添加到地图容器中
  DrawControl.prototype.initialize = function (map) {
    // 创建一个DOM 元素
    var div = document.createElement('div');
    // 添加文字说明
    div.appendChild(document.createTextNode('》》》画图《《《'));
    // 设置样式
    div.style.cursor = 'pointer';
    div.style.border = '1px solid gray';
    div.style.backgroundColor = 'white';
    // 绑定事件
    div.onclick = function () {
      toggle();
    };
    // 添加DOM控件 元素到地图中
    map.getContainer().appendChild(div);
    // 将DOM 元素返回
    return div;
  };

  _map.addControl(new Zoom11()); // 设置11级缩放级别
  _map.addControl(new Zoom15()); // 设置15级缩放级别
  _map.addControl(new ClearOverlays()); // 清除覆盖物
  _map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT}));// 右上角，添加默认缩放平移控件
  _map.addControl(new DrawControl());// 右上角，添加默认缩放平移控件
};

