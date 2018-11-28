var data = {
  'markers|1000': [
    {
      'lng': '@float(80,128,5,6)',
      'lat': '@float(20,50,5,6)',
      'count': '@integer(1,20)',
    }
  ],
  'lines|1000': [
    {
      'lng': '@float(80,128,5,6)',
      'lat': '@float(20,50,5,6)',
      'lng2': '@float(80,128,5,6)',
      'lat2': '@float(20,50,5,6)',
      'count': '@integer(1,20)',
    }
  ]
}

export default [{
  path: '/addTest',
  data: data
}]
