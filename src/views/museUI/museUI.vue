<template>
  <div>
    <mu-flex justify-content="center">
      <mu-button @click="openBotttomSheet">OPEN Bottom Sheet</mu-button>
    </mu-flex>
    <mu-bottom-sheet :open.sync="open">
      <mu-list @item-click="closeBottomSheet">
        <mu-sub-header>Select One</mu-sub-header>
        <mu-list-item button>
          <mu-list-item-action>
            <mu-icon value="grade" color="orange"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>Star</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button>
          <mu-list-item-action>
            <mu-icon value="inbox" color="blue"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>Inbox</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button>
          <mu-list-item-action>
            <mu-icon value="chat" color="green"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>Chat</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button>
          <mu-list-item-action>
            <mu-icon value="email" color="cyan"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>Email</mu-list-item-title>
        </mu-list-item>
      </mu-list>
    </mu-bottom-sheet>
  </div>
</template>

<script>
  export default {
    name: "museUI",
    data() {
      return {
        open: false
      };
    },
    methods: {
      closeBottomSheet() {
        this.open = false;
      },
      openBotttomSheet() {
        this.open = true;
      }
    }
  }
</script>

<style scoped>

</style>
