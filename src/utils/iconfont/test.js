(function (window) {
  var svgSprite = '<svg><symbol id="dzfd-icon-arrowshrink" viewBox="0 0 1024 1024"><path d="M896 184.6 732.2 348.2 832 448 576 448 576 192 675.8 291.8 839.4 128Z"  ></path><path d="M896 839.4 732.2 675.8 832 576 576 576 576 832 675.8 732.2 839.4 896Z"  ></path><path d="M128 839.4 291.8 675.8 192 576 448 576 448 832 348.2 732.2 184.6 896Z"  ></path><path d="M128 184.6 291.8 348.2 192 448 448 448 448 192 348.2 291.8 184.6 128Z"  ></path></symbol></svg>';
  var ready = function (fn) {
      var loadFn = function () {
        document.removeEventListener("DOMContentLoaded", loadFn, false);
        window.yslfn = fn;
        fn()
      };
      document.addEventListener("DOMContentLoaded", loadFn, false)
  };
  var before = function (el, target) {
    target.parentNode.insertBefore(el, target)
  };

  function appendSvg() {
    var div, svg;
    div = document.createElement("div");
    div.innerHTML = svgSprite;
    svg = div.getElementsByTagName("svg")[0];
    svg.style.position = "absolute";
    before(svg, document.body.firstChild)
  }
  ready(appendSvg)
})(window)
