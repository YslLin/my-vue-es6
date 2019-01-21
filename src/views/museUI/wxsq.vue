<template>
  <div>
    <h1>微信授权</h1>
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
          <mu-list-item-title>获取code</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="2">
          <mu-list-item-action>
            <mu-icon value="inbox" color="blue"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>通过code获取access_token</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="3">
          <mu-list-item-action>
            <mu-icon value="chat" color="green"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>刷新access_token</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :value="4">
          <mu-list-item-action>
            <mu-icon value="email" color="cyan"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>拉取用户信息</mu-list-item-title>
        </mu-list-item>
      </mu-list>
    </mu-bottom-sheet>
    ------------code---------------<br/>
    code:{{code}}<br/>
    state:{{state}}<br/>
    ------------access_token---------------<br/>
    access_token:{{access_token}}<br/>
    expires_in:{{expires_in}}<br/>
    refresh_token:{{refresh_token}}<br/>
    openid:{{openid}}<br/>
    scope:{{scope}}<br/>
    ------------unionId---------------<br/>
    nickname:{{nickname}}<br/>
    sex:{{sex === 1 ? '男' : sex === 2 ? '女' : ''}}<br/>
    province:{{province}}<br/>
    city:{{city}}<br/>
    country:{{country}}<br/>
    headimgurl:<img :src="headimgurl"/><br/>
    privilege:{{privilege}}<br/>
    unionid:{{unionid}}<br/>
  </div>
</template>

<script>
  export default {
    name: "museUI",
    data() {
      return {
        open: false,
        appId: 'wx77233474609dcf12',
        appSecret: '30e04263641a6722817aa3791028a81d',
        code: '',
        state: '',
        access_token: '', // 网页授权接口调用凭证
        expires_in: '', // access_token接口调用凭证超时时间
        refresh_token: '', // 用户刷新access_token
        openid: '', // 用户唯一标识
        scope: '', // 用户授权的作用域
        nickname: '', // 用户昵称
        sex: '', // 性别
        province: '', // 省份
        city: '', // 城市
        country: '', // 国家
        headimgurl: '', // 用户头像
        privilege: '', // 用户特权信息
        unionid: '', //
      };
    },
    mounted() {
      this.code = this.$route.query.code;
      this.state = this.$route.query.state;
    },
    methods: {
      getCode() {
        const local = window.location.href;
        window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.appId}&redirect_uri=${encodeURIComponent(local)}&response_type=code&scope=snsapi_userinfo&state=1234#wechat_redirect`
      },
      getAccessToken() {
        // 前端获取
        // this.$axios.get(
        //   `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${this.code}&grant_type=authorization_code`
        // ).then(response => {
        //   console.log(response);
        // }).catch((e) => {
        //   console.error(e);
        // })

        // 调用后端接口获取
        this.$axios.post(
          `http://10.10.12.131:8080/getAccessToken?code=${this.code}&state=${this.state}`
        ).then(response => {
          let data = response.data;
          this.access_token = data.access_token;
          this.expires_in = data.expires_in;
          this.refresh_token = data.refresh_token;
          this.openid = data.openid;
          this.scope = data.scope;
        }).catch((e) => {
          console.error(e);
        })
      },
      refreshToken() {
        this.$axios.post(
          `http://10.10.12.131:8080/refreshToken?refreshToken=${this.refresh_token}`
        ).then(response => {
          console.log(response);
          let data = response.data;
          this.access_token = data.access_token;
          this.expires_in = data.expires_in;
          this.refresh_token = data.refresh_token;
          this.openid = data.openid;
          this.scope = data.scope;
        }).catch((e) => {
          console.error(e);
        })
      },
      getUserInfo() {
        this.$axios.post(
          `http://10.10.12.131:8080/getUserInfo?accessToken=${this.access_token}&openId=${this.openid}`
        ).then(response => {
          console.log(response);
          let data = response.data;
          this.nickname = data.nickname; // 用户昵称
          this.sex = data.sex; // 性别
          this.province = data.province; // 省份
          this.city = data.city; // 城市
          this.country = data.country; // 国家
          this.headimgurl = data.headimgurl; // 用户头像
          this.privilege = data.privilege; // 用户特权信息
          this.unionid = data.unionid; //
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
            this.getAccessToken();
            break;
          case 3:
            this.refreshToken();
            break;
          case 4:
            this.getUserInfo();
            break;
        }
      },
      openBotttomSheet() {
        this.open = true;
      },
      aa() {
        async function wxAuth(req, res) {
          //解析querystring获取URL中的code值
          let code = req.query.code;
          //通过拿到的code和appID、app_serect获取返回信息
          let resObj = await getAccessToken(code);
          //解析得到access_token和open_id
          let access_token = resObj.access_token;
          let open_id = resObj.openid;
          //通过上一步获取的access_token和open_id获取userInfo即用户信息
          let userObj = await getUserInfo(access_token, open_id);
          console.log(userObj);
          res.render(path.resolve(__dirname, 'userInfo.ejs'), {userObj: userObj});
          // res.send(userObj);}

//通过拿到的code和appID、app_serect获取access_token和open_id
          function getAccessToken(code) {
            return new Promise((resolve, reject) => {
              let getAccessUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=` + `${appID}&secret=${appSerect}&code=$[code]&grant_type=authorization_code`;
              https.get(getAccessUrl, (res) => {
                var resText = "";
                res.on('data', (d) => {
                  resText += d;
                });
                res.on('end', () => {
                  var resObj = JSON.parse(resText);
                  resolve(resObj);
                });
              }).on('error', (e) => {
                console.error(e);
              });
            });
          }

//通过上一步获取的access_token和open_id获取userInfo即用户信息
          function getUserInfo(access_token, open_id) {
            return new Promise((resolve, reject) => {
              let getUserUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${open_id}⟨=zh_CN`;
              https.get(getUserUrl, (res) => {
                var resText = "";
                res.on('data', (d) => {
                  resText += d;
                });
                res.on('end', () => {
                  var userObj = JSON.parse(resText);
                  resolve(userObj);
                });
              }).on('error', (e) => {
                console.error(e);
              });
            })
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
