importScripts('/static/libs/turf.min.js');

/**
 * 多边形合并
 */
function merge(polygons = []) {
  let scopes = [];
  // 扩充力度
  const radius = 0.005;
  // 遍历单位多边形集合
  try {
    let polyArr = [];
    polygons.forEach(l => {
      try {
        const coordin = l.geometry.coordinates[0];
        if (coordin && coordin.length > 2) {
          coordin.push(coordin[0]);
          polyArr.push(turf.buffer(turf.polygon([coordin]), radius));
          // // _this.unionDis(data);
          // new ThreadMerge().start(data).then(data => {
          //   console.log(JSON.stringify(data));
          //   this.$store.commit('updateFullscreenLoading', false); // 关闭加载层
          // }).catch(e => {
          //   console.error('多线程区域合并异常: ' + e.message);
          //   this.$store.commit('updateFullscreenLoading', false); // 关闭加载层
          // });
        }
      } catch (e) {
        console.error('扩充异常:' + e);
      }
    });
    let _solution = turf.union(...polyArr);
    // 还原扩充
    _solution = turf.buffer(_solution, -radius);
    if (!_solution) return;
    // 如果结果类型是多多边形覆盖物
    if (_solution.geometry.type === 'MultiPolygon') {
      _solution.geometry.coordinates.forEach(v => {
        scopes.push(turf.polygon([v[0]]));
      });
    } else if (_solution.geometry.type === 'Polygon') {
      scopes.push(_solution);
    }
  } catch (e) {
    console.error('合并异常:' + e.stack);
  }
  return scopes;
}

/**
 * 指定message事件的监听函数
 * @param event data 属性可以获取数据
 */
onmessage = function (event) {
  // 工作线程接收到主线程的消息
  let ref = merge(event.data);
  postMessage(ref);
};
