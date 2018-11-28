/**
 * @fileOverview 百度地图的字体图标功能
 *
 * @author YSL
 * @version 1.0.0
 *
 * @namespace BMap的所有library类均放在BMapLib命名空间下
 */

// 单位类型集合
const unitTypeList = [
  {
    id: '1',
    docname: '代理点',
    pkDefdoc: 'BOSCORP00000000A0001',
    iconId: '',
    iconName: '',
    iconUri: '#fd-icon-2fengongsi',
  }, {
    id: '8',
    docname: '集团',
    pkDefdoc: 'BOSCORP00000000A0008',
    iconId: '',
    iconName: '',
    iconUri: '#fd-icon-dizhi1',
  }, {
    id: '5',
    docname: '分拨中心',
    pkDefdoc: 'BOSCORP00000000A0005',
    iconId: '',
    iconName: '',
    iconUri: '#fd-icon-dizhi2',
  },
];

// 可显示的单位类型集合
let validUnitTypes = ['1', '8'];

let unit_point_array = {};

const MapYSL = window.MapYSL = MapYSL || {};

// 自定义覆盖物的构造函数
const IconOverlay = MapYSL.IconOverlay = function (point, typeCode) {
  this._point = point;
  this._type = unitTypeList.find(t => t.pkDefdoc === typeCode) || {};
};

// 继承API的抽象基类BMap.Overlay
IconOverlay.prototype = new BMap.Overlay();

// 实现初始化方法
IconOverlay.prototype.initialize = function (map) {
  this._map = map;

  let div = this._div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.cursor = 'pointer';
  div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);

  let svg = this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'icon-overlay');
  // svg.style.pointerEvents = 'none'; // css穿透 地图中心点偏移到左上角（0，0）解决方法（鼠标悬浮在图标上，滚轮放大、缩小地图会往左上角、右下角偏移）

  let use = this._use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this._type.iconUri || '#dzfd-icon-houzi');

  svg.appendChild(use);
  div.appendChild(svg);

  map.getPanes().markerPane.appendChild(div);

  // 计算中心点
  let rect = this._svg.getBoundingClientRect();
  use.style.top = rect.height / 2 + 'px';
  use.style.left = rect.width / 2 + 'px';

  // 开启拖动监听
  this._dragMonitor();

  return div;
};

// 实现绘制方法
IconOverlay.prototype.draw = function () {
  const map = this._map;
  let pixel = map.pointToOverlayPixel(this._point);
  this._div.style.top = pixel.y + 10 - parseInt(this._use.style.top) + 'px';
  this._div.style.left = pixel.x + 1 - parseInt(this._use.style.left) + 'px';

  this.whetherVisible();
};

// 实现是否显示方法
// IconOverlay.prototype.isVisible = function () {
//     console.log(this._div.style.display);
//     if (this._div && !this._div.style.display) {
//         return true;
//     } else {
//         return false;
//     }
// }

// 获取类型编码
IconOverlay.prototype.getTypeCode = function () {
  return this._type.pkDefdoc;
};

// 判断是否可见
IconOverlay.prototype.whetherVisible = function () {
  // 可见类型列表 为空 则全部显示
  // 可见类型列表内不包含当前单位类型则隐藏当前单位标记
  if (validUnitTypes.length === 0 || validUnitTypes.indexOf(this.getTypeCode()) > -1) {
    this.show();
  } else {
    this.hide();
  }
};


// 自定义覆盖物添加事件方法
IconOverlay.prototype.addEventListener = function (event, fun) {
  if (event === 'click') {
    this._div.addEventListener(event, () => {
      if (this._allowClick) fun()
    });
  } else {
    this._div.addEventListener(event, fun);
  }
};

// 返回标注的地理坐标
IconOverlay.prototype.getPosition = function () {
  return this._point;
};

// 打开信息窗口
IconOverlay.prototype.openInfoWindow = function (infoWindow) {
  const map = this._map;
  let point = this._point;
  infoWindow.overlay = this; // 信息窗口对应的覆盖物
  infoWindow.disableAutoPan(); // 关闭自动平移
  infoWindow.disableCloseOnClick(); // 关闭点击地图时关闭信息窗口
  map.openInfoWindow(infoWindow, point); // 打开信息窗口
  map.setCenter(point); // 设置地图中心点
};

// 开启拖拽功能
IconOverlay.prototype.enableDragging = function () {
  const map = this._map;
  let point = this._point;
  let div = this._div;
  let use = this._use;
  console.log('开始拖拽事件');

  function down(e) {

    map.disableDragging();

    console.log('添加拖拽事件');

    function move(ev) {
      point = ev.point;
      // _this.draw();
      let pixel = map.pointToOverlayPixel(point);
      div.style.top = pixel.y + 10 - parseInt(use.style.top) + 'px';
      div.style.left = pixel.x + 1 - parseInt(use.style.left) + 'px';
    }

    function up(ev) {

      console.log('移除拖拽事件');
      map.removeEventListener('mousemove', move);
      div.removeEventListener('mouseup', up);

      map.enableDragging();
      ev.stopPropagation();
      return false;
    }

    map.addEventListener('mousemove', move);
    div.addEventListener('mouseup', up);

  }

  div.addEventListener('mousedown', down);

};

// 拖动监听 位置按下鼠标与松开鼠标位置相同 则允许触发单击 _allowClick = true
IconOverlay.prototype._dragMonitor = function () {
  let div = this._div;
  let beginX, // 起始位置
    beginY,
    endX,   // 结束位置
    endY;

  div.addEventListener('mousedown', (e) => {
    beginX = e.clientX;
    beginY = e.clientY;
  }, false);

  div.addEventListener('mouseup', (e) => {
    endX = e.clientX;
    endY = e.clientY;
    this._allowClick = !isDrag(beginX, beginY, endX, endY);
  }, false);
};

// 判断是否拖动了 拖动 return true
function isDrag(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) > 1;
}

export function filterShowIconOverlay(unit_point_array, validTypes) {
  validUnitTypes = validTypes;
  for (let key in unit_point_array) {
    if (!unit_point_array.hasOwnProperty(key)) continue;

    for (let key2 in unit_point_array[key]) {
      if (!unit_point_array[key].hasOwnProperty(key2)) continue;

      if (unit_point_array.hasOwnProperty(key2)) {
        let unitOverlay = unit_point_array[key][key2]['unitOverlay'] || {};
        unitOverlay.whetherVisible();
      }
    }
  }
}

export function selectUnitTypeList() {
  return new Promise((resolve, reject) => {
    // this.$axios({
    //   method: 'post',
    //   url: api.unitPoint.selectUnitTypeIcon,
    //   data: {}
    // }).then(response => {
    //   if (response.data.code === 200) {
    //     unitTypeList = response.data.data;
    //     resolve(unitTypeList);
    //   }
      reject();
    // }).catch(error => {
    //   console.error('IconOverlay.js--selectUnitType方法异常', error);
    //   reject();
    // })
  })
}

export function initIcon(mp) {

  let iconOverlay = new MapYSL.IconOverlay(new BMap.Point(116.407845, 39.914101), 'BOSCORP00000000A0001');
  mp.addOverlay(iconOverlay);
  unit_point_array['1'] = {unitPoint: iconOverlay};

  let iconOverlay2 = new MapYSL.IconOverlay(new BMap.Point(116.407845, 39.924101), 'BOSCORP00000000A0008');
  mp.addOverlay(iconOverlay2);
  unit_point_array['2'] = {unitPoint: iconOverlay2};

  let iconOverlay3 = new MapYSL.IconOverlay(new BMap.Point(116.407845, 39.934101), 'BOSCORP00000000A0005');
  mp.addOverlay(iconOverlay3);
  unit_point_array[3] = {unitPoint: iconOverlay3};

}

// setTimeout(function () {
//   filterShowIconOverlay();
// }, 3000);
