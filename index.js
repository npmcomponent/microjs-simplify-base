module.exports = function (getSquareDistance, getSquareSegmentDistance) {

	// distance-based simplification
  function simplifyRadialDistance(points, sqTolerance) {

    var i,
        len = points.length,
        point,
        prevPoint = points[0],
        newPoints = [prevPoint];

    for (i = 1; i < len; i++) {
      point = points[i];

      if (getSquareDistance(point, prevPoint) > sqTolerance) {
        newPoints.push(point);
        prevPoint = point;
      }
    }

    if (prevPoint !== point) {
      newPoints.push(point);
    }

    return newPoints;
  }


  // simplification using optimized Douglas-Peucker algorithm with recursion elimination

  function simplifyDouglasPeucker(points, sqTolerance) {

    var len = points.length,

        MarkerArray = (typeof Uint8Array !== undefined + '')
                    ? Uint8Array
                    : Array,

        markers = new MarkerArray(len),

        first = 0,
        last  = len - 1,

        i,
        maxSqDist,
        sqDist,
        index,

        firstStack = [],
        lastStack  = [],

        newPoints  = [];

    markers[first] = markers[last] = 1;

    while (last) {

      maxSqDist = 0;

      for (i = first + 1; i < last; i++) {
        sqDist = getSquareSegmentDistance(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
          index = i;
          maxSqDist = sqDist;
        }
      }

      if (maxSqDist > sqTolerance) {
        markers[index] = 1;

        firstStack.push(first);
        lastStack.push(index);

        firstStack.push(index);
        lastStack.push(last);
      }

      first = firstStack.pop();
      last = lastStack.pop();
    }

    for (i = 0; i < len; i++) {
      if (markers[i]) {
        newPoints.push(points[i]);
      }
    }

    return newPoints;
  }


  return function (points, tolerance, highestQuality) {

    var sqTolerance = (tolerance !== undefined)
                    ? tolerance * tolerance
                    : 1;

    if (!highestQuality) {
      points = simplifyRadialDistance(points, sqTolerance);
    }
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
  };
}