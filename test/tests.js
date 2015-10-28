/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/7/2015
 * Time: 2:38 PM
 */

QUnit.test('Promise', function(assert) {
  var done = assert.async();
  assert.ok(Promise);

  var finished = false;

  var act = null;
  var exp = 'something';
  var p = new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve('something');
    }, 100);
  }).then(function(value) {
      if (!finished) {
        act = value;
        assert.equal(act, exp);
        finished = true;
        done();
      }
    });


  setTimeout(function() {
    assert.notOk(finished);
    assert.notOk(act);
  }, 50);

  setTimeout(function() {
    if (!finished) {
      assert.ok(finished, 'Timed out');
      if (!finished) {
        done();
        finished = true;
      }
    }
  }, 200);
});

QUnit.test('u.Exception', function(assert) {
  assert.ok(u.Exception);

  var inner = Error('another message');
  var e = new u.Exception('my message', inner);
  assert.equal(e.message, 'my message');
  assert.equal(e.name, 'Exception');
  assert.deepEqual(e.innerException, inner);
  assert.ok(e instanceof Error);
});

QUnit.test('u.AbstractMethodException', function(assert) {
  assert.ok(u.AbstractMethodException);

  var inner = Error('another message');
  var e = new u.AbstractMethodException('my message', inner);
  assert.equal(e.message, 'my message');
  assert.equal(e.name, 'AbstractMethodException');
  assert.deepEqual(e.innerException, inner);
  assert.ok(e instanceof Error);
});

QUnit.test('u.UnimplementedException', function(assert) {
  assert.ok(u.UnimplementedException);

  var inner = Error('another message');
  var e = new u.UnimplementedException('my message', inner);
  assert.equal(e.message, 'my message');
  assert.equal(e.name, 'UnimplementedException');
  assert.deepEqual(e.innerException, inner);
  assert.ok(e instanceof Error);
});

QUnit.test('u.TimeSpan', function(assert) {
  assert.ok(u.TimeSpan);

  var t = new u.TimeSpan(65432);
  assert.equal(t.days(), 0);
  assert.equal(t.hours(), 0);
  assert.equal(t.minutes(), 1);
  assert.equal(t.seconds(), 5);
  assert.equal(t.milliseconds(), 432);

  t = new u.TimeSpan(
    3 * 24 * 60 * 60 * 1000 +
    4 * 60 * 60 * 1000 +
    17 * 60 * 1000 +
    43 * 1000 +
    158);

  assert.equal(t.days(), 3);
  assert.equal(t.hours(), 4);
  assert.equal(t.minutes(), 17);
  assert.equal(t.seconds(), 43);
  assert.equal(t.milliseconds(), 158);

  assert.equal(u.math.floorPrecision(t.totalDays(), 2), 3.17);
  assert.equal(u.math.floorPrecision(t.totalHours(), 2), 3 * 24 + 4 + 0.29);
  assert.equal(u.math.floorPrecision(t.totalMinutes(), 2), 3 * 24 * 60 + 4 * 60 + 17 + 0.71);
  assert.equal(u.math.floorPrecision(t.totalSeconds(), 2), 3 * 24 * 60 * 60 + 4 * 60 * 60 + 17 * 60 + 43 + 0.15);
  assert.equal(t.totalMilliseconds(), 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 17 * 60 * 1000 + 43 * 1000 + 158);
});

QUnit.test('u.Geolocation', function(assert) {
  assert.ok(u.Geolocation);

  var g1 = new u.Geolocation(10, 20, 30, 40);
  var g2 = new u.Geolocation(10, 20, 30, 40);

  assert.ok(g1.equals(g2));
  assert.ok(g1.equals({lat: 10, lng: 20, zoom: 30, range: 40}));
});

QUnit.test('u.Event', function(assert) {
  var done = assert.async();
  assert.ok(u.Event);
  assert.ok(u.EventListener);

  var finished = false;
  var exp = {'a': 'b', 'x': 7, 9: 'z'};

  var e = new u.Event();
  e.addListener(function(obj) {
    assert.equal(obj, exp);
    finished = true;
    done();
  });

  e.fire(exp);

  setTimeout(function() {
    assert.ok(finished);
    if (!finished) { done(); }
  }, 100);
});

QUnit.test('u.each', function(assert) {
  assert.ok(u.each);

  var obj = {'a': 'x', 'b': 7, '9': 'f'};
  var expObj = [['9', 'f'], ['a', 'x'], ['b', 7]];
  var actObj = [];
  u.each(obj, function(k, v) { actObj.push([k, v]); });

  assert.deepEqual(actObj, expObj);

  var arr = ['x', 7, 'f'];
  var expArr = [[0, 'x'], [1, 7], [2, 'f']];
  var actArr = [];
  u.each(arr, function(i, v) { actArr.push([i, v]); });

  assert.deepEqual(actArr, expArr);
});

QUnit.test('u.map', function(assert) {
  assert.ok(u.map);

  var obj = {1: 'a', 'x': 'b', 'y': 2};
  var exp = ['a1', 'b1', 3];
  var act = u.map(obj, function(v) { return v + 1; });

  assert.deepEqual(act, exp);

  var arr = ['a', 'b', 2];
  act = u.map(arr, function(v) { return v + 1; });
  assert.deepEqual(act, exp);

  obj[4] = 5;
  exp = ['1a1', '451', 'xb1', 'y21'];
  act = u.map(obj, function(v, k) { return k + v + 1; });
  assert.deepEqual(act, exp);
});

QUnit.test('u.copy', function(assert) {
  assert.ok(u.copy);

  var obj = {1: 'a', 'x': 'b', 'y': 2};
  assert.deepEqual(u.copy(obj), obj);
  notEqual(u.copy(obj), obj);

  var arr = ['a', 'b', 2];
  assert.deepEqual(u.copy(arr), arr);
  notEqual(u.copy(arr), arr);
});

QUnit.test('u.extend', function(assert) {
  assert.ok(u.extend);

  var defaults = { name: 'John', age: 17, weight: 55 };
  var overrides = {name: 'Jack', age: 28, color: 'green' };
  var act = u.extend(defaults, overrides);

  var exp = { name: 'Jack', age: 28, weight: 55, color: 'green' };
  assert.deepEqual(act, exp);

  act = u.extend({}, defaults, overrides);
  assert.deepEqual(act, exp);
});

QUnit.test('u.generatePseudoGUID', function(assert) {
  assert.ok(u.generatePseudoGUID);

  assert.equal(u.generatePseudoGUID(6).length, 6);
  assert.equal(typeof u.generatePseudoGUID(6), 'string');
  assert.notOk(u.generatePseudoGUID(6) == u.generatePseudoGUID(6));
});

QUnit.test('u.httpGet', function(assert) {
  var done = assert.async();
  assert.ok(u.httpGet);

  var exp = '@transition-speed: 0.5s;\n' +
            '@light-gray: #ddd;\n' +
            '@medium-gray: #808080;\n' +
            '@dark-gray: #494949;\n' +
            '@transparent-light-gray: rgba(0, 0, 0, 0.025);\n' +
            '@transparent-gray: rgba(0, 0, 0, 0.05);\n' +
            '@transparent-dark-gray: rgba(0, 0, 0, 0.075);\n' +
            '@item-max-height: 120px;\n';

  u.httpGet('variables.less.txt')
    .then(
    function(act) {
      assert.equal(act, exp);
      done();
    },
    function(reason) {
      assert.notOk(reason);
      done();
    }
  );
});

QUnit.test('u.parseLessConsts', function(assert) {
  var done = assert.async();
  assert.ok(u.parseLessConsts);

  var exp = {
    'transition-speed':       '0.5s',
    'light-gray':             '#ddd',
    'medium-gray':            '#808080',
    'dark-gray':              '#494949',
    'transparent-light-gray': 'rgba(0, 0, 0, 0.025)',
    'transparent-gray':       'rgba(0, 0, 0, 0.05)',
    'transparent-dark-gray':  'rgba(0, 0, 0, 0.075)',
    'item-max-height':        '120px'
  };

  u.parseLessConsts({uri: 'variables.less.txt'})
    .then(function(act) {
      assert.deepEqual(act, exp);
      done();
    });
});

QUnit.test('u.array.range', function(assert) {
  assert.ok(u.array.range);

  assert.deepEqual(u.array.range(4), [0, 1, 2, 3]);
  assert.deepEqual(u.array.range(3, 4), [4, 5, 6]);
});

QUnit.test('u.array.fill', function(assert) {
  assert.ok(u.array.fill);

  var exp = [2, 2, 2];
  var act = u.array.fill(3, 2);
  assert.deepEqual(act, exp);
});

QUnit.test('u.array.fromArguments', function(assert) {
  ok(u.array.fromArguments);

  var params = [1, 'a', new u.Exception('my message')];
  var args = (function () {
    return arguments;
  })(params[0], params[1], params[2]);

  assert.deepEqual(params, u.array.fromArguments(args));
});

QUnit.test('u.array.unique', function(assert) {
  ok(u.array.unique);

  var e = new u.Exception('my message');
  var arr = [1, 'a', e, e, e, 'a', 7, 'a', 'b', 1, 12];
  var exp = [1, 'a', e, 7, 'b', 12];
  assert.deepEqual(u.array.unique(arr), exp);
});

QUnit.test('u.reflection.evaluateFullyQualifiedTypeName', function(assert) {
  assert.ok(u.reflection.evaluateFullyQualifiedTypeName);

  assert.deepEqual(u.reflection.evaluateFullyQualifiedTypeName('u.Exception'), u.Exception);
});

QUnit.test('u.reflection.applyConstructor', function(assert) {
  assert.ok(u.reflection.applyConstructor);

  var inner = Error('something');
  var act = u.reflection.applyConstructor(u.Exception, ['my new message', inner]);
  var exp = new u.Exception('my new message', inner);

  assert.ok(act instanceof u.Exception);
  assert.equal(act.message, 'my new message');
  assert.equal(act.innerException, inner);
});

QUnit.test('u.reflection.wrap', function(assert) {
  assert.ok(u.reflection.wrap);

  var Foo = function(x) { this.x = x; };
  Foo.prototype.bar = function() { return this.x; };

  var obj = {x: '10'};
  var wrapped = u.reflection.wrap(obj, Foo);

  //assert.ok(obj instanceof Foo);
  //assert.ok(obj.bar);
  //assert.equal(obj.bar(), '10');

  assert.notOk(obj instanceof Foo);
  assert.ok(wrapped instanceof Foo);
  assert.ok(wrapped.bar);
  assert.notOk(obj.bar);
  assert.equal(wrapped.bar(), '10');
  wrapped.x = 20;
  assert.equal(wrapped.x, 20);
  assert.equal(wrapped.x, obj.x);
});

QUnit.test('u.reflection.ReflectionException', function(assert) {
  assert.ok(u.reflection.ReflectionException);

  var inner = Error('another message');
  var e = new u.reflection.ReflectionException('my message', inner);
  assert.equal(e.message, 'my message');
  assert.equal(e.name, 'ReflectionException');
  assert.deepEqual(e.innerException, inner);
});

QUnit.test('u.string.capitalizeFirstLetter', function(assert) {
  assert.ok(u.string.capitalizeFirstLetter);

  assert.equal(u.string.capitalizeFirstLetter('test'), 'Test');
  assert.equal(u.string.capitalizeFirstLetter(''), '');
  assert.equal(u.string.capitalizeFirstLetter('12ab'), '12ab');
});

QUnit.test('u.math.floorPrecision', function(assert) {
  assert.ok(u.math.floorPrecision);

  assert.equal(u.math.floorPrecision(2.123456, 3), 2.123);
  assert.equal(u.math.floorPrecision(2.123456, 0), 2);
  assert.equal(u.math.floorPrecision(2.123456, 8), 2.123456);
});

var RAND = [0, 9, 1, 1, 8, 3, 8, 5, 6, 4, 9, 3, 2, 6, 4, 8, 2, 8, 0, 7, 0, 4, 9, 8, 6, 3, 1, 8, 4, 4, 2, 3, 0, 3, 9, 6, 2, 0, 1, 2, 7, 3, 1, 9, 1, 6, 2, 2, 3, 1, 9, 8, 8, 9, 2, 8, 4, 6, 2, 1, 6, 3, 3, 8, 4, 7, 0, 3, 5, 1, 4, 1, 3, 7, 2, 2, 9, 3, 3, 2, 9, 1, 7, 1, 4, 2, 5, 2, 0, 9, 3, 6, 0, 6, 3, 6, 9, 1, 0, 9, 3, 3, 4, 0, 1, 3, 3, 4, 9, 7, 6, 2, 7, 5, 0, 7, 8, 3, 5, 2, 5, 4, 1, 7, 5, 3, 4, 7, 8, 6, 1, 8, 8, 9, 1, 6, 0, 8, 9, 4, 3, 6, 0, 7, 5, 0, 5, 5, 0, 5, 8, 6, 0, 2, 6, 0, 4, 8, 6, 6, 5, 6, 4, 2, 7, 4, 5, 2, 0, 1, 4, 8, 3, 0, 3, 5, 9, 7, 9, 5, 4, 3, 5, 3, 4, 4, 3, 3, 6, 2, 5, 4, 3, 8, 1, 3, 8, 4, 4, 1, 0, 0, 5, 2, 5, 3, 5, 2, 8, 0, 6, 7, 5, 9, 3, 4, 3, 0, 5, 6, 0, 5, 2, 3, 2, 4, 3, 2, 4, 0, 5, 8, 6, 8, 6, 5, 3, 6, 6, 1, 4, 9, 8, 2, 5, 0, 1, 0, 3, 1, 1, 1, 3, 1, 2, 5, 5, 7, 3, 5, 2, 0, 9, 8, 5, 5, 8, 5, 4, 4, 0, 9, 0, 1, 2, 5, 1, 0, 6, 8, 9, 8, 0, 1, 0, 5, 5, 0, 0, 3, 7, 8, 2, 9, 6, 6, 7, 0, 3, 3, 1, 5, 2, 6, 2, 7, 1, 8, 5, 0, 8, 7, 7, 1, 6, 3, 6, 4, 0, 4, 8, 6, 9, 4, 3, 3, 2, 2, 3, 6, 2, 6, 4, 3, 0, 7, 7, 0, 3, 6, 2, 4, 5, 4, 8, 2, 6, 1, 0, 4, 8, 5, 8, 4, 2, 2, 6, 8, 6, 0, 8, 4, 2, 3, 3, 1, 0, 9, 0, 9, 6, 2, 0, 2, 2, 2, 2, 8, 7, 9, 2, 6, 7, 9, 7, 7, 0, 7, 7, 4, 1, 5, 9, 1, 8, 7, 1, 6, 2, 6, 1, 9, 2, 1, 5, 8, 1, 0, 0, 5, 6, 7, 8, 1, 5, 0, 4, 9, 3, 8, 6, 5, 1, 3, 5, 1, 4, 4, 9, 6, 2, 4, 3, 3, 9, 2, 0, 7, 0, 6, 1, 9, 4, 1, 8, 9, 0, 5, 8, 7, 4, 0, 6, 2, 8, 8, 4, 3, 3, 2, 9, 6, 4, 8, 3, 6, 2, 7, 0, 8, 5, 7, 1, 0, 1, 1, 8, 7, 3, 8, 9, 5, 0, 4, 9, 0, 5, 5, 3, 4, 5, 2, 3, 8, 1, 2, 3, 5, 5, 4, 5, 1, 7, 2, 6, 9, 3, 9, 9, 4, 6, 7, 5, 6, 1, 9, 8, 0, 8, 3, 3, 6, 4, 5, 7, 6, 5, 1, 9, 0, 8, 3, 8, 3, 5, 3, 7, 7, 4, 5, 4, 0, 8, 6, 8, 0, 4, 6, 6, 0, 5, 2, 1, 5, 9, 9, 8, 9, 1, 0, 2, 5, 5, 3, 6, 4, 4, 2, 3, 4, 2, 9, 4, 6, 3, 6, 8, 9, 9, 9, 1, 5, 6, 1, 2, 8, 0, 9, 7, 9, 4, 2, 9, 5, 0, 7, 8, 7, 5, 7, 3, 0, 2, 8, 4, 8, 0, 7, 3, 6, 0, 0, 5, 9, 6, 3, 1, 8, 3, 3, 1, 7, 9, 8, 2, 6, 7, 6, 2, 0, 2, 2, 8, 2, 1, 0, 9, 7, 6, 0, 6, 3, 2, 0, 5, 7, 2, 9, 6, 0, 1, 9, 1, 9, 3, 1, 4, 0, 1, 5, 6, 5, 7, 5, 0, 4, 3, 8, 8, 8, 5, 8, 3, 0, 6, 9, 9, 4, 9, 1, 8, 5, 2, 2, 5, 8, 2, 7, 3, 9, 6, 4, 8, 3, 3, 7, 9, 6, 3, 6, 5, 4, 2, 8, 4, 5, 3, 5, 3, 5, 2, 0, 9, 6, 4, 6, 3, 3, 3, 2, 9, 2, 7, 9, 8, 1, 3, 2, 2, 5, 5, 3, 0, 8, 5, 4, 9, 3, 3, 6, 1, 5, 8, 2, 1, 7, 1, 2, 4, 0, 8, 7, 0, 6, 0, 0, 2, 5, 4, 4, 2, 2, 1, 3, 8, 3, 9, 2, 9, 8, 4, 4, 5, 4, 2, 1, 6, 6, 8, 0, 8, 8, 2, 4, 9, 1, 6, 6, 0, 3, 0, 3, 7, 7, 8, 4, 0, 0, 3, 7, 0, 6, 5, 2, 8, 8, 0, 0, 2, 7, 7, 9, 2, 4, 6, 0, 8, 8, 6, 1, 8, 3, 3, 0, 7, 3, 4, 9, 9, 7, 7, 4, 2, 0, 2, 1, 0, 7, 5, 5, 5, 0, 1, 3, 3, 9, 8, 3, 4, 5, 3, 5, 4, 4, 3, 5, 4, 0, 3, 2, 5, 3, 4, 9, 5, 5, 0, 4, 9, 9, 8, 8, 6, 0, 8, 7, 7, 8, 0, 6, 4, 4, 5, 1, 1, 7, 8, 8, 0, 3, 1, 1, 6, 6, 4, 0, 6, 8, 8, 1, 4, 2, 6, 7, 8, 9, 5, 6, 2, 2, 7, 9, 8, 9, 5, 8, 8, 9, 1, 5, 1, 6, 6, 8, 9, 6, 6, 0, 3, 1, 7, 2, 8, 6, 1, 6, 8, 2, 7, 9, 7, 8, 0, 2, 7, 8, 2, 9, 4, 3, 6, 6, 4, 6, 9, 5, 8, 7, 1, 1, 2, 5, 9, 1, 6, 7, 7, 9, 5, 8, 7, 6, 1, 6, 0, 7, 1, 2, 3, 3, 7, 6, 2, 1, 6, 4, 4, 9, 4, 4, 5, 6, 1, 3, 6, 8, 4, 7, 5, 8];

QUnit.test('u.async.for [sequential]', function(assert) {
  var done = assert.async();
  assert.ok(u.async.for);

  var finished = false;
  var n = 100;
  var exp = u.array.range(n);

  var act = [];
  u.async.for(n, function(i) {
    return new Promise(function(resolve, reject) {
      setTimeout(function () {
        act.push(i);
        resolve();
      }, RAND[i]);
    });
  }, true)
    .then(function() {
      if (!finished) {
        assert.deepEqual(act, exp);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 15000);
});

QUnit.test('u.async.for [parallel]', function(assert) {
  var done = assert.async();
  assert.ok(u.async.for);

  var finished = false;
  var n = 100;
  var exp = u.array.range(n);

  var act = [];
  u.async.for(n, function(i) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        act.push(i);
        resolve();
      }, RAND[i]);
    });
  }, false)
    .then(function() {
      if (!finished) {
        assert.notDeepEqual(act, exp);
        assert.deepEqual(act.sort(function (x, y) { return parseFloat(x) - parseFloat(y); }), exp);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 15000);
});

QUnit.test('u.async.all [sequential]', function(assert) {
  var done = assert.async();
  assert.ok(u.async.all);

  var finished = false;
  var n = 100;

  var exp = u.array.range(n);
  var act = [];
  var jobs = exp.map(function(i) { return function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function () {
        act.push(i);
        resolve();
      }, RAND[i]);
    });
  }; });

  u.async.all(jobs, true)
    .then(function() {
      if (!finished) {
        assert.deepEqual(act, exp);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 15000);
});

QUnit.test('u.async.all [parallel]', function(assert) {
  var done = assert.async();
  assert.ok(u.async.all);

  var finished = false;
  var n = 100;

  var exp = u.array.range(n);
  var act = [];
  var jobs = exp.map(function(i) { return function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function () {
        act.push(i);
        resolve();
      }, RAND[i]);
    });
  }; });

  u.async.all(jobs, false)
    .then(function() {
      if (!finished) {
        assert.notDeepEqual(act, exp);
        assert.deepEqual(act.sort(function (x, y) { return parseFloat(x) - parseFloat(y); }), exp);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 15000);
});

QUnit.test('u.async.do', function(assert) {
  var done = assert.async();
  assert.ok(u.async.do);

  var finished = false;
  var n = 100;
  var exp = u.array.range(n);
  var act = [];

  u.async.do(function(i) {
    return new Promise(function(resolve, reject) {
      setTimeout(function () {
        act.push(i);
        resolve(i + 1 < n);
      }, RAND[i]);
    });
  }).then(function() {
      if (!finished) {
        assert.deepEqual(act, exp);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 15000);
});

QUnit.test('u.async.Deferred', function(assert) {
  var done = assert.async();
  assert.ok(u.async.Deferred);

  var finished = false;

  var d = new u.async.Deferred();
  var act = null;
  var exp = 'something';
  d.then(function(value) {
    if (!finished) {
      act = value;
      assert.equal(act, exp);
      finished = true;
      done();
    }
  });
  setTimeout(function() {
    d.resolve('something');
  }, 100);

  setTimeout(function() {
    assert.notOk(finished);
    assert.notOk(act);
  }, 50);

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 200);
});
