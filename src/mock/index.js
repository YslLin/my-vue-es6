import Mock from 'mockjs'
import login from './login'

let data = [].concat(login);

data.forEach(function(res){
    Mock.mock(res.path, res.data)
});

export default Mock
