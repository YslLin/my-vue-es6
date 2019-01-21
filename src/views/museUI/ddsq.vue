<template>
  <div>
    <h1>钉钉授权</h1>
    <mu-flex justify-content="center">
      <mu-button @click="openBotttomSheet">授权方式</mu-button>
    </mu-flex>
    <mu-flex justify-content="center">
      <!--内嵌钉钉扫码登录的二维码容器-->
      <div id="login_container"></div>
      <!--<ddlogin-script :src="goto"></ddlogin-script>-->
      <remote-script src="https://g.alicdn.com/dingding/dinglogin/0.0.5/ddLogin.js"></remote-script>
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
          <mu-list-item-title>外部扫一扫登录</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="3">
          <mu-list-item-action>
            <mu-icon value="chat" color="green"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>内部扫一扫登录</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="4">
          <mu-list-item-action>
            <mu-icon value="email" color="cyan"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>账号密码登录</mu-list-item-title>
        </mu-list-item>
      </mu-list>
    </mu-bottom-sheet>
    ------------userInfo---------------<br/>
    userInfo:{{userInfo}}<br/>
  </div>
</template>

<script>
  import Cookies from 'js-cookie';

  export default {
    name: "museUI",
    data() {
      return {
        open: false,
        appId: 'dingoaerqz4vnyaevmzrhn',
        appSecret: 'J0NkQpyN5qvvKvlIGeE3w5VV_rWAX5-1aSHmYyrdHduQ-RDAV5YVEfvug4l9Bz5t',
        api:{
          getUserInfo: encodeURIComponent('http://10.10.12.131:8080/getUserInfoByCode'),
          auth: 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?response_type=code&appid=',
          login: 'https://oapi.dingtalk.com/connect/qrconnect?response_type=code&appid=',
          authorize: 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?response_type=code&appid='
        },
        userInfo: {
          nick: '',
          unionid: '',
          openid: ''
        }
      }
    },
    mounted() {
      this.api.auth += this.appId;
      this.api.login += this.appId;
      this.api.authorize += this.appId;
      this.userInfo.nick = Cookies.get('nick');
      this.userInfo.unionid = Cookies.get('unionid');
      this.userInfo.openid = Cookies.get('openid');
      console.log(this.userInfo);
    },
    methods: {
      urlJoint(url, params = {}){
        let _url = url;
        for (let key in params){
          _url += `&${key}=${params[key]}`;
        }
        return _url;
      },
      toAuth() {
        let params = {
          'scope': 'snsapi_auth',
          'state': '钉钉',
          'redirect_uri': this.api.getUserInfo
        };
        window.location.href = this.urlJoint(this.api.auth, params);
      },
      openDingtalk() {
        let params = {
          'scope': 'snsapi_login',
          'state': '123',
          'redirect_uri': this.api.getUserInfo
        };
        window.location.href = this.urlJoint(this.api.login, params);
      },
      getDingtalk() {
        let params = {
          'scope': 'snsapi_login',
          'state': '钉钉',
          'redirect_uri': this.api.getUserInfo
        };
        let goto = this.urlJoint(this.api.auth, params);
        DDLogin({
          id: "login_container",
          goto: encodeURIComponent(goto),
          style: "border:none;background-color:#FFFFFF;",
          width: "300",
          height: "320"
        });

        let hanndleMessage = function (event) {
          let origin = event.origin;
          console.log("origin", event.origin);
          if (origin === "https://login.dingtalk.com") { // 判断是否来自ddLogin扫码事件
            let loginTmpCode = event.data; // 拿到loginTmpCode后就可以在这里构造跳转链接进行跳转了
            console.log("loginTmpCode", loginTmpCode);
            window.location.href = `${goto}&loginTmpCode=${loginTmpCode}`
          }
        };
        window.removeEventListener('message', hanndleMessage);
        window.addEventListener('message', hanndleMessage, false);
      },
      openAuthorize() {
        let params = {
          'scope': 'snsapi_login',
          'state': '123',
          'redirect_uri': this.api.getUserInfo
        };
        window.location.href = this.urlJoint(this.api.authorize, params);
      },
      closeBottomSheet(e) {
        this.open = false;
        switch (e.value) {
          case 1:
            this.toAuth();
            break;
          case 2:
            this.openDingtalk();
            break;
          case 3:
            this.getDingtalk();
            break;
          case 4:
            this.openAuthorize();
            break;
        }
      },
      openBotttomSheet() {
        this.open = true;
      }
    },
    components: {
      'remote-script': {
        render: function (createElement) {
          let self = this;
          return createElement('script', {
            attrs: {
              type: 'text/javascript',
              src: this.src
            },
            on: {
              // 渲染函数 render 中-你必须自己实现相应的逻辑
              // 即触发该组件使用者添加的事件
              load: function (event) {
                self.$emit('load', event);
              },
              error: function (event) {
                self.$emit('error', event);
              },
              readystatechange: function (event) {
                // complete: 对象已经加载完毕
                if (this.readyState === 'complete') {
                  console.log(1);
                  self.$emit('load', event);
                }
              }
            }
          });
        },
        props: {
          src: {
            type: String,
            required: true
          }
        }
      },
      'ddlogin-script': {
        render: function (createElement) {
          return createElement('iframe', {
            attrs: {
              frameBorder: '0',
              allowTransparency: 'true',
              scrolling: 'no',
              width: this.width + 'px',
              height: this.height + 'px',
              src: 'https://login.dingtalk.com/login/qrcode.htm?goto=' + encodeURIComponent(this.src)
            }
          });
        },
        props: {
          src: {
            type: String,
            required: true
          },
          width: {
            type: Number,
            default: 365
          },
          height: {
            type: Number,
            default: 400
          }
        }
      }
    }
  }

</script>

<style scoped>

</style>
