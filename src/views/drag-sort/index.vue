<!--  -->
<template>
  <div>
    <div id="app">
      <div class="box">
        <ul ref='parant'>
          <li v-for="(item, index) in items" draggable='true' @dragstart='drag($event)' @drop='drop($event)'
              @dragover='allowDrop($event)'>
            {{item.num}}--{{item.txt}}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        items: [
          {num: 1, txt: '内容1'},
          {num: 2, txt: '内容2'},
          {num: 3, txt: '内容3'},
          {num: 4, txt: '内容4'},
          {num: 5, txt: '内容5'},
          {num: 6, txt: '内容6'}
        ],
        moveDom: '',
        changeDom: '',
        startY: 0,
        endY: 0
      }
    },
    methods: {
      drag(event) { //start
        this.moveDom = event.currentTarget
        this.startY = event.clientY
      },
      drop(event) { //end
        event.preventDefault();
        this.changeDom = event.currentTarget
        this.endY = event.clientY
        if (this.endY - this.startY >= 0) {
          console.log('xia')
          this.$refs.parant.insertBefore(this.moveDom, this.changeDom.nextSibling)
        } else {
          console.log('shang')
          this.$refs.parant.insertBefore(this.moveDom, this.changeDom)
        }
      },
      allowDrop(event) { //moving
        event.preventDefault()
        this.endY = event.clientY
        this.changeDom = event.currentTarget
        if (this.endY - this.startY >= 0) {
          console.log('xia')
          this.$refs.parant.insertBefore(this.moveDom, this.changeDom.nextSibling)
        } else {
          console.log('shang')
          this.$refs.parant.insertBefore(this.moveDom, this.changeDom)
        }
      }
    }
  }
</script>

<style scoped>
  * {
    padding: 0;
    margin: 0;
  }

  .box {
    width: 60%;
    height: auto;
    margin: 50px auto 0;

  }

  ul li {
    position: relative;
    padding: 10px 0;
    border: 1px solid #000000;
    text-align: center;
    list-style: none;
  }
</style>
