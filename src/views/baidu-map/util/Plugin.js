// import turf from 'turf'

//////////////////// GeoJSON对象转换工具 //////////////////////////

export const GeoJSON = {
  /**
   * 转多边形
   * @param coordinates
   * @returns {BMap.Polygon}
   */
  toPolygon: function (coordinates) {
    let points = [];
    coordinates.forEach((arr) => {
      points.push(new BMap.Point(arr[0], arr[1]));
    });
    return new BMap.Polygon(points.slice(0, points.length - 1));
  },
  /**
   * 转GeoJSON对象
   * @param _latlngs
   * @returns {*}
   */
  toGeoJSON: function (_latlngs) {
    var coords = this._latLngsToCoords(_latlngs, 0, true);
    coords = [coords];

    return this._getFeature(this, {
      type: 'Polygon',
      coordinates: coords
    });
  },
  /**
   * 经纬度转坐标, lat lng 转 GeoJSON
   * @param latlngs
   * @param levelsDeep
   * @param closed
   * @returns {Array}
   */
  _latLngsToCoords: function (latlngs, levelsDeep, closed) {
    var coords = [];

    for (var i = 0, len = latlngs.length; i < len; i++) {
      coords.push(levelsDeep
        ? this._latLngsToCoords(latlngs[i], levelsDeep - 1, closed)
        : this._latLngToCoords(latlngs[i]));
    }

    if (!levelsDeep && closed) {
      coords.push(coords[0]);
    }

    return coords;
  },
  _latLngToCoords: function (latlng) {
    return [latlng.lng, latlng.lat];
  },
  _getFeature: function (layer, newGeometry) {
    if (!layer.feature) return this._asFeature(newGeometry);
  },
  _asFeature: function (geojson) {
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

///////////////// 裁剪工具 /////////////////

export const ClipperLib = {
  /**
   * 包含自交点
   * @param poly
   * @returns {boolean}
   */
  containKinks(poly) {
    const kinks = turf.kinks(poly); // 返回所有自交点位置
    return kinks.features.length > 0; // 自交点大于0 则是错误图形
  },
  /**
   * 坐标点相等
   * @param a
   * @param b
   * @returns {boolean}
   */
  op_Equality(a, b) {
    // return a == b;
    return a.lng === b.lng && a.lat === b.lat;
  },
  /**
   * 坐标点不等
   * @param a
   * @param b
   * @returns {boolean}
   */
  op_Inequality(a, b) {
    // return a != b;
    return a.lng !== b.lng || a.lat !== b.lat;
  },
  /**
   * 坐标后七位转整数
   * 四舍五入后的整数
   * @param x
   * @returns {Number}
   * @private
   */
  _sevenDecimalTointegers(x) {
    var fX = parseFloat(x);
    if (isNaN(fX)) {
      return false;
    }
    fX = Math.round(fX * 10000000);
    return fX;
  },
  /**
   * 相似坐标点
   * 坐标差异在±2之间即相似
   * @param a
   * @param b
   * @returns {boolean}
   * @private
   */
  _sevenDecimalResemble(a, b) {
    const alng = this._sevenDecimalTointegers(a.lng);
    const alat = this._sevenDecimalTointegers(a.lat);
    const blng = this._sevenDecimalTointegers(b.lng);
    const blat = this._sevenDecimalTointegers(b.lat);
    return Math.abs(alng - blng) <= 90 && Math.abs(alat - blat) <= 90;
  },
  /**
   * 擦除冗余点
   * @param poly 裁剪后的区域
   * @returns {Array}
   */
  erasingPoints(poly) {
    let a = poly;
    let b = [a[0]];
    for (let i = 1; i < a.length; i++) {
      if (!this._sevenDecimalResemble(a[i - 1], a[i])) {
        b.push(a[i]);
      }
    }
    return b
  }
};

//////////////////////// 裁剪去重 /////////////////////////////////
// function ClipperError(message, type) {
//   this.name = 'ClipperError';
//   this.type = type || -1;
//   this.message = message || '自动去重失败';
//   this.stack = (new Error()).stack;
// }
//
// ClipperError.prototype = Object.create(Error.prototype);
// ClipperError.prototype.constructor = ClipperError;

class ClipperError extends Error {
  constructor(message, type) {
    super(message);
    this.name = 'ClipperError';
    this.type = type || -1;
    this.message = message || '自动去重失败';
    // this.stack = (new Error()).stack;
  }
}

export const Clipper = {
  /**
   * 执行去重
   * @param _polygon 去重区域
   * @param _layers 覆盖物数组
   * @returns {*|Array}
   */
  execute(_polygon, _layers) {
    var polygonGeo = GeoJSON.toGeoJSON(_polygon.getPath());
    if (ClipperLib.containKinks(polygonGeo)) {
      throw new ClipperError('不能交叉画图', 1001);
    }

    let area = turf.area(polygonGeo);
    if (area < 100) {
      console.log(area);
      throw new ClipperError('区域面积不能小于两千平方米', 1005);
    }

    // 验证角度
    this._validAngle(_polygon);

    // 找到所有与之相交的多边形覆盖物
    _layers = _layers
    // 覆盖物是可见的
      .filter(l => l.isVisible())
      // 覆盖物是多边形
      .filter(l => l instanceof BMap.Polygon)
      // 覆盖物非当前区域
      .filter(l => l !== _polygon)
      // 覆盖物非自相交
      .filter(l => !ClipperLib.containKinks(GeoJSON.toGeoJSON(l.getPath())))
      // 与之相交的
      .filter((l) => {
        try {
          var buffered = turf.buffer(GeoJSON.toGeoJSON(l.getPath()), -1, {units: 'meters'});
          return !!turf.intersect(buffered, polygonGeo) || turf.booleanOverlap(buffered, polygonGeo);
        } catch (e) {
          console.error(e);
          return false;
        }
      });
    var points = this._cutting(_layers, _polygon);
    return ClipperLib.erasingPoints(points.getPath());
  },
  /**
   * 裁剪
   * @param _layers 重叠多边形数组
   * @param _polygon 裁剪区域
   * @param frequency 递归次数
   * @returns {*} 裁剪后的多边形区域
   * @private
   */
  _cutting(_layers, _polygon, frequency = 5) {
    this._solution = _polygon;
    _layers.forEach((l) => {
      // 裁剪参照物添加缓冲区 1毫米
      var buffered = turf.buffer(GeoJSON.toGeoJSON(l.getPath()), 0.001, {units: 'meters'});
      // var buffered = turf.buffer(GeoJSON.toGeoJSON(l.getPath()), 0.001, 'meters');
      let diff = null;
      try {
        // 发现不同层
        diff = turf.difference(GeoJSON.toGeoJSON(this._solution.getPath()), buffered);
      } catch (e) {
        console.error(e);
      }
      // 裁剪区域被完全覆盖的情况下，返回null
      if (!diff) {
        /** return console.error('裁剪区域被其它区域完全覆盖');*/
        throw new ClipperError('所画区域在原有区域内，完全重合，请重新画图', 1002);
      }
      // 如果结果是多多边形，将它分割成规则的多边形
      if (diff.geometry.type === 'MultiPolygon') {
        const geoJSONs = diff.geometry.coordinates.reduce((arr, coords) => {
          arr.push({type: 'Polygon', coordinates: coords});
          return arr;
        }, []);

        // 只取多多边形数组中的第一个多边形
        this._solution = GeoJSON.toPolygon(geoJSONs[0].coordinates[0]);
      } else {
        if (diff.geometry.coordinates.length > 1) {
          /** console.error('裁剪区域完全覆盖其它区域');*/
          throw new ClipperError('将原有区域完全覆盖，请重新画图', 1003);
        }
        this._solution = GeoJSON.toPolygon(diff.geometry.coordinates[0]);
      }
    });
    return this._solution;
    // if ((states.indexOf(1003) > -1 || states.indexOf(1002) > -1) && frequency > 0) {
    //   frequency--;
    //   states = this._cutting(_layers,frequency);
    // }
  },
  _validAngle(_polygon){
      let ps = _polygon.getPath();
      let front_angle = null;
      ps.forEach((p, i) => {
        var point1 = turf.point([p.lng, p.lat]);
        var n = i + 1 == ps.length ? 0 : i + 1;
        var point2 = turf.point([ps[n].lng, ps[n].lat]);

        var behind_angle = turf.rhumbBearing(point1, point2);
        if (front_angle === null) {
          point2 = turf.point([ps[ps.length - 1].lng, ps[ps.length - 1].lat]);

          front_angle = turf.rhumbBearing(point2, point1);
        }

        if ((front_angle <= 0 && behind_angle >= 0) || (front_angle >= 0 && behind_angle <= 0)) {
          var knot_angle = Math.abs(180 - (Math.abs(front_angle) + Math.abs(behind_angle)));
          if (knot_angle <= 4) {
            console.log('∠', knot_angle);
            throw new ClipperError('图形角度过小', 1004);
          }
        }

        front_angle = behind_angle;
      });

      return true;
  }
};

////////////////////////////// 吸附工具 /////////////////////////////////////
const LineUtil = {
  /**
   * 返回点“p”到“A”和“B”段之间的距离
   * @param p
   * @param p1
   * @param p2
   * @returns {Number}
   */
  pointToSegmentDistance: function (p, p1, p2) {
    return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
  },
  /**
   * 返回从点'p'到'p1'和'p2'段上的最近点
   * @param p
   * @param p1
   * @param p2
   * @returns {*}
   */
  closestPointOnSegment: function (p, p1, p2) {
    return this._sqClosestPointOnSegment(p, p1, p2);
  },
  /**
   * 返回两点之间的像素距离
   * @param map
   * @param latlngA
   * @param latlngB
   * @returns {number}
   * @private
   */
  _getDistance(map, latlngA, latlngB) {
    var A = map.pointToPixel(latlngA);
    var B = map.pointToPixel(latlngB);
    var x = A.x - B.x,
      y = A.y - B.y;

    return Math.sqrt(x * x + y * y);
  },
  /**
   * 得到点到段的距离
   * @param map
   * @param latlng
   * @param latlngA
   * @param latlngB
   * @returns {*|Number}
   * @private
   */
  _getDistanceToSegment(map, latlng, latlngA, latlngB) {
    const P = map.pointToPixel(latlng); // 经纬度坐标转换为像素坐标
    const A = map.pointToPixel(latlngA);
    const B = map.pointToPixel(latlngB);

    return this.pointToSegmentDistance(P, A, B); // 点到段距离 // 返回点“p”到“A”和“B”段之间的距离
  },
  /**
   * 得到点到段上最近的点
   * @param map
   * @param latlng
   * @param latlngA
   * @param latlngB
   * @returns {*}
   * @private
   */
  _getClosestPointOnSegment(map, latlng, latlngA, latlngB) {
    const P = map.pointToPixel(latlng); // 经纬度坐标转换为像素坐标
    const A = map.pointToPixel(latlngA);
    const B = map.pointToPixel(latlngB);
    const closest = this.closestPointOnSegment(P, A, B); // 点到段上最近的点 // 返回从点'p'到'p1'和'p2'段上的最近点
    return map.pixelToPoint(closest);
  },
  /**
   * 返回在该点上的最接近点或距离
   * @param p
   * @param p1
   * @param p2
   * @param sqDist
   * @returns {*}
   * @private
   */
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

/////////////////////// 吸附功能 //////////////////////////////
export const Snapping = {
  /**
   * 处理吸附
   * @param e
   * @returns {boolean}
   * @private
   */
  _handleSnapping(e) {
    // 按住Alt键 移动marker则暂停吸附效果
    if (e.altKey) {
      return false;
    }

    this._map = e.target.getMap();
    const marker = e.target;
    const polygon = e.polygon;
    // 创建一个标记可以吸附到的多边形列表。
    if (this._snapList === undefined) {
      // _snapList 将所有符合条件的层添加到吸附集合中
      Snapping._createSnapList(polygon);
    }

    // 如果没有层来捕捉，停在这里
    if (this._snapList.length <= 0) {
      return false;
    }

    // 得到最近的层，它是最接近latlng的段与距离。
    const closestLayer = Snapping._calcClosestLayer(marker.getPosition(), this._snapList);

    const isMarker = closestLayer.layer instanceof BMap.Marker;

    // 找到我们想抢占的最后一个
    let snapLatLng = closestLayer.latlng;

    // 标记捕捉前的最小距离（以像素为单位）
    this.snapDistance = 20;
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
      layer: polygon,
      layerInteractedWith: closestLayer.layer // 因为缺少更好的属性名。
    };

    if (closestLayer.distance < minDistance) {
      // 吸附这个marker
      marker.setPosition(snapLatLng);
      polygon.setPositionAt(polygon.getPath().length - 1, snapLatLng);

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
  /**
   * 计算最近的层
   * @param latlng
   * @param layers
   * @private
   */
  _calcClosestLayer(latlng, layers) {
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
  /**
   * 计算与层的距离
   * @param latlng
   * @param layer
   * @returns {{latlng: *, segment: *, distance: *}}
   * @private
   */
  _calcLayerDistances(latlng, layer) {
    // 这是多边形?
    const isPolygon = layer instanceof BMap.Polygon;

    // 我们想要捕捉的点P(被拖动的标记)
    const P = latlng;

    let coords;

    // 该层的坐标集合
    if (isPolygon) {
      // polygon
      coords = layer.getPath();
    }

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
        const distance = LineUtil._getDistanceToSegment(this._map, P, A, B);

        // 距离比上一个短吗?保存它和段
        if (shortestDistance === undefined || distance < shortestDistance) {
          shortestDistance = distance;
          closestSegment = [A, B];
        }
      }
    });

    // 现在，取最接近段其上的最近点与p点对齐。
    const C = LineUtil._getClosestPointOnSegment(this._map, latlng, closestSegment[0], closestSegment[1]);

    // 返回最近段落、最近点和与其距离。
    return {
      latlng: C,
      segment: closestSegment,
      distance: shortestDistance
    };
  },

  /**
   * 我们得到了我们想要对齐到(C)的点，但是我们需要检查一个多边形的coord。
   * 以C的优先级作为起始点。让我们在这里检查
   * @param closestLayer
   * @returns {*}
   * @private
   */
  _checkPrioritiySnapping(closestLayer) {
    // A和B是与P最接近的部分的点(我们想要捕捉的标记位置)
    const A = closestLayer.segment[0];
    const B = closestLayer.segment[1];

    // C是我们在线段上吸附的点。
    // 距离最近的多边形的最近部分的最近点，这是对的。
    const C = closestLayer.latlng;

    // 从A到C和B到C的距离，来检查哪个离C更近。
    const distanceAC = LineUtil._getDistance(this._map, A, C);
    const distanceBC = LineUtil._getDistance(this._map, B, C);

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
  _createSnapList(_polygon) {
    let layers = [];
    const debugIndicatorLines = [];

    // 多边形编辑的临时标记
    this._map.getOverlays().forEach((layer) => {
      // 覆盖物是可见的 // 覆盖物是多边形
      if (layer.isVisible() && layer instanceof BMap.Polygon && layer.getPath().length > 0) {
        layers.push(layer);

        // 这是为了调试
        const debugLine = new BMap.Polyline([], {
          strokeColor: 'red',
          strokeWeight: 2,
          strokeOpacity: 0.5,
          enableClicking: false
        });
        debugIndicatorLines.push(debugLine);

        // 取消此行 👇 注释以显示辅助线进行调试
        // this._map.addOverlay(debugLine);
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
  _cleanupSnapping() {
    delete this._snapList;

    if (this.debugIndicatorLines) {
      this.debugIndicatorLines.forEach((line) => {
        this._map.removeOverlay(line);
      });
    }
  },
  /**
   * 解扣
   * @private
   */
  _unsnap() {
    // delete the last snap
    delete this._snapLatLng;
  }
};
