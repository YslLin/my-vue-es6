/**
 * 使用缓冲区，去重，防止裁剪出现冗余点
 */
var map = new BMap.Map('mapContainer', {enableMapClick: false});
map.centerAndZoom('北京', 11);
map.enableScrollWheelZoom();
// map.disableDoubleClickZoom();
var isHuatu = false;
map.setMinZoom(0);
var _this = this;
var _stylePolygon = {
  strokeColor: '#ff8f3d', // 边线颜色。
  fillColor: '#45eb5d', // 填充颜色。当参数为空时，圆形将没有填充效果。
  strokeWeight: 1, // 边线的宽度，以像素为单位。
  strokeOpacity: 0.8, // 边线透明度，取值范围0 - 1。
  fillOpacity: 0.6, // 填充的透明度，取值范围0 - 1。
  strokeStyle: 'dashed' // 边线的样式，solid或dashed。
};
const ysl = {
  getZoom () {
    map.getZoom();
  },
  setZoom (zoom) {
    map.setZoom(zoom);
  },
  clearOverlays () {
    map.clearOverlays();
    var morenpolygon = new BMap.Polygon([
      new BMap.Point(116.237463, 40.005607),
      new BMap.Point(116.508823, 40.007376),
      new BMap.Point(116.389241, 39.783292)],
    _stylePolygon);
    map.addOverlay(morenpolygon);
  }
};

// 测试筛选是否成功过滤了其它覆盖物
// var marker = new BMap.Marker(new BMap.Point(116.404, 39.915)); // 创建点
// map.addOverlay(marker);            //增加点

// 定义一个控件类,即function
function Zoom11 () {
  // 默认停靠位置和偏移量
  this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
  this.defaultOffset = new BMap.Size(10, 40);
}

// 通过JavaScript的prototype属性继承于BMap.Control
Zoom11.prototype = new BMap.Control();

// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
Zoom11.prototype.initialize = function (map) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode('11级'));
  div.style.cursor = 'pointer';
  div.style.border = '1px solid gray';
  div.style.backgroundColor = 'white';
  div.onclick = () => {
    ysl.setZoom(11);
  };
  map.getContainer().appendChild(div);
  return div;
};
// 定义一个控件类,即function
function Zoom15 () {
  // 默认停靠位置和偏移量
  this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
  this.defaultOffset = new BMap.Size(60, 40);
}

// 通过JavaScript的prototype属性继承于BMap.Control
Zoom15.prototype = new BMap.Control();

// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
Zoom15.prototype.initialize = function (map) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode('15级'));
  div.style.cursor = 'pointer';
  div.style.border = '1px solid gray';
  div.style.backgroundColor = 'white';
  div.onclick = () => {
    ysl.setZoom(15);
  };
  map.getContainer().appendChild(div);
  return div;
};
// 定义一个控件类,即function
function ClearOverlays () {
  // 默认停靠位置和偏移量
  this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
  this.defaultOffset = new BMap.Size(10, 70);
}

// 通过JavaScript的prototype属性继承于BMap.Control
ClearOverlays.prototype = new BMap.Control();

// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
ClearOverlays.prototype.initialize = function (map) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode('清除覆盖物'));
  div.style.cursor = 'pointer';
  div.style.border = '1px solid gray';
  div.style.backgroundColor = 'white';
  div.onclick = () => {
    ysl.clearOverlays();
  };
  map.getContainer().appendChild(div);
  return div;
};
var myZoom11 = new Zoom11();
map.addControl(myZoom11);
var myZoom15 = new Zoom15();
map.addControl(myZoom15);
var myClearOverlays = new ClearOverlays();
map.addControl(myClearOverlays);
var topLeftNavigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT}); // 左上角，添加默认缩放平移控件
map.addControl(topLeftNavigation);

// 定义一个控件类，即function
function DrawControl () {
  // 设置默认停靠位置和偏移量
  this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
  this.defaultOffset = new BMap.Size(10, 10);
}

// 通过JavaScript 的prototype 属性继承于BMap.Control
DrawControl.prototype = new BMap.Control();

var polygon = null, // 多边形覆盖物
  points = [], // 临时点数组
  _hintMarker = null; // marker光标

var moveHintMarker = function (e) {
  _hintMarker.setPosition(e.point);
  polygon.setPositionAt(points.length, e.point);

  // if snapping is enabled, do it 如果启用了吸附，就执行它
  this.snappable = true; // 先默认开启
  if (this.snappable) {
    // 假拖动事件 = 鼠标移动事件 e
    const fakeDragEvent = e;
    fakeDragEvent.target = _hintMarker; // target 目标是 圆点提示光标
    Snapping._handleSnapping(fakeDragEvent, polygon); // 处理吸附函数
  }
};

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
  div.onclick = function (e) {
    if (isHuatu) return;
    isHuatu = true;
    // var div = document.createElement("div");
    // var size = map.getSize();
    // div.style.cssText = "position:absolute;background:url(about:blank);cursor:crosshair;width:" + size.width + "px;height:" + size.height + "px;";
    // div.style.top = (0 - map.offsetY) + 'px';
    // div.style.left = (0 - map.offsetX) + 'px';
    // map.getPanes().mapPane.appendChild(div); // 在html中添加div层
    // map.addOverlay(div);
    drawOverlay();
    // 添加Marker光标
    let icon = new BMap.Icon('../data/img/HT.png', new BMap.Size(8, 8));// 点上的图标
    _hintMarker = new BMap.Marker({}, {icon: icon, enableClicking: false});
    map.setDefaultCursor('crosshair');
    _this.map.addOverlay(_hintMarker);
    polygon = new BMap.Polygon({}, Object.assign({ enableClicking: false }, _stylePolygon));
    polygon.setStrokeWeight(2);
    map.addOverlay(polygon);
    map.addEventListener('mousemove', moveHintMarker);
  };
  // 添加DOM控件 元素到地图中
  map.getContainer().appendChild(div);
  // 将DOM 元素返回
  return div;
};
// 创建控件实例
var myDraw = new DrawControl();
// 添加到地图当中
map.addControl(myDraw);

function drawOverlay () {
  _this.pauseSelfIntersection = true;
  var moveAction = function (e) {
    // 设置临时点位置 鼠标跟随
    // polygon.setPositionAt(points.length, e.point);
    // marker.setPosition(e.point);
    // // console.log(map.pointToPixel(e.point));
    // map.getOverlays().filter(l => {
    //     if(l instanceof BMap.Polygon && l != polygon){
    //         // console.log(LineUtil._getDistanceToSegment(map, e.point, l.getPath()[0], l.getPath()[1]));
    //         // console.log(LineUtil._getClosestPointOnSegment(map, e.point, l.getPath()[0], l.getPath()[1]));
    //     }
    // })

    // if snapping is enabled, do it 如果启用了吸附，就执行它
    // this.snappable = true; // 先默认开启
    // if (this.snappable) {
    //     // 假拖动事件 = 鼠标移动事件 e
    //     const fakeDragEvent = e;
    //     fakeDragEvent.target = marker; // target 目标是 圆点提示光标
    //     Snapping._handleSnapping(fakeDragEvent, polygon); // 处理吸附函数
    // }

    // 暂停自交验证：单击事件触发的鼠标移动事件不执行自交验证，防止单击添加Marker后边框变红
    // if (!_this.pauseSelfIntersection) {
    //     _handleSelfIntersection();
    // }
    // else {
    //     _this.pauseSelfIntersection = false
    // }
  };

  // 移动中检查禁止自相交
  // var _handleSelfIntersection = function () {
  //   // 好的，我们需要检查这里的自相交。
  //   // check the self intersection 检查自相交
  //   const selfIntersection = turf.kinks(GeoJSON.toGeoJSON(polygon.getPath()));
  //   _this._doesSelfIntersect = selfIntersection.features.length > 0;
  //
  //   // change the style based on self intersection 修改自交样式
  //   if (_this._doesSelfIntersect) {
  //     polygon.setStrokeColor('red');
  //   } else {
  //     polygon.setStrokeColor(_this._stylePolygon.strokeColor);
  //   }
  // };
  var d = null;
  // 鼠标单击事件,时间差短为双击事件
  var eventDistribute = function (e) {
    // 暂停自交验证
    _this.pauseSelfIntersection = true;
    // 根据时间长短，判断单击 双击
    var now = new Date();
    if (now - d > 260) { // 单击
      d = now;
      clickAction(e);
    } else {
      dblclickAction();
    }
  };
  // 鼠标单击事件
  var clickAction = function (e) {
    // 点数组长度大于 1 并且 点数组最后一个点坐标与当前点坐标相等 或者 当前点为自交点
    // 防止创建相同点和自交点
    if (points.length > 1 && (ClipperLib.op_Equality(points[points.length - 1], e.point) || _this._doesSelfIntersect)) {
      return false;
    }
    points.push(_hintMarker.getPosition());
    // 在当前位置拼接一个动态点，跟随鼠标移动
    var drawPoint = points.concat(points[points.length - 1]);
    // if (points.length == 1) {
    //
    //     map.addEventListener('mousemove', moveAction);
    // } else {
    polygon.setPath(drawPoint);
    // }
  };

  // 鼠标双击事件
  function dblclickAction () {
    // 自我相交 或者 点数组长度 小于 3个坐标点
    if (_this._doesSelfIntersect || points.length < 3) {
      return;
    }
    polygon.setPath(points);
    points = [];
    var _polygon = polygon;
    _polygon.setStrokeWeight(1);

    polygon = null;
    isHuatu = false;
    map.removeOverlay(_hintMarker);
    Snapping._cleanupSnapping(); // 清理吸附相关数据
    map.removeEventListener('click', eventDistribute);
    map.removeEventListener('mousemove', moveAction);
    map.removeEventListener('mousemove', moveHintMarker);
    map.setDefaultCursor("url('http://api0.map.bdimg.com/images/openhand.cur'), default");

    /// /////////////////////计算包含区域/////////////////////////////////
    var geo = GeoJSON.toGeoJSON(erasingRedundantPoints(_polygon).getPath());
    if (containKinks(geo)) {
      console.error('裁剪区域包含自交点');
      _polygon.setStrokeColor('red');
      return;
    }
    // 找到所有与之相交的多边形覆盖物
    var layers = map.getOverlays() // 获取所有覆盖物
    // 覆盖物是可见的
      .filter(l => l.isVisible())
      // 覆盖物是多边形
      .filter(l => l instanceof BMap.Polygon)
      // 排除自身
      .filter(l => l !== _polygon)
      .filter(l => !containKinks(GeoJSON.toGeoJSON(l.getPath())))
      // 与之相交的
      .filter((l) => {
        try {
          return !!turf.intersect(geo, GeoJSON.toGeoJSON(l.getPath()));
        } catch (e) {
          console.log(e);
          console.log(l.getPath());
          l.setStrokeColor('red');
          l.setStrokeWeight(2);
          l.enableEditing();
          l.getPath().filter((err) => {
            var marker1 = new BMap.Marker(new BMap.Point(err.lng, err.lat)); // 创建点
            marker1.addEventListener('click', function () {
              console.log(marker1.pint);
            });
            map.addOverlay(marker1);
          });
          console.error('不能用自交点切割多边形');
          return false;
        }
      });
    _this._solution = _polygon;
    layers.forEach((l) => {
      // 裁剪参照物添加缓冲区
      var buffered = turf.buffer(GeoJSON.toGeoJSON(l.getPath()), 1, {units: 'millimeters'});
      // find layer difference 发现不同层
      const diff = turf.difference(GeoJSON.toGeoJSON(_this._solution.getPath()), buffered);
      // 裁剪区域被完全覆盖的情况下，返回null
      if (!diff) {
        return console.error('裁剪区域被其它区域完全覆盖');
      }
      // if result is a multipolygon, split it into regular polygons
      // 如果结果是一个多多边形，将它分割成规则的多边形
      console.log('diff.geometry.type:', diff.geometry.type);
      if (diff.geometry.type === 'MultiPolygon') {
        const geoJSONs = diff.geometry.coordinates.reduce((arr, coords) => {
          arr.push({type: 'Polygon', coordinates: coords});
          return arr;
        }, []);

        // 只取多多边形数组中的第一个多边形
        _this._solution = GeoJSON.toPolygon(geoJSONs[0].coordinates[0]);
      } else {
        if (diff.geometry.coordinates.length > 1) {
          console.error('裁剪区域完全覆盖其它区域');
        }
        _this._solution = GeoJSON.toPolygon(diff.geometry.coordinates[0]);
      }
    });
    _this.map.removeOverlay(_polygon);
    console.log(_this._solution.getPath());
    _this.map.addOverlay(erasingRedundantPoints(_this._solution));
  }

  map.addEventListener('click', eventDistribute);
}

/// /////////////////计算重叠层工具//////////////////////////

const GeoJSON = {
  // 转多边形
  toPolygon: function (coordinates) {
    let points = [];
    // diff.geometry.coordinates[0].forEach((arr) => {
    coordinates.forEach((arr) => {
      points.push(new BMap.Point(arr[0], arr[1]));
    });
    return new BMap.Polygon(points.slice(0, points.length - 1));
  },
  // 转GeoJSON对象
  toGeoJSON: function (_latlngs) {
    var coords = GeoJSON.latLngsToCoords(_latlngs, 0, true);
    coords = [coords];

    return GeoJSON.getFeature(this, {
      type: 'Polygon',
      coordinates: coords
    });
  },
  // 经纬度转坐标, lat lng 转 GeoJSON
  latLngsToCoords: function (latlngs, levelsDeep, closed) {
    var coords = [];

    for (var i = 0, len = latlngs.length; i < len; i++) {
      coords.push(levelsDeep
        ? GeoJSON.latLngsToCoords(latlngs[i], levelsDeep - 1, closed)
        : GeoJSON.latLngToCoords(latlngs[i]));
    }

    if (!levelsDeep && closed) {
      coords.push(coords[0]);
    }

    return coords;
  },
  latLngToCoords: function (latlng) {
    return [latlng.lng, latlng.lat];
  },
  getFeature: function (layer, newGeometry) {
    if (!layer.feature) return GeoJSON.asFeature(newGeometry);
  },
  asFeature: function (geojson) {
    if (geojson.type === 'Feature') {
      return geojson;
    }
    return {
      type: 'Feature',
      properties: {},
      geometry: geojson
    };
  }
};

// 包含自交点
const containKinks = function (poly) {
  const kinks = turf.kinks(poly); // 返回所有自交点位置
  return kinks.features.length > 0; // 自交点大于0 则是错误图形
};
const ClipperLib = {};
// 坐标点平等
ClipperLib.op_Equality = function (a, b) {
  // return a == b;
  return a.lng === b.lng && a.lat === b.lat;
};
// 坐标点不平等
ClipperLib.op_Inequality = function (a, b) {
  // return a != b;
  return a.lng !== b.lng || a.lat !== b.lat;
};
/**
 * 坐标后七位转整数
 * 四舍五入后的整数
 */
const sevenDecimalTointegers = function (x) {
  var fX = parseFloat(x);
  if (isNaN(fX)) {
    return false;
  }
  fX = Math.round(fX * 10000000);
  return fX;
};
/**
 * 相似坐标点
 * 坐标差异在±2之间即相似
 */
const sevenDecimalResemble = function (a, b) {
  const alng = sevenDecimalTointegers(a.lng);
  const alat = sevenDecimalTointegers(a.lat);
  const blng = sevenDecimalTointegers(b.lng);
  const blat = sevenDecimalTointegers(b.lat);
  return Math.abs(alng - blng) <= 2 && Math.abs(alat - blat) <= 2;
};

/**
 * 擦除冗余点
 * @param poly 裁剪后的区域
 */
const erasingRedundantPoints = function (poly) {
  let a = poly.getPath();
  let b = [a[0]];
  for (let i = 1; i < a.length; i++) {
    if (!sevenDecimalResemble(a[i - 1], a[i])) {
      b.push(a[i]);
    }
  }
  return new BMap.Polygon(b, _this._stylePolygon);
};

const LineUtil = {
  // 返回两点之间的像素距离
  _getDistance (map, latlngA, latlngB) {
    var A = map.pointToPixel(latlngA);
    var B = map.pointToPixel(latlngB);
    var x = A.x - B.x,
      y = A.y - B.y;

    return Math.sqrt(x * x + y * y);
  },
  // 得到点到段的距离
  _getDistanceToSegment (map, latlng, latlngA, latlngB) {
    const P = map.pointToPixel(latlng); // 经纬度坐标转换为像素坐标
    const A = map.pointToPixel(latlngA);
    const B = map.pointToPixel(latlngB);

    return this.pointToSegmentDistance(P, A, B); // 点到段距离 // 返回点“p”到“A”和“B”段之间的距离
  },
  // @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
  // 返回点“p”到“A”和“B”段之间的距离
  pointToSegmentDistance: function (p, p1, p2) {
    return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
  },
  // 得到点到段上最近的点
  _getClosestPointOnSegment (map, latlng, latlngA, latlngB) {
    const P = map.pointToPixel(latlng); // 经纬度坐标转换为像素坐标
    const A = map.pointToPixel(latlngA);
    const B = map.pointToPixel(latlngB);
    const closest = this.closestPointOnSegment(P, A, B); // 点到段上最近的点 // 返回从点'p'到'p1'和'p2'段上的最近点
    return map.pixelToPoint(closest);
  },
  // @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
  // 返回从点'p'到'p1'和'p2'段上的最近点
  closestPointOnSegment: function (p, p1, p2) {
    return this._sqClosestPointOnSegment(p, p1, p2);
  },
  // 返回在该点上的最接近点或距离
  _sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
    var x = p1.x,
      y = p1.y,
      dx = p2.x - x,
      dy = p2.y - y,
      dot = dx * dx + dy * dy,
      t;

    if (dot > 0) {
      t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

      if (t > 1) {
        x = p2.x;
        y = p2.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p.x - x;
    dy = p.y - y;

    // console.log(sqDist ? dx * dx + dy * dy : new BMap.Pixel(x, y));
    return sqDist ? dx * dx + dy * dy : new BMap.Pixel(x, y);
  }
};

const Snapping = {
  /**
   * 处理吸附
   * @param e
   * @param _polygon
   * @returns {boolean}
   * @private
   */
  _handleSnapping (e, _polygon) {
    // 按住Alt键 移动marker则暂停吸附效果
    if (e.altKey) {
      return false;
    }

    // 创建一个标记可以吸附到的多边形列表。
    if (this._snapList === undefined) {
      // _snapList 将所有符合条件的层添加到吸附集合中
      Snapping._createSnapList(e, _polygon);
      console.log(this._snapList);
    }

    // 如果没有层来捕捉，停在这里
    if (this._snapList.length <= 0) {
      return false;
    }

    const marker = e.target;

    // 得到最近的层，它是最接近latlng的段与距离。
    const closestLayer = Snapping._calcClosestLayer(marker.getPosition(), this._snapList);

    const isMarker = closestLayer.layer instanceof BMap.Marker;

    // 找到我们想抢占的最后一个
    let snapLatLng = closestLayer.latlng;

    // 标记捕捉前的最小距离（以像素为单位）
    this.snapDistance = 30;
    const minDistance = this.snapDistance;
    if (!isMarker) {
      snapLatLng = this._checkPrioritiySnapping(closestLayer);
    } else {
      snapLatLng = closestLayer.latlng;
    }

    // 事件信息PM：捕捉和PM：解扣
    const eventInfo = {
      marker,
      snapLatLng,
      segment: closestLayer.segment,
      layer: _polygon,
      layerInteractedWith: closestLayer.layer // 因为缺少更好的属性名。
    };

    if (closestLayer.distance < minDistance) {
      // 吸附这个marker
      marker.setPosition(snapLatLng);
      _polygon.setPositionAt(points.length, snapLatLng);

      marker._snapped = true;

      const triggerSnap = () => {
        this._snapLatLng = snapLatLng;
        // marker.fire('pm:snap', eventInfo);
        // this._layer.fire('pm:snap', eventInfo);
      };

      // 检查吸附位置是否与最后一个吸附不同。
      const a = this._snapLatLng || {};
      const b = snapLatLng || {};

      if (a.lat !== b.lat || a.lng !== b.lng) {
        triggerSnap(); // 触发吸附
      }
    } else if (this._snapLatLng) {
      // 不再吸附

      // 如果以前被吸附...解扣
      this._unsnap(eventInfo);

      marker._snapped = false;

      // 并且交火解扣事件
      // eventInfo.marker.fire('pm:unsnap', eventInfo);
      // this._layer.fire('pm:unsnap', eventInfo);
    }

    return true;
  },
  // 计算最近的层
  _calcClosestLayer (latlng, layers) {
    // 最接近我们拖曳标记的多边形
    let closestLayer = {};

    // 通过层循环
    layers.forEach((layer, index) => {
      // 找到最接近的latlng、段和该层到拖动标记latlng的距离。
      const results = Snapping._calcLayerDistances(latlng, layer); // 计算层距离

      // 显示指示线，用于调试。
      this.debugIndicatorLines[index].setPath([latlng, results.latlng]);

      // 如果信息不存在，或者距离小于前一个，则保存该信息。
      if (closestLayer.distance === undefined || results.distance < closestLayer.distance) {
        closestLayer = results;
        closestLayer.layer = layer;
      }
    });

    // 返回最近的层和它的数据
    // 如果没有最接近的层，则返回未定义的
    return closestLayer;
  },
  // 计算与层的距离
  _calcLayerDistances (latlng, layer) {
    // 这是折线、标记还是多边形?
    const isPolygon = layer instanceof BMap.Polygon;
    // 目前没有吸附折线与marker覆盖物的需求 先保留
    // const isPolyline = !(layer instanceof L.Polygon) && layer instanceof L.Polyline;
    // const isMarker = layer instanceof L.Marker || layer instanceof L.CircleMarker;

    // 我们想要捕捉的点P(被拖动的标记)
    const P = latlng;

    let coords;

    // 该层的坐标集合
    if (isPolygon) {
      // polygon
      coords = layer.getPath();
    }
    // else if (isPolyline) {
    //     // polyline
    //     coords = layer.getLatLngs();
    // } else if (isMarker) {
    //     // marker
    //     coords = layer.getLatLng();
    //
    //     // return the info for the marker, no more calculations needed
    //     // 返回标记的信息，不再需要计算
    //     return {
    //         latlng: Object.assign({}, coords),
    //         distance: this._getDistance(map, coords, P),
    //     };
    // }

    // 层的最近段（两点之间的线）
    let closestSegment;

    // 从P到段落的最短距离
    let shortestDistance;

    // 循环遍历层的坐标
    coords.forEach((coord, index) => {
      // 把这个coord(A)
      const A = coord;
      let nextIndex;

      // 下一个coord 为点 (B)
      if (isPolygon) {
        nextIndex = index + 1 === coords.length ? 0 : index + 1;
      } else {
        nextIndex = index + 1 === coords.length ? undefined : index + 1;
      }

      const B = coords[nextIndex];

      if (B) {
        // P和ab段之间的距离
        const distance = LineUtil._getDistanceToSegment(map, P, A, B);

        // 距离比上一个短吗?保存它和段
        if (shortestDistance === undefined || distance < shortestDistance) {
          shortestDistance = distance;
          closestSegment = [A, B];
        }
      }
    });

    // 现在，取最接近段其上的最近点与p点对齐。
    const C = LineUtil._getClosestPointOnSegment(map, latlng, closestSegment[0], closestSegment[1]);

    // 返回最近段落、最近点和与其距离。
    return {
      latlng: C,
      segment: closestSegment,
      distance: shortestDistance
    };
  },

  // 我们得到了我们想要对齐到(C)的点，但是我们需要检查一个多边形的coord。
  // 以C的优先级作为起始点。让我们在这里检查
  _checkPrioritiySnapping (closestLayer) {
    // A和B是与P最接近的部分的点(我们想要捕捉的标记位置)
    const A = closestLayer.segment[0];
    const B = closestLayer.segment[1];

    // C是我们在线段上吸附的点。
    // 距离最近的多边形的最近部分的最近点，这是对的。
    const C = closestLayer.latlng;

    // 从A到C和B到C的距离，来检查哪个离C更近。
    const distanceAC = LineUtil._getDistance(map, A, C);
    const distanceBC = LineUtil._getDistance(map, B, C);
    // console.log(distanceAC);
    // console.log(distanceBC);

    // 最近顶点坐标
    const closestVertexLatLng = distanceAC < distanceBC ? A : B;

    // 顶点坐标与C之间的最短距离。
    const shortestDistance = distanceAC < distanceBC ? distanceAC : distanceBC;

    // 需要被削弱以触发优先级的距离
    const priorityDistance = this.snapDistance;

    // 需要削弱的距离以触发优先权。
    let snapLatlng;

    // 如果C更接近于近距离(A或B)而不是snapDistance，
    // 最接近于C的关闭点是最重要的。
    if (shortestDistance < priorityDistance) {
      snapLatlng = closestVertexLatLng;
    } else {
      snapLatlng = C;
    }

    // 返回捕捉点
    return snapLatlng;
  },
  /**
   * 创建吸附集合
   * @param _polygon
   * @private
   */
  _createSnapList (_polygon) {
    let layers = [];
    const debugIndicatorLines = [];

    // 多边形编辑的临时标记
    map.getOverlays().forEach((layer) => {
      // 覆盖物是可见的 // 覆盖物是多边形
      if (layer.isVisible() && layer instanceof BMap.Polygon && layer.getPath().length > 0) {
        layers.push(layer);

        // 这是为了调试
        const debugLine = new BMap.Polyline([], {strokeColor: 'red', strokeWeight: 2, strokeOpacity: 0.5, enableClicking: false});
        debugIndicatorLines.push(debugLine);

        // 取消此行 👇 注释以显示辅助线进行调试
        map.addOverlay(debugLine);
      }
    });

    // 保存到吸附集合中_snapList
    this._snapList = layers;
    this.debugIndicatorLines = debugIndicatorLines;
  },
  /**
   * 清理吸附功能相关数据
   * @private
   */
  _cleanupSnapping () {
    delete this._snapList;

    if (this.debugIndicatorLines) {
      this.debugIndicatorLines.forEach((line) => {
        map.removeOverlay(line);
      });
    }
  },
  /**
   * 解扣
   * @private
   */
  _unsnap () {
    // delete the last snap
    delete this._snapLatLng;
  }
};
