import MergeWorker from './MergeWorker';

/**
 * 多线程合并
 */
class ThreadMerge {
  _polygons = []; // 结果集
  _taskSize = 50; // 一批任务处理50条数据
  _threadPool = null; // 线程池
  _finalMerger = 0; // 是否做最终合并
  _resolve = null; // 完成响应
  _reject = null; // 失败响应

  /**
   * 开始处理任务
   * @param base 基础数据
   * @param taskSize 任务大小
   * @param poolSize 线程池大小
   * @returns {Promise}
   */
  start(base, taskSize, poolSize) {
    if (!base) return null;
    this._taskSize = taskSize || this._taskSize;
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      let unitPolygon = new Map();
      base.forEach(v => {
        let p = turf.simplify(turf.polygon(v.geometry.coordinates), {tolerance: 0.0001});
        if (unitPolygon.has(v.pkCorp)) {
          unitPolygon.get(v.pkCorp).push(p);
        } else {
          unitPolygon.set(v.pkCorp, [p]);
        }
      });

      this._threadPool = new ThreadPool(v => {
        this.continue(v);
      }, poolSize);

      unitPolygon.forEach(v => {
        if (v.length > 300) {
          let polygons = [...v];
          let n = Math.ceil(polygons.length / this._taskSize);
          for (let i = 0; i < n; i++) {
            this._threadPool.execute(polygons.splice(0, this._taskSize));
          }
          console.log('polygons: ' + v.length);
        } else {
          this._threadPool.execute(v);
        }
      });

      console.log('unitPolygon: ' + unitPolygon.size);
      console.time('mergeUnit');
    });
  }

  /**
   * 继续处理
   * @param data
   */
  continue(data) {
    console.log(this._threadPool.getCount());
    this._polygons.push(...data);
    if (this._threadPool.getCount() === 0) {
      console.timeLog('mergeUnit');
      console.log('cccc' + this._polygons.length);
      console.log('_finalMerger' + this._finalMerger);
      if (this._polygons.length > 200) {
        const simplePolygons = this._polygons.splice(0).map(v => turf.simplify(v, {tolerance: 0.01}));
        let size = this._threadPool.getPoolSize();
        let n = Math.ceil(simplePolygons.length / size);
        for (let i = 0; i < size; i++) {
          this._threadPool.execute(simplePolygons.splice(0, n));
        }
      } else
      if (this._finalMerger === true) {
        this.end();
      } else {
        this._finalMerger = true;
        console.log('simplePolygonssimplePolygonssimplePolygonssimplePolygonssimplePolygonssimplePolygons');
        // this.end();
        const simplePolygons = this._polygons.splice(0).map(v => turf.simplify(v, {tolerance: 0.01}));
        this._threadPool.execute(simplePolygons);
      }
    }
  }

  /**
   * 结束处理
   */
  end() {
    console.timeLog('mergeUnit');
    console.log('polygons: ' + this._polygons.length);
    let array = [], str = '';
    this._polygons.forEach(item => {
      let simplify = turf.simplify(item, {tolerance: 0.01});
      let points = simplify.geometry.coordinates[0];
      let coordinates = points.map(point => {
        return {
          lng: point[0],
          lat: point[1]
        };
      });
      let coordinates1 = points.map(point => {
        return point.join(' ');
      });
      str += `((${coordinates1.toString()})),`;
      array.push({coordinates: coordinates});
    });
    console.log(`(${str.substring(0, str.length - 1)})`);
    console.log(JSON.stringify(array));

    this._threadPool.termination();
    console.timeEnd('mergeUnit');
    this._resolve(array);
  }
};

export default ThreadMerge;

/**
 * 线程池
 */
class ThreadPool {
  /**
   * 构造方法
   * @param receive 完成响应
   * @param reject 失败响应
   * @param poolSize 线程池大小
   */
  constructor(receive, reject, poolSize = 4) {
    this._threads = []; // 线程池
    this._poolSize = poolSize; // 线程池大小 对于CPU密集型计算场景，最佳线程数 = CUP核数，可+1。
    this._tasks = []; // 任务队列
    this._count = 0; // 当前正在处理的任务数

    for (let i = 0; i < this._poolSize; i++) {
      const worker = new MergeWorker();
      worker.onmessage = (event) => {
        this._threads.push(worker);
        this._next();
        if (receive) {
          receive(event.data);
        }
      };
      worker.onerror = (e) => {
        console.error('worker运行异常: ' + e.stack);
      };
      this._threads.push(worker);
    }
  }

  /**
   * 提交执行任务
   * @param data 多边形数组
   */
  execute(data) {
    this._count++;
    if (this._threads.length > 0) {
      let worker = this._threads.pop();
      worker.postMessage(data);
    } else {
      this._tasks.push(data);
    }
  }

  /**
   * 下一个任务
   * @private
   */
  _next() {
    this._count--;
    if (this._tasks.length > 0) {
      let worker = this._threads.pop();
      worker.postMessage(this._tasks.shift());
    }
  }

  /**
   * 终止线程
   */
  termination() {
    this._threads.forEach(w => w.terminate());
  }

  /**
   * 获取当前执行任务数
   */
  getCount() {
    return this._count;
  }

  /**
   * 获取当前执行任务数
   */
  getPoolSize() {
    return this._poolSize;
  }
}
