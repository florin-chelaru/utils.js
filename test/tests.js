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

QUnit.test('u.array.fromArguments', function() {
  ok(u.array.fromArguments);

  var params = [1, 'a', new u.Exception('my message')];
  var args = (function() { return arguments; })(params[0], params[1], params[2]);

  deepEqual(params, u.array.fromArguments(args));
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

QUnit.test('u.reflection.ReflectionException', function() {
  ok(u.reflection.ReflectionException);

  var inner = Error('another message');
  var e = new u.reflection.ReflectionException('my message', inner);
  equal(e.message, 'my message');
  equal(e.name, 'ReflectionException');
  ok(e.stack);
  deepEqual(e.innerException, inner);
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

QUnit.test('u.array.fill', function() {
  ok(u.array.fill);

  var exp = [2, 2, 2];
  var act = u.array.fill(3, 2);
  deepEqual(act, exp);
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
