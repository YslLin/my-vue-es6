import {GeoJSON, ClipperLib, Clipper, Snapping} from './Plugin'

const markerImg = require('@/assets/HT.png');

const YSL = {
  data: function () {
    return {
      stylePolygon: {
        strokeColor: '#3388ff', // 边线颜色。
        fillColor: '#bccde4', // 填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 1, // 边线的宽度，以像素为单位。
        strokeOpacity: 0.8, // 边线透明度，取值范围0 - 1。
        fillOpacity: 0.6, // 填充的透明度，取值范围0 - 1。
        strokeStyle: 'dashed' // 边线的样式，solid或dashed。
      },
      hintMarker: null, // 吸附marker
      map: null,
      enabled: false, // 绘图状态
      polygon: null,
      points: [],
      snappable: false, // 鼠标吸附功能开关
      prohibitSelfIntersection: true, // 禁止自相交
      doesSelfIntersect: false, // 当前区域是否自交
    }
  },
  methods: {
    initialize() {
      this.map = new BMap.Map('mapContainer', {enableMapClick: false});
      this.map.centerAndZoom('北京', 11);
      this.map.enableScrollWheelZoom();
    },
    enable() {
      if (this.enabled) return;
      this.enabled = true;
      // 添加Marker光标
      const icon = new BMap.Icon(markerImg, new BMap.Size(8, 8)); // 点上的图标
      this.hintMarker = new BMap.Marker({}, {icon: icon, enableClicking: false});
      // 添加多边形覆盖物
      this.polygon = new BMap.Polygon({}, Object.assign({enableClicking: false}, this.stylePolygon));
      this.polygon.setStrokeWeight(2);
      this.map.addOverlay(this.hintMarker);
      this.map.addOverlay(this.polygon);
      this.map.setDefaultCursor('crosshair'); // 修改鼠标光标
      this.map.disableDoubleClickZoom(); // 关闭地图双击放大
      this.map.addEventListener('click', this.clickAction);
      this.map.addEventListener('dblclick', this.dblclickAction);
      this.map.addEventListener('mousemove', this.moveHintMarker);
    },
    disable() {

      if (!this.enabled) {
        return;
      }

      this.enabled = false;
      console.log(111111111111);
      this.points = [];
      this.map.removeOverlay(this.hintMarker);
      this.map.removeOverlay(this.polygon);
      this.hintMarker = null;
      this.polygon = null;
      this.map.enableDoubleClickZoom(); // 启用地图双击放大
      Snapping._cleanupSnapping(); // 清理吸附相关数据
      this.map.removeEventListener('click', this.clickAction);
      this.map.removeEventListener('dblclick', this.dblclickAction);
      this.map.removeEventListener('mousemove', this.moveHintMarker);
      this.map.setDefaultCursor("url('http://api0.map.bdimg.com/images/openhand.cur'), default");
    },
    // 切换绘图
    toggle() {
      if (this.enabled) {
        this.disable();
      } else {
        this.enable();
      }
    },
    _handleSelfIntersection() {
      if (this.points.length >= 3 && ClipperLib.op_Equality(this.points[this.points.length - 1], this.hintMarker.getPosition())) return;
      // 好的，我们需要检查这里的自相交。
      // 检查自相交
      this.doesSelfIntersect = ClipperLib.containKinks(GeoJSON.toGeoJSON(this.polygon.getPath()));

      // 修改自交样式
      if (this.doesSelfIntersect) {
        this.polygon.setStrokeColor('red')
      } else {
        this.polygon.setStrokeColor(this.stylePolygon.strokeColor)
      }
    },
    // 鼠标移动事件
    moveHintMarker(e) {
      this.hintMarker.setPosition(e.point);
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
    // 鼠标单击事件
    clickAction() {
      // 点数组长度大于 1 并且 点数组最后一个点坐标与当前点坐标相等
      // 防止创建相同点和自交点
      if (this.points.length > 1 && ClipperLib.op_Equality(this.points[this.points.length - 1], this.hintMarker.getPosition())) {
        return false;
      }
      this.points.push(this.hintMarker.getPosition());
      // 在当前位置拼接一个动态点，跟随鼠标移动
      var drawPoint = this.points.concat(this.points[this.points.length - 1]);
      this.polygon.setPath(drawPoint);
    },
    // 鼠标双击事件
    dblclickAction() {
      // 点数组长度 小于 3个坐标点 或 当前区域自交
      if (this.points.length < 3 || this.doesSelfIntersect) {
        return;
      }
      this.polygon.setPath(this.points);
      // this.polygon.setStrokeWeight(1);

      const results = Clipper.execute(this.polygon, this.map.getOverlays()); // 处理裁剪去重 (要裁剪的区域, 获取所有覆盖物)
      // console.log(results.state);
      if (results.state === 200) {
        var over = new BMap.Polygon(results.points, this.stylePolygon);
        this.map.addOverlay(over);
        // this.toggleEdit(over);
        this.disable(); // 关闭绘图
      } else {
        this.polygon.setStrokeColor('red');
        // this.$Modal.error({
        //   title: '提示框',
        //   content: results.describe
        // });
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

