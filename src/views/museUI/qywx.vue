<template>
  <div>
    <h1>企业微信授权</h1>
    <mu-flex justify-content="center">
      <mu-button @click="openBotttomSheet">OPEN Bottom Sheet</mu-button>
    </mu-flex>
    <mu-bottom-sheet :open.sync="open">
      <mu-list @item-click="closeBottomSheet">
        <mu-sub-header>Select One</mu-sub-header>
        <mu-list-item button :value="1">
          <mu-list-item-action>
            <mu-icon value="grade" color="orange"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>内置浏览器非静默授权</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="2">
          <mu-list-item-action>
            <mu-icon value="inbox" color="blue"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>获取访问用户身份</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="3">
          <mu-list-item-action>
            <mu-icon value="chat" color="green"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>读取成员信息</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="4">
          <mu-list-item-action>
            <mu-icon value="email" color="cyan"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>拉取用户信息</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="5">
          <mu-list-item-action>
            <mu-icon value="backup" color="red"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>open 转 user</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="6">
          <mu-list-item-action>
            <mu-icon value="build" color="teal"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>user 转 open</mu-list-item-title>
        </mu-list-item>
      </mu-list>
    </mu-bottom-sheet>
    ------------code---------------<br/>
    code:{{code}}<br/>
    ------------access_token---------------<br/>
    access_token:{{access_token}}<br/>
    expires_in:{{expires_in}}<br/>
    ------------unionId---------------<br/>
    UserId:{{UserId}}<br/>
    OpenId:{{OpenId}}<br/>
    DeviceId:{{DeviceId}}<br/>
    ------------userInfo---------------<br/>
    userInfo:{{userInfo}}<br/>
  </div>
</template>

<script>
  export default {
    name: "museUI",
    data() {
      return {
        open: false,
        appId: 'wwe4cade058d663367',
        appSecret: 'KvXxlE_j_f3F52NhyTMzhBMZJ-pg35YlbgJhbeyXqoI',
        code: '_CUhHOLWpawKZ1UFr2zGSgwADwz9EOvlTdKcVYM2Ido',
        access_token: '', // 网页授权接口调用凭证
        expires_in: '', // access_token接口调用凭证超时时间
        UserId: '', // 成员UserID。若需要获得用户详情信息
        OpenId: '', // 非企业成员的标识，对当前企业唯一
        DeviceId: '', // 手机设备号(由企业微信在安装时随机生成，删除重装会改变，升级不受影响)
        userInfo: {},
        api: {
          getUserInfo: encodeURIComponent('www.yslshu.top'),
          authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?response_type=code&appid='
        }
      }
    },
    mounted() {
      this.api.authorize += this.appId;
    },
    methods: {
      urlJoint(url, params = {}){
        let _url = url;
        for (let key in params){
          _url += `&${key}=${params[key]}`;
        }
        return _url+'#wechat_redirect';
      },
      getCode() {
        let params = {
          'scope': 'snsapi_base',
          'state': '企业微信',
          'redirect_uri': this.api.getUserInfo
        };
        alert(this.urlJoint(this.api.authorize, params));
        window.location.href = this.urlJoint(this.api.authorize, params);
      },
      getUserId() {
        this.$axios.post(
          `http://10.10.12.131:8080/getUserId?code=${this.code}`
        ).then(response => {
          console.log(response);
          let data = response.data;
          if (data.errcode === 0) {
            if (data['UserId']) { // 企业员工
              this.UserId = data.UserId;
            } else if (data['UserId']) { // 非企业员工
              this.OpenId = data.OpenId;
            }
            this.DeviceId = data.DeviceId;
          } else {
            console.log(data.errmsg);
          }
        }).catch((e) => {
          console.error(e);
        })
      },
      getUserInfo() {
        if(!this.UserId) return alert('用户非本公司成员');
        this.$axios.post(
          `http://10.10.12.131:8080/getUserInfo1?userId=${this.UserId}`
        ).then(response => {
          console.log(response);
          let data = response.data;
          if (data.errcode === 0) {
            this.userInfo = data;
          } else {
            console.log(data.errmsg);
          }
        }).catch((e) => {
          console.error(e);
        })
      },
      openToUser() {
        this.$axios.post(
          `http://10.10.12.131:8080/openToUser?accessToken=${this.access_token}&openId=${this.OpenId}`
        ).then(response => {
          console.log(response);
          let data = response.data;
          if (data.errcode === 0) {
            this.UserId = data.userid;
          } else {
            console.log(data.errmsg);
          }
        }).catch((e) => {
          console.error(e);
        })
      },
      userToOpen() {
        this.$axios.post(
          `http://10.10.12.131:8080/userToOpen?accessToken=${this.access_token}&userId=${this.UserId}`
        ).then(response => {
          console.log(response);
          let data = response.data;
          if (data.errcode === 0) {
            this.OpenId = data.openid;
          } else {
            console.log(data.errmsg);
          }
        }).catch((e) => {
          console.error(e);
        })
      },
      closeBottomSheet(e) {
        this.open = false;
        switch (e.value) {
          case 1:
            this.getCode();
            break;
          case 2:
            this.getUserId();
            break;
          case 3:
            this.getUserInfo();
            break;
          case 4:
            this.getUserInfo();
            break;
          case 5:
            this.openToUser();
            break;
          case 6:
            this.userToOpen();
            break;
        }
      },
      openBotttomSheet() {
        this.open = true;
      }
    }
  }
</script>

<style scoped>

</style>
