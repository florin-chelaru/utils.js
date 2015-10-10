/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/7/2015
 * Time: 2:38 PM
 */

QUnit.test('u.Exception', function() {
  ok(u.Exception);

  var inner = Error('another message');
  var e = new u.Exception('my message', inner);
  equal(e.message, 'my message');
  equal(e.name, 'Exception');
  ok(e.stack);
  deepEqual(e.innerException, inner);
});

QUnit.test('u.TimeSpan', function() {
  ok(u.TimeSpan);

  var t = new u.TimeSpan(65432);
  equal(t.days(), 0);
  equal(t.hours(), 0);
  equal(t.minutes(), 1);
  equal(t.seconds(), 5);
  equal(t.milliseconds(), 432);

  t = new u.TimeSpan(
    3 * 24 * 60 * 60 * 1000 +
    4 * 60 * 60 * 1000 +
    17 * 60 * 1000 +
    43 * 1000 +
    158);

  equal(t.days(), 3);
  equal(t.hours(), 4);
  equal(t.minutes(), 17);
  equal(t.seconds(), 43);
  equal(t.milliseconds(), 158);

  equal(u.math.floorPrecision(t.totalDays(), 2), 3.17);
  equal(u.math.floorPrecision(t.totalHours(), 2), 3 * 24 + 4 + 0.29);
  equal(u.math.floorPrecision(t.totalMinutes(), 2), 3 * 24 * 60 + 4 * 60 + 17 + 0.71);
  equal(u.math.floorPrecision(t.totalSeconds(), 2), 3 * 24 * 60 * 60 + 4 * 60 * 60 + 17 * 60 + 43 + 0.15);
  equal(t.totalMilliseconds(), 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 17 * 60 * 1000 + 43 * 1000 + 158);
});

QUnit.test('u.each', function() {
  ok(u.each);

  var obj = {'a': 'x', 'b': 7, '9': 'f'};
  var expObj = [['9', 'f'], ['a', 'x'], ['b', 7]];
  var actObj = [];
  u.each(obj, function(k, v) { actObj.push([k, v]); });

  deepEqual(actObj, expObj);

  var arr = ['x', 7, 'f'];
  var expArr = [[0, 'x'], [1, 7], [2, 'f']];
  var actArr = [];
  u.each(arr, function(i, v) { actArr.push([i, v]); });

  deepEqual(actArr, expArr);
});

QUnit.test('u.map', function() {
  ok(u.map);

  var obj = {1: 'a', 'x': 'b', 'y': 2};
  var exp = ['a1', 'b1', 3];
  var act = u.map(obj, function(v) { return v + 1; });

  deepEqual(act, exp);

  var arr = ['a', 'b', 2];
  act = u.map(arr, function(v) { return v + 1; });
  deepEqual(act, exp);

  obj[4] = 5;
  exp = ['1a1', '451', 'xb1', 'y21'];
  act = u.map(obj, function(v, k) { return k + v + 1; });
  deepEqual(act, exp);
});

QUnit.test('u.copy', function() {
  ok(u.copy);

  var obj = {1: 'a', 'x': 'b', 'y': 2};
  deepEqual(u.copy(obj), obj);
  notEqual(u.copy(obj), obj);

  var arr = ['a', 'b', 2];
  deepEqual(u.copy(arr), arr);
  notEqual(u.copy(arr), arr);
});

QUnit.test('u.generatePseudoGUID', function() {
  ok(u.generatePseudoGUID);

  equal(u.generatePseudoGUID(6).length, 6);
  equal(typeof u.generatePseudoGUID(6), 'string');
  notOk(u.generatePseudoGUID(6) == u.generatePseudoGUID(6));
});

QUnit.test('u.array.range', function() {
  ok(u.array.range);

  deepEqual(u.array.range(4), [0, 1, 2, 3]);
  deepEqual(u.array.range(3, 4), [4, 5, 6]);
});

QUnit.test('u.array.fill', function() {
  ok(u.array.fill);

  var exp = [2, 2, 2];
  var act = u.array.fill(3, 2);
  deepEqual(act, exp);
});

QUnit.test('u.array.fill', function() {
  ok(u.array.fill);

  var exp = [2, 2, 2];
  var act = u.array.fill(3, 2);
  deepEqual(act, exp);
});

QUnit.test('u.reflection.evaluateFullyQualifiedTypeName', function() {
  ok(u.reflection.evaluateFullyQualifiedTypeName);

  deepEqual(u.reflection.evaluateFullyQualifiedTypeName('u.Exception'), u.Exception);
});

QUnit.test('u.reflection.applyConstructor', function() {
  ok(u.reflection.applyConstructor);

  var inner = Error('something');
  deepEqual(u.reflection.applyConstructor(u.Exception, ['my new message', inner]), new u.Exception('my new message', inner));
});

QUnit.test('u.reflection.wrap', function() {
  ok(u.reflection.wrap);

  var Foo = function(x) { this.x = x; };
  Foo.prototype.bar = function() { return this.x; };

  var obj = {x: '10'};
  u.reflection.wrap(obj, Foo);

  ok(obj instanceof Foo);
  ok(obj.bar);
  equal(obj.bar(), '10');
});

QUnit.test('u.reflection.ReflectionException', function() {
  ok(u.reflection.ReflectionException);

  var inner = Error('another message');
  var e = new u.reflection.ReflectionException('my message', inner);
  equal(e.message, 'my message');
  equal(e.name, 'ReflectionException');
  ok(e.stack);
  deepEqual(e.innerException, inner);
});

QUnit.test('u.string.capitalizeFirstLetter', function() {
  ok(u.string.capitalizeFirstLetter);

  equal(u.string.capitalizeFirstLetter('test'), 'Test');
  equal(u.string.capitalizeFirstLetter(''), '');
  equal(u.string.capitalizeFirstLetter('12ab'), '12ab');
});

QUnit.test('u.math.floorPrecision', function() {
  ok(u.math.floorPrecision);

  equal(u.math.floorPrecision(2.123456, 3), 2.123);
  equal(u.math.floorPrecision(2.123456, 0), 2);
  equal(u.math.floorPrecision(2.123456, 8), 2.123456);
});

