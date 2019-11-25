<!--  -->
<template>
  <div>
    <h2>基础示例 basic</h2>
    <div class="des">用户可以在多个界面中同时操作同一个数据源</div>
    <div class="color-show">
      <div
        v-for="color in colors"
        v-dragging="{ list: colors, item: color, group: 'color' }"
        class="color-box"
        :style="{'background-color': color.text}"
        :key="color.text">
        {{color.name}}
      </div>
    </div>
    <div class="color-list">
      <div
        class="color-item"
        v-for="color in colors"
        v-dragging="{ list: colors, item: color, group: 'color' }"
        :key="color.text">
        {{color.name}}
      </div>
    </div>
    <button @click="test">change colors</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        colors: [
          {text: "Aquamarine", name:'1'},
          {text: "Hotpink", name:'2'},
          {text: "Gold", name:'3'},
          {text: "Crimson", name:'4'},
          {text: "Blueviolet", name:'5'},
          {text: "Lightblue", name:'6'},
          {text: "Cornflowerblue", name:'7'},
          {text: "Skyblue", name:'8'}
        ]
      }
    },
    mounted(){
    },
    methods: {
      test: function () {
        this.colors = [
          {text: "Aquamarine"},
          {text: "Hotpink"},
          {text: "Gold"},
          {text: "Crimson"},
          {text: "Blueviolet"},
          {text: "Lightblue"},
          {text: "Cornflowerblue"},
          {text: "Skyblue"},
          {text: "Burlywood"}
        ]
      }
    }
  }
</script>

<style scoped>
  body {
    font-family: Helvetica, sans-serif
  }

  h2 {
    margin-bottom: 10px;
  }

  .des {
    margin-bottom: 10px;
  }

  .playground {
    display: flex;
    margin-top: 4rem;
  }

  .color-item {
    background: #f5f5f5;
    padding: .5rem;
    color: #5f5f5f;
    transition: transform .3s;
  }

  .color-item.dragging {
    background-color: #fff;
  }

  .color-show {
    display: flex;
    flex-wrap: wrap;
    width: 30rem;
  }

  .color-box {
    width: 33%;
    height: 6rem;
    background: #efefef;
    line-height: 6rem;
    text-align: center;
    color: #fff;
    transition: transform .3s;
  }

  .color-box.dragging {
    transform: scale(1.1);
  }

  .other-group,
  .multi-group {
    margin-left: 20px;
  }

  .multi-group .color-box {
    position: relative;
    box-sizing: border-box;
  }

  .multi-group .color-box:hover {
    border: 2px solid #fff;
  }

  .multi-group .color-box .multi-group-btn {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 20px;
    height: 20px;
    line-height: 20px;
    border: 1px solid #fff;
  }

  .in-out-translate-fade-enter-active, .in-out-translate-fade-leave-active {
    transition: all .5s;
  }

  .in-out-translate-fade-enter, .in-out-translate-fade-leave-active {
    opacity: 0;
  }

  .in-out-translate-fade-enter {
    transform: translate3d(100%, 0, 0);
  }

  .in-out-translate-fade-leave-active {
    transform: translate3d(-100%, 0, 0);
  }
</style>
