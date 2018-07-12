export default {
  data: function () {
    return {
      currentPolygon: null, // 当前选中区域
      selectPolygonList: [], // 区域合并数组
      enabledMerge: false, // 合并状态
    }
  },
  methods: {
    initPolygonClick() {
      const _this = this;

      BMap.Polygon.prototype.selected = false;
      BMap.Polygon.prototype.activation = function () {
        if (this.selected) return;
        this.selected = true;
        this.setStrokeColor('#56c0b5');
        this.setFillColor('#56c0b5');
      }

      BMap.Polygon.prototype.freeze = function () {
        if (!this.selected) return;
        this.selected = false;
        this.setStrokeColor(_this.stylePolygon.strokeColor);
        this.setFillColor(_this.stylePolygon.fillColor);
      }

      BMap.Polygon.prototype.toggle = function () {
        if (this.selected) {
          this.freeze();
        } else {
          this.activation();
        }
      }

      BMap.Polygon.prototype.onclick = function () {
        // 如果 未开启合并模式 则 取消之前选中区域的颜色高亮
        // 否则 选中区域合并数组中添加当前点击区域
        if (!_this.enabledMerge) {
          if (_this.currentPolygon) {
            // 冻结
            _this.currentPolygon.freeze();
          }
          // 激活
          this.activation();
          _this.currentPolygon = this;
        } else {
          if(!this.selected){
            _this.selectPolygonList.push(this);
          }
          // 切换激活状态
          this.toggle();
        }

      }
    },
    enableMerge() {

      if (this.enabledMerge) return;

      if (this.currentPolygon) {
        // 冻结
        this.currentPolygon.freeze();
        this.currentPolygon = null;
      }

      this.enabledMerge = true;
    },
    disableMerge() {

      if (!this.enabledMerge) return;

      this.enabledMerge = false;

      this.selectPolygonList.forEach((p) => {
        p.freeze();
      });

      this.selectPolygonList = [];
    },
    // 切换合并模式
    toggleMerge() {
      if (this.enabledMerge) {
        this.disableMerge();
      } else {
        this.enableMerge();
      }
    },
  }
}
