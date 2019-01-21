
const memoryLeak = {
  state: {
    arr: [1,2,3,4,5,6,7,8,9],
    str: '1,2,3,4,5,6,7,8,9'
  },
  mutations: {
    setArr (state, value) {
      state.arr = value;
    },
    setStr (state, value) {
      state.arr = value;
    }
  }
};

export default memoryLeak;
