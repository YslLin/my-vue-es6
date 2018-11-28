<!--  -->
<template>
  <div>
    <div style="margin-top: 5px;margin-left: 5px">
      <Select v-model="companyId" :label="label" style="width:200px"  @on-change="query" >
        <Option v-for="item in companyList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Button type="primary" @click="query">查询</Button>
      <Button type="success" @click="download">下载</Button>
      <Table id="out-table" stripe height="586" :columns="columns1" :data="list"
             style="margin-top: 10px;margin-right: 5px"></Table>
    </div>
  </div>
</template>

<script>
  import XLSX from 'xlsx'
  import FileSaver from 'file-saver'
  import {ClipperLib, GeoJSON} from '../baidu-map/util/Plugin'

  export default {
    name: 'index',
    data() {
      return {
        companyId: '',
        label: '',
        companyList: [
          {
            value: '-1',
            label: '所有分公司'
          },
          {
            value: '0',
            label: '总公司'
          },
          {
            value: '1',
            label: '北京分公司'
          },
          {
            value: '20001',
            label: '上海分公司'
          },
          {
            value: '3',
            label: '四川分公司'
          },
          {
            value: '4',
            label: '河南分公司'
          },
          {
            value: '5',
            label: '山东分公司'
          },
          {
            value: '6',
            label: '江苏分公司'
          },
          {
            value: '7',
            label: '广东(广州)分公司'
          },
          {
            value: '8',
            label: '河北分公司'
          },
          {
            value: '9',
            label: '湖北分公司'
          },
          {
            value: '10',
            label: '深圳分公司'
          },
          {
            value: '11',
            label: '辽宁分公司'
          },
          {
            value: '12',
            label: '贵州分公司'
          },
          {
            value: '13',
            label: '陕西分公司'
          },
          {
            value: '14',
            label: '山西分公司'
          },
          {
            value: '15',
            label: '吉林分公司'
          },
          {
            value: '16',
            label: '内蒙古分公司'
          },
          {
            value: '17',
            label: '湖南分公司'
          },
          {
            value: '18',
            label: '广西分公司'
          },
          {
            value: '19',
            label: '安徽分公司'
          },
          {
            value: '20',
            label: '福建分公司'
          },
          {
            value: '21',
            label: '甘肃分公司'
          },
          {
            value: '22',
            label: '海南分公司'
          },
          {
            value: '23',
            label: '黑龙江分公司'
          },
          {
            value: '24',
            label: '江西分公司'
          },
          {
            value: '25',
            label: '宁夏分公司'
          },
          {
            value: '26',
            label: '天津分公司'
          },
          {
            value: '27',
            label: '新疆分公司'
          },
          {
            value: '28',
            label: '云南分公司'
          },
          {
            value: '29',
            label: '浙江分公司'
          },
          {
            value: '30',
            label: '重庆分公司'
          },
        ],
        columns1: [
          {
            title: 'ID',
            key: 'id'
          },
          {
            title: 'D_CODE',
            key: 'dCode'
          },
          {
            title: 'DC_CODE',
            key: 'dcCode'
          },
          {
            title: 'DC_NAME',
            key: 'dcName'
          },
          {
            title: 'AREA_ID',
            key: 'areaId'
          },
          {
            title: 'AREA_NAME',
            key: 'areaName'
          },
          {
            title: '面积',
            key: 'area'
          }
        ],
        list: [
          {
            id: 1,
            dCode: 'BS44-5',
            dcCode: 'BBS44',
            dcName: '北京_朝阳营业所_新华联营业厅',
            areaId: '1001',
            areaName: '测试区域1',
          },
          {
            id: 2,
            dCode: 'BS44-5',
            dcCode: 'BBS44',
            dcName: '北京_朝阳营业所_新华联营业厅',
            areaId: '1001',
            areaName: '测试区域3',
          },
          {
            id: 3,
            dCode: 'BS44-5',
            dcCode: 'BBS44',
            dcName: '北京_朝阳营业所_新华联营业厅',
            areaId: '1001',
            areaName: '测试区域3',
          },
        ]
      }
    },
    mounted() {
    },
    methods: {
      query() {
        if (!this.companyId) {
          this.$Modal.error({
            title: '提示框',
            content: '分公司ID不能为空'
          });
          return;
        }
        this.$Spin.show();
        this.$axios.post(
          'http://10.10.12.131:6555/v4/getDistributionCenter?companyId=' + this.companyId
        ).then(response => {
          let data1 = response.data.data;

          this.list = data1.filter(l => {
            const geo = GeoJSON.toGeoJSON(l.points);
            var area = turf.area(geo);
            if(area < 1000 && !ClipperLib.containKinks(geo)){
              l.area = area;
              return true
            }
            return false;
          });

          this.$Spin.hide();
        }).catch((e) => {
          console.error(e);
          this.$Spin.hide();
        })
      },
      download() {
        const defaultCellStyle = {
          font: {name: "Verdana", sz: 11, color: "FF00FF88"},
          fill: {fgColor: {rgb: "FFFFAA00"}}
        };
        const wopts = {
          bookType: 'xlsx',
          bookSST: false,
          type: 'binary',
          defaultCellStyle: defaultCellStyle,
          showGridLines: false
        };
        const wb = XLSX.utils.table_to_book(document.getElementById('out-table'));

        // 删除无效列
        let obj = wb['Sheets']['Sheet1'];
        for (let key in obj) {
          if (obj[key]['v'] === '暂无筛选结果') {
            delete wb['Sheets']['Sheet1'][key];
          }
        }

        //创建二进制对象写入转换好的字节流
        let tmpDown = new Blob([this.s2ab(XLSX.write(wb, wopts))], {type: "application/octet-stream"});
        const company = this.companyList.find(i => i.value == this.companyId);
        FileSaver.saveAs(tmpDown, company.label + "自相交区域.xlsx");
      },
      //字符串转字符流
      s2ab(s) {
        if (typeof ArrayBuffer !== 'undefined') {
          var buf = new ArrayBuffer(s.length);
          var view = new Uint8Array(buf);
          for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
          return buf;
        } else {
          var buf = new Array(s.length);
          for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
          return buf;
        }
      }
    }
  }
</script>

<style>

</style>
