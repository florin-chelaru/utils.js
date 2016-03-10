/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 3/4/2016
 * Time: 11:33 PM
 */

var perf = function(label1, func1, label2, func2, nruns) {
  var i, t0, t1;
  var ret = [];
  t0 = new Date();
  for (i = 0; i < nruns; ++i) {
    func1.call(null);
  }
  t1 = new Date();

  ret.push((t1 - t0) / nruns);


  t0 = new Date();
  for (i = 0; i < nruns; ++i) {
    func2.call(null);
  }
  t1 = new Date();

  ret.push((t1 - t0) / nruns);

  var r = {};
  r[label1] = ret[0];
  r[label2] = ret[1];

  return r;
};

window.onload = function() {
  var x = new Array(1000000);
  for (var i = 0; i < x.length; ++i) { x[i] = Math.random(); }
  var y = new Array(1000000);
  for (var j = 0; j < y.length; ++j) { y[j] = Math.random(); }

  /*console.info(perf(
    'Array.prototype.map',
    function() { x.map(function(d) { return d + 1; }); },
    'u.fast.map',
    function() { u.fast.map(x, function(d) { return d + 1; }); },
    50
  ));*/

  /*console.info(perf(
    'Array.prototype.concat',
    function() { var y = [x, x, x, x, x].reduce(function(x1, x2) { return x1.concat(x2); }); },
    'u.fast.concat',
    function() { var y = u.fast.concat([x, x, x, x, x]); },
    100
  ));*/

  /*console.info(perf(
    'Array.prototype.concat+Array.prototype.reduce',
    function() { var z = [x, y, x, y, x].reduce(function(x1, x2) { return x1.concat(x2); }); },
    'u.fast.concatPush',
    function() { var z = u.fast.concatPush([x, y, x, y, x]); },
    100
  ));*/

  /*console.info(perf(
    'Array.prototype.concat',
    function() { var z = x.concat(y); },
    'u.fast.concat',
    function() { var z = u.fast.concat([x, y]); },
    300
  ));*/

  /*console.info(perf(
    'u.fast.concatPush',
    function() { var y = u.fast.concatPush([x, x, x, x, x]); },
    'u.fast.concat',
    function() { var y = u.fast.concat([x, x, x, x, x]); },
    100
  ));

  console.info(perf(
    'u.fast.concatNative',
    function() { var y = u.fast.concatNative([x, x, x, x, x]); },
    'u.fast.concat',
    function() { var y = u.fast.concat([x, x, x, x, x]); },
    100
  ));

  console.info(perf(
    'u.fast.concatNative',
    function() { var y = u.fast.concatNative([x, x, x, x, x]); },
    'Array.prototype.concat',
    function() { var y = [x, x, x, x, x].reduce(function(x1, x2) { return x1.concat(x2); }); },
    100
  ));*/

  console.info(perf(
   'Array.prototype.filter',
   function() { var z = x.filter(function(item) { return item < 0.5; }); },
   'u.fast.filter',
   function() { var z = u.fast.filter(x, function(item) { return item < 0.5; }); },
   50
   ));
};

