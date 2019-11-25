<!--  -->
<template>
  <div>
    <div class="merge-button">
      <Button v-if="enabledMerge" type="primary" shape="circle" @click="mergePolygon">完成合并</Button>
      <Button type="primary" shape="circle" @click="addTest">加载数据</Button>
    </div>
    <div id="mapContainer" class="baidu-map">
    </div>
  </div>
</template>

<script>
  import Draw, {Control} from './util/Draw';
  import Edit from './util/Edit.js';
  import Merge from './util/Merge.js';
  import Hotmap from './util/Hotmap.js';
  import {initIcon} from './util/IconOverlay.js';

  export default {
    name: 'baidumap',
    mixins: [Draw, Edit, Merge, Hotmap],
    data: function () {
      return {
        buttons: {}, // 工具按钮
      }
    },
    mounted() {

      // 初始化地图
      this.initialize();

      // 初始化工具栏按钮
      this.initButton();

      // 初始化地图控件
      Control(this.map, this.toggleButton, this.drawButtonName, this.mergeButtonName);

      // 初始化多边形覆盖物单击事件
      this.initPolygonClick();

      // 初始化热力图
      // this.initHotMap(this.map);

      // 初始化图标覆盖物
      initIcon(this.map);

    },
    methods: {
      // 初始化工具栏按钮
      initButton() {
        const _this = this;

        // 按钮控制类
        class Controls {

          // 构造函数
          constructor(name, status, onClick) {
            // 按钮名称
            this.name = name;

            // 按钮状态
            this.status = status;

            // 单击事件
            this.onClick = onClick;
          }

          // 获取按钮状态
          toggled() {
            return _this[this.status];
          }

          // 切换按钮状态
          toggle(e) {
            // 获取按钮DOM元素
            const button = document.getElementById(this.name);

            // 如果参数非boolean类型 则 调用单击事件
            if (typeof e !== 'boolean') {
              this.onClick();
            }

            // 根据按钮状态 设置 按钮样式
            if (this.toggled()) {
              button.style.backgroundColor = '#48c332';
            } else {
              button.style.backgroundColor = '#ffffff';
            }
          }
        }

        // 实例化绘图按钮
        this.buttons[this.drawButtonName] = new Controls(this.drawButtonName, 'enabledDraw', this.toggleDraw);

        // 实例化合并按钮
        this.buttons[this.mergeButtonName] = new Controls(this.mergeButtonName, 'enabledMerge', this.toggleMerge);
      },
      addTest() {
        console.time("addTest time");
        this.$Spin.show();
        console.time("生成数据 time");
        this.$axios.post(
          '/addTest'
        ).then(response => {
          console.timeEnd("生成数据 time");
          let data = response.data;

          console.time("渲染点 time");
          // let points = [];
          data.markers.forEach(item => {
            // 渲染点
            let marker = new BMap.Marker(new BMap.Point(item.lng, item.lat));
            this.map.addOverlay(marker);

            // points.push(new BMap.Point(item.lng, item.lat));
          });
          // let pointCollection = new BMap.PointCollection(points);  // 初始化PointCollection
          // this.map.addOverlay(pointCollection);
          console.timeEnd("渲染点 time");
          console.time("渲染线 time");
          let lines = [];
          data.lines.forEach(item => {
            // , {
            //     strokeColor: 'red',
            //       strokeWeight: 2,
            //       strokeOpacity: 0.5,
            //       enableClicking: false
            //   }
            // 渲染线
            // let line = new BMap.Polyline([new BMap.Point(item.lng, item.lat), new BMap.Point(item.lng2, item.lat2)]);
            // this.map.addOverlay(line);

            lines.push({
              "geometry": {
                "type": "LineString",
                "coordinates": [[item.lng, item.lat], [item.lng2, item.lat2]]
              }, "count": item.count
            })
          });
          let dataSet = new mapv.DataSet(lines);
          let options = {
            gradient: {
              0: 'blue',
              0.5: 'yellow',
              1: 'red'
            },
            lineWidth: 2,
            max: 30,
            draw: 'intensity',
          }

          let mapvLayer = new mapv.baiduMapLayer(this.map, dataSet, options);
          console.timeEnd("渲染线 time");

          console.timeEnd("addTest time");
          this.$Spin.hide();
        }).catch((e) => {
          console.error(e);
          this.$Spin.hide();
        })
      },
      // 初始化地图
      initialize() {
        this.map = new BMap.Map('mapContainer', {enableMapClick: false});
        // this.map.centerAndZoom(new BMap.Point(106.152937, 35.468506), 5);
        this.map.centerAndZoom('北京', 13);
        this.map.enableScrollWheelZoom();

        // let arr = [];
        // let myDis = new BMapLib.DistanceTool(this.map);
        // myDis.open();  //开启鼠标测距
        // myDis.addEventListener("addpoint", function (e) {
        //   console.log(e.point);
        //   arr.push(e.point);
        //   if (arr.length > 1) {
        //     for (let i = 1; i < arr.length; i++) {
        //       var from = turf.point([arr[i - 1].lng, arr[i - 1].lat]);
        //       var to = turf.point([arr[i].lng, arr[i].lat]);
        //       var options = {units: 'kilometers'};
        //
        //       var distance = turf.distance(from, to, options);
        //       console.log(distance);
        //
        //       console.log(getShortDistance(arr[i - 1].lng + ',' + arr[i - 1].lat, arr[i].lng + ',' + arr[i].lat));
        //       console.log('------------------------------');
        //     }
        //   }
        // });
        // 计算两点之间的距离 单位：米
        // function distance(from, to) {
        //   if (!from || !to) return;
        //   let point1,point2,lng1, lat1, lng2, lat2;
        //   let ew1, ns1, ew2, ns2;
        //   let dx, dy, dew;
        //   // 经纬度赋值
        //   point1 = from.split(',');
        //   point2 = to.split(',');
        //   lng1 = point1[0];
        //   lat1 = point1[1];
        //   lng2 = point2[0];
        //   lat2 = point2[1];
        //   // 坐标格式校验
        //   if (!lng1 || !lat1 || !lng2 || !lat2) return;
        //   let doublePat = /^(\d+)\.(\d+)$/g;
        //   if (!lng1.match(doublePat) || !lat1.match(doublePat) || !lng2.match(doublePat) || !lat2.match(doublePat)) return;
        //   // 角度转换为弧度
        //   ew1 = lng1 * 0.01745329252;
        //   ns1 = lat1 * 0.01745329252;
        //   ew2 = lng2 * 0.01745329252;
        //   ns2 = lat2 * 0.01745329252;
        //   // 经度差
        //   dew = ew1 - ew2;
        //   // 若跨东经和西经180 度，进行调整
        //   if (dew > 3.14159265359)
        //     dew = 6.28318530712 - dew;
        //   else if (dew < -3.14159265359)
        //     dew = 6.28318530712 + dew;
        //   dx = 6370693.5 * Math.cos(ns1) * dew; // 东西方向长度(在纬度圈上的投影长度)
        //   dy = 6370693.5 * (ns1 - ns2); // 南北方向长度(在经度圈上的投影长度)
        //   // 勾股定理求斜边长
        //   return Math.sqrt(dx * dx + dy * dy).toFixed(0);
        // }
        //
        // console.log(distance('116.44572628870428,39.94024977864967','116.42991611172866,39.91280539938402'));

        // ---- 重写多边形渲染函数成功
        // 测试重写多边形覆盖物渲染函数 同时不改变原有渲染内部操作
        // 目的是实现在多边形渲染时添加自定义的判断操作
        // new BMap.Polygon(); // 首次 new 多边形实例后，百度内部应该是初始化了某些属性，如果不先预热创建该原型类，会导致拷贝重写渲染函数失败
        // setTimeout(() => {
        //   let cc = BMap.Polygon.prototype.draw;
        //   BMap.Polygon.prototype.draw = function () {
        //     cc.call(this);
        //     console.log(111);
        //   }
        // }, 0);
        // // 闭包实现继承拷贝多边形覆盖物原型
        // let ha = (function obj() {
        //   let ins;
        //
        //   function f() {
        //     // new BMap.Polygon().draw.call(this);
        //     let aa = BMap.Polygon;
        //     let cc = BMap.Polygon.prototype.draw;
        //     let ysl = function (a, b) {
        //       // BMap.Polygon.call(this,a,b);
        //       aa.call(this, a, b);
        //       console.log("changjian");
        //     }
        //
        //     ysl.prototype = new BMap.Polygon();
        //
        //     ysl.prototype.draw = function () {
        //       // BMap.Polygon.prototype.draw.call(this);
        //       cc.call(this);
        //       console.log(11);
        //     }
        //
        //     let yslshi = new ysl([
        //       new BMap.Point(116.387112, 39.920977),
        //       new BMap.Point(116.385243, 39.913063),
        //       new BMap.Point(116.394226, 39.917988),
        //       new BMap.Point(116.401772, 39.921364),
        //       new BMap.Point(116.41248, 39.927893)
        //     ], {strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5});
        //     let si = yslshi;
        //     return {
        //       si: si
        //     }
        //   }
        //
        //   return {
        //     getin: function () {
        //       // --单例模式-- 之初始化一次
        //       if (!ins) {
        //         ins = f();
        //       }
        //       return ins;
        //     }
        //   }
        // })();

        // 鼠标跟随显示坐标
        // const div1 = document.createElement('div');
        // div1.style.position = 'absolute';
        // div1.style.top = '10px';
        // div1.style.left = '10px';
        // div1.style.color = '#ffffff'
        // div1.style.backgroundColor = 'rgba(0,0,0,0.5)';
        // document.body.appendChild(div1);
        // this.map.addEventListener("mousemove", function(e){
        //   div1.textContent = `lng:${e.point.lng}, Y:${e.point.lat}`;
        //   div1.style.top = e.clientY + 20 + 'px';
        //   if(e.clientX + 20 + div1.clientWidth > document.body.scrollWidth){
        //     div1.style.left = e.clientX - 10 - div1.clientWidth + 'px';
        //   }else{
        //     div1.style.left = e.clientX + 20 + 'px';
        //   }
        // });
        // 单击地图添加marker
        // this.map.addEventListener("click", (e)=>{
        //   this.hintMarker = new BMap.Marker(e.point);
        //   this.map.addOverlay(this.hintMarker);
        // });

        // 黑色地图
        // this.map.setMapStyle({
        //   style: 'midnight'
        // });

        // 城市切换控件
        // this.map.addControl(new BMap.CityListControl({
        //   anchor: BMAP_ANCHOR_TOP_LEFT,
        //   offset: new BMap.Size(10, 20),
        //   // 切换城市之间事件
        //   onChangeBefore: function(){
        //      alert('before');
        //   },
        //   // 切换城市之后事件
        //   onChangeAfter:function(){
        //     alert('after');
        //   }
        // }));

        // 鼠标测距
        // var myDis = new BMapLib.DistanceTool(this.map);
        // myDis.open();  //开启鼠标测距
        // myDis.addEventListener("addpoint", function(e) {
        //   console.log('坐标', e.point);
        //   console.log('下标', e.index);
        //   console.log('距离', e.distance);
        // });
      },

      // 根据按钮关闭其它按钮启用的模式
      triggerClickOnToggledButtons(exceptThisButton) {
        // 遍历按钮对象集合
        for (const name in this.buttons) {

          // 非当前单击的按钮 并且 是已启用状态的按钮 则 停用已开启的模式
          if (this.buttons[name] !== exceptThisButton && this.buttons[name].toggled()) {
            this.buttons[name].toggle();
          }

        }
      },

      // 根据按钮名称切换按钮状态
      toggleButton(name) {

        // 停用其它模式
        this.triggerClickOnToggledButtons(this.buttons[name]);

        // 切换按钮状态
        this.buttons[name].toggle();
      }
    }
  };
</script>

<style lang="less">
  @import "./map.less";
</style>
