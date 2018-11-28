// mapv 全国-1 数据
import mapvQG from '../data/mapv-quanguo'
import mapvQG10 from '../data/mapv-quanguo-10'
// heatmap 全国-1 数据
import hotQG from '../data/hot-quanguo'
import hotQG10 from '../data/hot-quanguo-10'

export default {
  methods: {
    initHotMap(map) {

      setTimeout(function () {
        // let heatmapOverlay = new BMapLib.HeatmapOverlay({
        //   radius: 60,
        //   // opacity: 0.1,
        // });
        // map.addOverlay(heatmapOverlay);
        // heatmapOverlay.setDataSet({data:hotQG,max:100});
        // 是否显示热力图
        // heatmapOverlay.show();

        // let options = {
        //   draw: 'heatmap',
        //   size: 20, // 每个热力点半径大小
        //   gradient: { // 热力图渐变色
        //     0.25: "rgb(0,0,255)",
        //     0.55: "rgb(0,255,0)",
        //     0.85: "yellow",
        //     1.0: "rgb(255,0,0)"
        //   },
        //   max: 100, // 最大权重值
        // }
        //
        // let options = {
        //   fillStyle: 'rgba(255, 50, 50, 0.6)',
        //   globalCompositeOperation: 'lighter', // 颜色叠加方式
        //   maxSize: 200,
        //   max: 300,
        //   draw: 'bubble'
        // }

        let options = {
          size: 5,
          fillStyle: 'rgba(255, 50, 50, 0.6)', // 点数据时候使用
          shadowColor: 'rgba(255, 50, 50, 1)', // 投影颜色
          globalCompositeOperation: 'lighter', // 颜色叠加方式
          // mixBlendMode: 'difference',
          draw: 'simple',
          methods: { // 一些事件回调函数
            click: function (item) { // 点击事件，返回对应点击元素的对象值
              console.log(item);
            },
            // mousemove: function(item) { // 鼠标移动事件，对应鼠标经过的元素对象值
            //   console.log(item);
            // }
          },
        };

        // let options = {
        //   fillStyle: 'rgba(55, 50, 250, 0.8)',
        //   shadowColor: 'rgba(255, 250, 50, 1)',
        //   shadowBlur: 20,
        //   max: 100,
        //   size: 50,
        //   label: {
        //     show: true,
        //     fillStyle: 'white',
        //     // shadowColor: 'yellow',
        //     // font: '20px Arial',
        //     // shadowBlur: 10,
        //   },
        //   globalAlpha: 0.5,
        //   gradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"},
        //   draw: 'honeycomb'
        // }

        let dataSet = new mapv.DataSet(mapvQG10);
        let mapvLayer = new mapv.baiduMapLayer(map, dataSet, options);

        mapvLayer.setOptions({
          zIndex: 2, // 层级
          unit: 'm', // 'px': 默认值。'm': 以米制为单位绘制，会跟随地图比例放大缩小
          size: 150, // 大小值
          fillStyle: '#fff710', // 填充颜色
          mixBlendMode: 'difference', // 不同图层之间的叠加模式 重叠层需要同时配置
          strokeStyle: 'rgba(0, 255, 255, 1)', // 描边颜色
          lineWidth: 4, // 描边宽度
          // globalAlpha: 0.1, // 透明度 同时控制 填充 与 描边 透明度
          // globalCompositeOperation: 'xor', // 颜色叠加方式 xor重叠的部分都变成透明的 lighter重叠部分颜色相加，得到的颜色值大于255，结果就为白色。 其它叠加方式 数据量大 出现卡顿现象
          // coordType: 'bd09mc', // 可选百度墨卡托坐标类型bd09mc和百度经纬度坐标类型bd09ll(默认) bd09mc坐标会出现错误，集聚在坐标0,0位置
          shadowColor: 'rgba(255, 50, 50, 1)', // 投影颜色 虚化光圈 需配合投影模糊级数一起使用
          shadowBlur: 35,  // 投影模糊级数
          // updateCallback: function (time) { // 重绘回调函数，如果是时间动画、返回当前帧的时间
          //   console.log('每次 拖动地图 缩放地图 都会重新绘制覆盖物');
          // },
          // shadowOffsetX: 100, // 投影偏移量
          // shadowOffsetY: 100,
          // context: '2d', // 可选2d和webgl，webgl目前只支持画simple模式的点和线 2d:表示2维 webgl:表示3维
        });

        // let data = dataSet.get({
        //   filter: function (item) {
        //     if (item.count >= 10) {
        //       item.fillStyle = "#f1ff11";
        //       item.size = 3;
        //       return true;
        //     } else {
        //       return false;
        //     }
        //   }
        // });

        let dataSet1 = new mapv.DataSet(mapvQG);

        let mapvLayer1 = new mapv.baiduMapLayer(map, dataSet1, options);

        let data1 = dataSet1.get();

        data1.filter((item, index) => {
          if (item.count < 10 && index <= 2000) {
            item.fillStyle = 'rgba(46, 139, 87, 0.6)';
          } else {
            item.size = 5;
          }
        });

        // let intensity = new mapv.utilDataRangeIntensity({
        //   maxSize: 1, // 定义最大的半径大小值
        //   gradient: { // 渐变色设置
        //     0.25: "rgb(0,0,255)",
        //     0.55: "rgb(0,255,0)",
        //     0.85: "yellow",
        //     1.0: "rgb(255,0,0)"
        //   },
        //   max: 100 // 最大权重值
        // });

        // console.log("size:", intensity.getSize(10));
      }, 1000);
    }
  }
}
