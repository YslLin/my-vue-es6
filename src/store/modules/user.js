
const user = {
  state: {
    headImgPath: ''
  },
  mutations: {
    setHeadImgPath (state, value) {
      localStorage.headImgPath = value
    }
  }
}

export default user
