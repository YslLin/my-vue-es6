<!--  -->
<template>
  <div>
    <input type="text" v-model="value"/>
    <Button @click="start">start</Button>
    <Button @click="stop">销毁</Button>
    <Button @click="ale">alert</Button>
    <Button @click="init">init</Button>
    <Button @click="threadMerge">threadMerge</Button>
  </div>
</template>

<script>
  import baseT from './js/base'
  import Worker from './js/MergeWorker'
  import ThreadMerge from './js/ThreadMerge'

  export default {
    data() {
      return {
        workers: [],
        value: '',
        results: [],
        fruits: [],
      }
    },
    mounted() {
      // this.init1();
      // this.unionDis(data3);
    },
    methods: {
      /**
       * 多线程合并
       */
      threadMerge() {
        new ThreadMerge().start(baseT).then(data => {
          // console.log('多线程合并完成: '+ JSON.stringify(data));
        }).catch(e => {
          console.error('多线程区域合并异常: ' + e.stack);
        })
      },
      init() {
        console.time('mergeUnit');
        this.workerUnion(baseT).then(results => {
          console.timeEnd('mergeUnit');
          let array = [];
          results.forEach(item => {
            let coor = item.geometry.coordinates[0];
            let coordinates = coor.map(coorItem => {
              return {
                lng: coorItem[0],
                lat: coorItem[1]
              };
            });
            array.push({coordinates: coordinates});
          });
          // console.log(JSON.stringify(results));
          // console.log(JSON.stringify(array));
        });
      },
      /**
       * 多线程处理区域合
       * @param polygons 区域数据
       * @param maxNum 最大递归执行次数
       * @returns {Promise<any>}
       */
      workerUnion(polygons = [], maxNum = 50) {
        return new Promise((resolve, reject) => {
          // 数据总数, 每500条数据开启一个线程
          const count = polygons.length, threadSize = 60;
          // 线程数
          let threadNum = count % threadSize === 0 ? count / threadSize : parseInt(count / threadSize + 1);

          // , 结果集
          let j = threadNum, results = [];
          /* 线程处理 */
          for (let i = 0; i < threadNum; i++) {
            let sList = polygons.splice(0, threadSize);
            const worker = new Worker();
            worker.postMessage(sList);
            worker.onmessage = (event) => {
              let data = event.data;
              data && (results.push(...data));
              console.log('count: ' + j);
              // 所有线程处理完毕
              if (--j === 0) {
                console.log('results size: ' + results.length);
                // 结果集可分批处理 并且 递归未到最大次数
                if (results.length > threadSize && maxNum > 0) {
                  console.log('---递归---');
                  this.workerUnion(results, --maxNum).then(ref => {
                    //关闭线程
                    worker.terminate();
                    resolve(ref);
                  });
                } else {
                  console.log('---整合---');
                  resolve(results);
                }
              } else if (j < 0) {
                // 最终整合处理完毕
                console.log('---完成---');
                //关闭线程
                worker.terminate();
                resolve(data);
              } else {
                //关闭线程
                worker.terminate();
              }
            };
          }
        });
      },
      start() {
        console.log('开起worker线程');
        console.log(this.worker);
        this.worker.postMessage(baseT);
      },
      stop() {
        console.log('关闭worker线程');
        this.worker.terminate();
      },
      ale() {
        alert("i'm a dialog");
      }
    }
  }
</script>

<style scoped>

</style>
