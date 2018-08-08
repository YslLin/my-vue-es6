import {Merge} from './Plugin'

export default {
  data: function () {
    return {
      currentPolygon: null, // 当前选中区域
      selectPolygonList: [], // 区域合并数组
      enabledMerge: false, // 合并状态
      mergeButtonName: 'mergeButton', // 合并按钮名称
    }
  },
  methods: {
    // 初始化多边形覆盖物单击事件
    initPolygonClick() {
      const _this = this;

      // 激活函数
      BMap.Polygon.prototype.activation = function () {
        if (this.selected) return;
        this.selected = true;
        this.setStrokeColor('#56c0b5');
        this.setFillColor('#56c0b5');
      }

      // 冻结函数
      BMap.Polygon.prototype.freeze = function () {
        if (!this.selected) return;
        this.selected = false;
        this.setStrokeColor(_this.stylePolygon.strokeColor);
        this.setFillColor(_this.stylePolygon.fillColor);
      }

      // 切换函数
      BMap.Polygon.prototype.toggle = function () {
        if (this.selected) {
          this.freeze();
          _this.selectPolygonList.forEach((p, index) => {
            if (this === p) {
              // 下标不变，不可用 delete _this.selectPolygonList[index];
              _this.selectPolygonList.splice(index, 1);
            }
          });
        } else {
          _this.selectPolygonList.push(this);
          this.activation();
        }
      }

      // 单击函数
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
          // 切换激活状态
          this.toggle();
        }

      }
    },
    // 启用合并模式
    enableMerge() {

      if (this.enabledMerge) return;

      // 如果当前选中区域有值 则 冻结区域 并 置空当前已选中区域属性
      if (this.currentPolygon) {
        // 冻结区域
        this.currentPolygon.freeze();
        // 置空当前已选中区域属性
        this.currentPolygon = null;
      }

      this.enabledMerge = true;
    },
    // 停用合并模式
    disableMerge() {

      if (!this.enabledMerge) return;

      this.enabledMerge = false;

      // 冻结所有选中的覆盖物
      this.selectPolygonList.forEach((p) => {
        p.freeze();
      });

      // 清空覆盖物集合
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
    // 合并多边形
    mergePolygon() {
      // 多边形合并集合 小于 两个 则 提示信息并不执行
      if (this.selectPolygonList == null || this.selectPolygonList.length < 2) {
        this.$Modal.error({
          title: '提示框',
          content: '请选择两个或以上的区域进行合并'
        });
        return;
      }

      try {

        // 执行多边形合并
        let results = Merge.execute(this.selectPolygonList);

        // 创建合并后的多边形覆盖物
        let _polygon = new BMap.Polygon(results, this.stylePolygon);
        this.map.addOverlay(_polygon);

        // 移除合并前选中的覆盖物
        this.selectPolygonList.forEach((p) => {
          p.freeze();
          this.map.removeOverlay(p);
        });

        // 停用合并模式
        this.disableMerge();

        // 修改绘图按钮样式
        this.buttons[this.mergeButtonName].toggle(false);
      } catch (e) {
        if (e.name === 'ClipperError') {
          this.$Modal.error({
            title: '提示框',
            content: e.message
          });
          return;
        }
        console.error(e);
      }
    }
  }
}
