/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/7/2015
 * Time: 2:38 PM
 */

QUnit.test('u.Exception', function(assert) {
  assert.ok(u.Exception);

  var inner = Error('another message');
  var e = new u.Exception('my message', inner);
  assert.equal(e.message, 'my message');
  assert.equal(e.name, 'Exception');
  assert.ok(e.stack);
  assert.deepEqual(e.innerException, inner);
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

  var g1 = new u.Geolocation(10, 20, 30);
  var g2 = new u.Geolocation(10, 20, 30);

  assert.ok(g1.equals(g2));
  assert.ok(g1.equals({lat: 10, lng: 20, zoom: 30}));
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

QUnit.test('u.generatePseudoGUID', function(assert) {
  assert.ok(u.generatePseudoGUID);

  assert.equal(u.generatePseudoGUID(6).length, 6);
  assert.equal(typeof u.generatePseudoGUID(6), 'string');
  assert.notOk(u.generatePseudoGUID(6) == u.generatePseudoGUID(6));
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
  assert.deepEqual(u.reflection.applyConstructor(u.Exception, ['my new message', inner]), new u.Exception('my new message', inner));
});

QUnit.test('u.reflection.wrap', function(assert) {
  assert.ok(u.reflection.wrap);

  var Foo = function(x) { this.x = x; };
  Foo.prototype.bar = function() { return this.x; };

  var obj = {x: '10'};
  u.reflection.wrap(obj, Foo);

  assert.ok(obj instanceof Foo);
  assert.ok(obj.bar);
  assert.equal(obj.bar(), '10');
});

QUnit.test('u.reflection.ReflectionException', function(assert) {
  assert.ok(u.reflection.ReflectionException);

  var inner = Error('another message');
  var e = new u.reflection.ReflectionException('my message', inner);
  assert.equal(e.message, 'my message');
  assert.equal(e.name, 'ReflectionException');
  assert.ok(e.stack);
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

