import YSL from "./map";

const img_solid = require('@/assets/HT.png');
const img_hollow = require('@/assets/HT1_gaitubao_com_8x8.png');

const Edit = {
  _enabled: false,
  _layer: null,
  _map: null,
  icon_solid: null,
  icon_hollow: null,
  _paths: [],
  _markers: [],
  initializeEdit(layer) {
    this._layer = layer;
    this._enabled = false;
    return this;
  },

  toggleEdit(options) {
    if (!this._enabled) {
      this.enableEdit(options);
    } else {
      this.disableEdit();
    }
  },

  enableEdit(layer) {
    this._layer = layer;
    this._map = layer.getMap();
    if (!this._map) {
      return;
    }
    if (!this._enabled) {
      this.disableEdit();
    }
    this._enabled = true;
    this._initMarkers();
  },

  disableEdit(poly = this._layer) {
  },
  _initMarkers() {
    // 实心块
    this.icon_solid = new BMap.Icon(img_solid, new BMap.Size(8, 8));
    // 空心块
    this.icon_hollow = new BMap.Icon(img_hollow, new BMap.Size(8, 8));
    this._paths = this._layer.getPath();
    const length = this._paths.length;
    for (var i = 0; i < length; i++) {
      this.createEditMarker(this._paths[i], this.icon_solid, i * 2, 0, "solid");
      var point = this.getCenterPoint(this._paths[i], i + 1 === length ? this._paths[0] : this._paths[i + 1]);
      this.createEditMarker(point, this.icon_hollow, i * 2 + 1, 1, "hollow");
    }
  },
  getCenterPoint(A, B) {
    var lat = ((A.lat + B.lat) / 2).toFixed(6);
    var lng = ((A.lng + B.lng) / 2).toFixed(6);
    var C = new BMap.Point(lng, lat);
    return C;
  },
  createEditMarker(point, icon, index, genre, type) {
    var marker = new BMap.Marker(point, {icon: icon});
    marker.genre = genre;
    marker.type = type;
    marker.enableDragging();
    if (marker.Gi) { // 避免重复添加事件
      if (marker.Gi.onrightclick) {
        marker.Gi.onrightclick = {};
      }
      if (marker.Gi.ondragstart) {
        marker.Gi.ondragstart = {};
      }
      if (marker.Gi.ondragging) {
        marker.Gi.ondragging = {};
      }
      if (marker.Gi.ondragend) {
        marker.Gi.ondragend = {};
      }
    }
    if (genre == 0) {//在角上
      var solidRightclickAction = () => {
        if (this._paths.length > 3) {
          //index, indexBefore, indexAfter, moveBefore, moveAfter
          var obj = this.getIndexPoint(marker.getPosition(), this._markers, marker.genre);
          this._map.removeOverlay(this._layer);
          this._map.removeOverlay(this._markers[obj.index]);
          this._map.removeOverlay(this._markers[obj.moveBefore]);
          this._map.removeOverlay(this._markers[obj.moveAfter]);
          var point_before = this._markers[obj.indexBefore].getPosition();
          var point_after = this._markers[obj.indexAfter].getPosition();
          var pt = this.getCenterPoint(point_before, point_after);
          delete this._markers[obj.index];
          delete this._markers[obj.moveBefore];
          delete this._markers[obj.moveAfter];
          var newmarkers = this._markers.filter(val => {
            return val != undefined;
          });
          this._markers = newmarkers;
          this.createEditMarker(pt, this.icon_hollow, obj.indexWill, 1, "hollow");
          this._paths.splice(obj.index / 2, 1);
          this._layer.setPath(this._paths);
        }
      };
      var solid_sbindex = -1;//操作点的序号
      var solid_index_before = -1;//前一个实心点序号
      var solid_index_after = -1;//后一个实心点序号
      var solid_move_before = -1;//前一个要动的点序号
      var solid_move_after = -1;//后一个要动的点序号
      var solid_pt_before = null;//前一个动点坐标
      var solid_pt_after = null;//后一个动点坐标
      var solidDraggingAction = (e) => {
        solid_pt_before = this.getCenterPoint(this._markers[solid_index_before].getPosition(), e.point);
        solid_pt_after = this.getCenterPoint(e.point, this._markers[solid_index_after].getPosition());
        this._markers[solid_sbindex].setPosition(e.point);//设置拖拽点的坐标
        this._markers[solid_move_before].setPosition(solid_pt_before);//设置前一个动点的坐标
        this._markers[solid_move_after].setPosition(solid_pt_after);//设置后一个动点的坐标
        this._paths.splice(solid_sbindex / 2, 1, e.point)
        this._layer.setPath(this._paths);//设置多边形当前点的坐标位置
      };
      var solidDragendAction = () => {
        marker.removeEventListener("dragging", solidDraggingAction);
        marker.removeEventListener("dragend", solidDragendAction);
      };
      var solidDragstartAction = () => {
        //index, indexBefore, indexAfter, moveBefore, moveAfter
        var obj = this.getIndexPoint(marker.getPosition(), this._markers, marker.genre);
        solid_sbindex = obj.index;
        solid_index_before = obj.indexBefore;
        solid_index_after = obj.indexAfter;
        solid_move_before = obj.moveBefore;
        solid_move_after = obj.moveAfter;
        marker.addEventListener("dragging", solidDraggingAction);
        marker.addEventListener("dragend", solidDragendAction);
      };
      marker.addEventListener("dragstart", solidDragstartAction);
      marker.addEventListener("rightclick", solidRightclickAction);
    }
    if (genre == 1) {//在线上
      var hollowRightclickAction = () => {
        //index, indexBefore, indexAfter, willBefore, willAfter
        var obj = this.getIndexPoint(marker.getPosition(), this._markers, marker.genre);
        var pt = this._markers[obj.index].getPosition();
        this._map.removeOverlay(this._markers[obj.index]);
        this._markers.splice(obj.index, 1);
        this.createEditMarker(pt, this.icon_solid, obj.index, 0, "solid");
        this._paths.splice((obj.index + 1) / 2, 0, pt);
        this._layer.setPath(this._paths);
        var pt_before = this.getCenterPoint(this._markers[obj.indexBefore].getPosition(), pt);
        var pt_after = this.getCenterPoint(pt, this._markers[obj.indexAfter].getPosition());
        this.createEditMarker(pt_before, this.icon_hollow, obj.willBefore, 1, "hollow");
        this.createEditMarker(pt_after, this.icon_hollow, obj.willAfter, 1, "hollow");
        return obj.index + 1;
      };
      var hollow_sbindex = -1;
      var hollow_index_before = -1;
      var hollow_index_after = -1;
      var hollow_will_before = -1;
      var hollow_will_after = -1;
      var ovlindex = -1;
      var hollowDraggingAction = (e) => {
        marker.setPosition(e.point);
        this._paths.splice(ovlindex, 1, e.point);
        this._layer.setPath(this._paths);
      };
      var hollowDragendAction = (e) => {
        this._paths.splice(ovlindex, 1, e.point);
        this._layer.setPath(this._paths);
        this._map.removeOverlay(this._markers[hollow_sbindex]);
        this._markers.splice(hollow_sbindex, 1);
        this.createEditMarker(e.point, this.icon_solid, hollow_sbindex, 0, "solid");
        var pt_before = this.getCenterPoint(this._markers[hollow_index_before].getPosition(), e.point);
        var pt_after = this.getCenterPoint(e.point, this._markers[hollow_index_after].getPosition());
        this.createEditMarker(pt_before, this.icon_hollow, hollow_will_before, 1, "hollow");
        this.createEditMarker(pt_after, this.icon_hollow, hollow_will_after, 1, "hollow");
        marker.removeEventListener("dragging", hollowDraggingAction);
        marker.removeEventListener("dragend", hollowDragendAction);
      };
      var hollowDragstartAction = () => {
        //index, indexBefore, indexAfter, willBefore, willAfter
        var obj = this.getIndexPoint(marker.getPosition(), this._markers, marker.genre);
        hollow_sbindex = obj.index;
        hollow_index_before = obj.indexBefore;
        hollow_index_after = obj.indexAfter;
        hollow_will_before = obj.willBefore;
        hollow_will_after = obj.willAfter;
        ovlindex = (obj.index + 1) / 2;
        this._paths.splice(ovlindex, 0, marker.getPosition());
        this._layer.setPath(this._paths);
        marker.addEventListener("dragging", hollowDraggingAction);
        marker.addEventListener("dragend", hollowDragendAction);
      };
      marker.addEventListener("dragstart", hollowDragstartAction);
      marker.addEventListener("rightclick", hollowRightclickAction);
    }
    this._map.addOverlay(marker);
    this._markers.splice(index, 0, marker);
  },
  getIndexPoint(point, markers, genre) {
    var obj = null;
    // var index = markers.findIndex(point);
    var index = -1;
    for (var i = 0; i < markers.length; i++) {
      if (point.equals(markers[i].getPosition())) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      return null;
    }
    if (genre == 0) { // 实点
      if (index % 2 != 0) {
        console.error("取点错误,不是实点");
      }
      obj = {
        index: index,
        indexBefore: index == 0 ? markers.length - 2 : index - 2,
        indexAfter: index == markers.length - 2 ? 0 : index + 2,
        moveBefore: index == 0 ? markers.length - 1 : index - 1,
        moveAfter: index + 1,
        indexWill: index == 0 ? markers.length - 3 : index - 1
      };
    }
    if (genre == 1) { // 空点
      if (index % 2 != 1) {
        console.error("取点错误,不是虚点");
      }
      obj = {
        index: index,
        indexBefore: index - 1,
        indexAfter: index == markers.length - 1 ? 0 : index + 1,
        willBefore: index,
        willAfter: index == markers.length - 1 ? markers.length + 2 : index + 2,
      };
    }
    return obj;
  },
}
export default Edit;
