import {GeoJSON, ClipperLib, Clipper, Snapping} from './Plugin'

const img_solid = require('@/assets/HT.png');
const img_hollow = require('@/assets/HT1_gaitubao_com_8x8.png');

const Edit = {
  data: function () {
    return {
      icon_solid: null,
      icon_hollow: null,
    }
  },
  methods: {

    toggleEdit(layer) {
      if (!layer._enabled) {
        this.enableEdit(layer);
      } else {
        this.disableEdit(layer);
      }
    },

    enableEdit(layer) {
      if (!this.map) {
        this.map = layer.getMap();
      }
      if (layer._enabled) {
        this.disableEdit(layer);
      }
      layer._enabled = true;
      layer.markers = [];
      layer.addEventListener('click',()=>{
        this.toggleEdit(layer);
      })
      this._initMarkers(layer);
    },

    disableEdit(layer) {
      if (!layer._enabled) {
        return false;
      }
      const results = Clipper.execute(layer, this.map.getOverlays()); // 处理裁剪去重 (要裁剪的区域, 获取所有覆盖物)
      if (results.state === 200) {
        layer._enabled = false;
        for (var i = 0; i < layer.markers.length; i++) {
          this.map.removeOverlay(layer.markers[i]);
        }
        layer.markers = [];
        this.map.removeOverlay(layer);
        var over = new BMap.Polygon(results.points, this.stylePolygon);
        this.map.addOverlay(over);
        this.toggleEdit(over);
      } else {
        layer.setStrokeColor('red');
        this.$Modal.error({
          content: results.describe
        });
      }
    },

    _initMarkers(layer) {
      // 实心块
      this.icon_solid = new BMap.Icon(img_solid, new BMap.Size(8, 8));
      // 空心块
      this.icon_hollow = new BMap.Icon(img_hollow, new BMap.Size(8, 8));
      const paths = layer.getPath();
      const length = paths.length;
      for (var i = 0; i < length; i++) {
        this.createEditMarker(layer, paths[i], this.icon_solid, i * 2, 0, "solid");
        var point = this.getCenterPoint(paths[i], i + 1 === length ? paths[0] : paths[i + 1]);
        this.createEditMarker(layer, point, this.icon_hollow, i * 2 + 1, 1, "hollow");
      }
    },

    getCenterPoint(A, B) {
      var lat = ((A.lat + B.lat) / 2).toFixed(6);
      var lng = ((A.lng + B.lng) / 2).toFixed(6);
      var C = new BMap.Point(lng, lat);
      return C;
    },

    createEditMarker(layer, point, icon, index, genre, type) {
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
        this.createSolid(layer, marker);
      } else if (genre == 1) {//在线上
        this.createHollow(layer, marker);
      }
      this.map.addOverlay(marker);
      layer.markers.splice(index, 0, marker);
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

    createSolid(layer, marker) {
      var solidRightclickAction = () => {
        var paths = layer.getPath();
        if (paths.length > 3) {
          this.map.removeOverlay(this._layer);
          //index, indexBefore, indexAfter, moveBefore, moveAfter
          var obj = this.getIndexPoint(marker.getPosition(), layer.markers, marker.genre);
          this.map.removeOverlay(layer.markers[obj.index]);
          this.map.removeOverlay(layer.markers[obj.moveBefore]);
          this.map.removeOverlay(layer.markers[obj.moveAfter]);
          var point_before = layer.markers[obj.indexBefore].getPosition();
          var point_after = layer.markers[obj.indexAfter].getPosition();
          var pt = this.getCenterPoint(point_before, point_after);
          delete layer.markers[obj.index];
          delete layer.markers[obj.moveBefore];
          delete layer.markers[obj.moveAfter];
          var newmarkers = layer.markers.filter(val => {
            return val != undefined;
          });
          layer.markers = newmarkers;
          this.createEditMarker(layer, pt, this.icon_hollow, obj.indexWill, 1, "hollow");
          paths.splice(obj.index / 2, 1);
          layer.setPath(paths);
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
        solid_pt_before = this.getCenterPoint(layer.markers[solid_index_before].getPosition(), e.point);
        solid_pt_after = this.getCenterPoint(e.point, layer.markers[solid_index_after].getPosition());
        layer.markers[solid_sbindex].setPosition(e.point);//设置拖拽点的坐标
        layer.markers[solid_move_before].setPosition(solid_pt_before);//设置前一个动点的坐标
        layer.markers[solid_move_after].setPosition(solid_pt_after);//设置后一个动点的坐标
        layer.setPositionAt(solid_sbindex / 2, e.point);//设置多边形当前点的坐标位置
      };
      var solidDragendAction = () => {
        marker.removeEventListener("dragging", solidDraggingAction);
        marker.removeEventListener("dragend", solidDragendAction);
      };
      var solidDragstartAction = () => {
        //index, indexBefore, indexAfter, moveBefore, moveAfter
        var obj = this.getIndexPoint(marker.getPosition(), layer.markers, marker.genre);
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
    },

    createHollow(layer, marker) {
      var hollowRightclickAction = () => {
        //index, indexBefore, indexAfter, willBefore, willAfter
        var obj = this.getIndexPoint(marker.getPosition(), layer.markers, marker.genre);
        var pt = layer.markers[obj.index].getPosition();
        this.map.removeOverlay(layer.markers[obj.index]);
        layer.markers.splice(obj.index, 1);
        this.createEditMarker(layer, pt, this.icon_solid, obj.index, 0, "solid");
        var paths = layer.getPath();
        paths.splice((obj.index + 1) / 2, 0, pt);
        layer.setPath(paths);
        var pt_before = this.getCenterPoint(layer.markers[obj.indexBefore].getPosition(), pt);
        var pt_after = this.getCenterPoint(pt, layer.markers[obj.indexAfter].getPosition());
        this.createEditMarker(layer, pt_before, this.icon_hollow, obj.willBefore, 1, "hollow");
        this.createEditMarker(layer, pt_after, this.icon_hollow, obj.willAfter, 1, "hollow");
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
        layer.setPositionAt(ovlindex, e.point);
      };
      var hollowDragendAction = (e) => {
        layer.setPositionAt(ovlindex, e.point);
        this.map.removeOverlay(layer.markers[hollow_sbindex]);
        layer.markers.splice(hollow_sbindex, 1);
        this.createEditMarker(layer, e.point, this.icon_solid, hollow_sbindex, 0, "solid");
        var pt_before = this.getCenterPoint(layer.markers[hollow_index_before].getPosition(), e.point);
        var pt_after = this.getCenterPoint(e.point, layer.markers[hollow_index_after].getPosition());
        this.createEditMarker(layer, pt_before, this.icon_hollow, hollow_will_before, 1, "hollow");
        this.createEditMarker(layer, pt_after, this.icon_hollow, hollow_will_after, 1, "hollow");
        marker.removeEventListener("dragging", hollowDraggingAction);
        marker.removeEventListener("dragend", hollowDragendAction);
      };
      var hollowDragstartAction = () => {
        //index, indexBefore, indexAfter, willBefore, willAfter
        var obj = this.getIndexPoint(marker.getPosition(), layer.markers, marker.genre);
        hollow_sbindex = obj.index;
        hollow_index_before = obj.indexBefore;
        hollow_index_after = obj.indexAfter;
        hollow_will_before = obj.willBefore;
        hollow_will_after = obj.willAfter;
        ovlindex = (obj.index + 1) / 2;
        var paths = layer.getPath();
        paths.splice(ovlindex, 0, marker.getPosition());
        layer.setPath(paths);
        marker.addEventListener("dragging", hollowDraggingAction);
        marker.addEventListener("dragend", hollowDragendAction);
      };
      marker.addEventListener("dragstart", hollowDragstartAction);
      marker.addEventListener("rightclick", hollowRightclickAction);
    },
  }
}
export default Edit;
