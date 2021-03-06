class Polygon {
  /*
    position (Vector) : the canvas coords of the shape's origin
    points (Array of Vector) : the vertices, relative to the position
    immovable (Boolean) : whether the shape can move or not
    velocity (Vector) : the amount the position is changed each AnimationFrame
    rotVelocity (float) : the amount the shape is rotated each AnimationFrame (in radians)
    colliding (Boolean) : set each frame in update()
    selected (Boolean) : whether the user has clicked on the shape, used for draw()
  */
  constructor(x, y, points, mass = 5, immovable = false) {
    this.position = new Vector(x, y);
    this.points = points;
    this.immovable = immovable;
    this.mass = mass;
    this.velocity = new Vector(0, 0);
    this.rotVelocity = 0.0;

    this.colliding = false;
    this.selected = false;

    //i apologize to my physics teacher
    this.momentOfInertia = 20000;
  }

//display the shape
  draw() {
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(this.position.x + this.points[0].x, this.position.y + this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.position.x + this.points[i].x, this.position.y + this.points[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    if (this.selected) {
      ctx.fillStyle = "DodgerBlue";
    } else if (this.immovable) {
      ctx.fillStyle = "DimGray";
    } else {
      ctx.fillStyle = "silver";
    }
    ctx.fill();
  }

//apply physics logic and test for collisions
  update() {
    this.colliding = false;

    //check for collisions with other polygons
    if (!this.immovable) {
      for (let i in shapes) {
        if (shapes[i] == this) {
          continue;
        }
        if (checkColliding(this, shapes[i])) {
          this.colliding = true;
        }
      }
    }

    if (this.immovable) {
      this.velocity = new Vector(0, 0);
      this.rotVelocity = 0.0;
      return;
    }

    //apply friction
    if (this.velocity.x > 0) {
      this.velocity.x -= friction;
      this.velocity.x = Math.max(0, this.velocity.x);
    } else {
      this.velocity.x += friction;
      this.velocity.x = Math.min(0, this.velocity.x);
    }

    if (this.velocity.y > 0) {
      this.velocity.y -= friction;
      this.velocity.y = Math.max(0, this.velocity.y);
    } else {
      this.velocity.y += friction;
      this.velocity.y = Math.min(0, this.velocity.y);
    }

    this.velocity = this.velocity.add(gravity);
    this.position = this.position.add(this.velocity);

    //apply angular friction
    if (this.rotVelocity > 0) {
      this.rotVelocity -= angular_friction;
      this.rotVelocity = Math.max(0, this.rotVelocity);
    } else {
      this.rotVelocity += angular_friction;
      this.rotVelocity = Math.min(0, this.rotVelocity);
    }

    //'temporary' fix to collision rotation code bug
    if (this.rotVelocity > 0.2) {
      this.rotVelocity = 0.2;
    } else if (this.rotVelocity < -0.2) {
      this.rotVelocity = -0.2;
    }

    if (do_collision_rotation) {
      this.applyRotation();
    }
  }

  //rotates each point in the shape by the rotational velocity
  applyRotation() {
    //matrix math would be more efficient here. consider for optimzation
    if (this.rotVelocity != 0) {
      for (let i in this.points) {
        let newX = this.points[i].x * Math.cos(this.rotVelocity) - this.points[i].y * Math.sin(this.rotVelocity);
        let newY = this.points[i].y * Math.cos(this.rotVelocity) + this.points[i].x * Math.sin(this.rotVelocity);
        this.points[i].x = newX;
        this.points[i].y = newY;
      }
    }
  }

  //returns the absolute location of each vertice (not relative to the origin)
  getVertices() {
    let vertices = [];
    for (let i in this.points) {
      vertices.push(new Vector(this.points[i].x + this.position.x, this.points[i].y + this.position.y));
    }
    return vertices;
  }
}

/* creates a polygon with the given number of sides.
   useful if you don't care about the exact location of the vertices */
function createPolygon(x, y, sides, radius = 50, mass = 5, immovable = false) {
  let vertices = [];

  for (let i = 0; i < sides; i++) {
    let angle = i * (2 * Math.PI / sides);
    vertices.push(new Vector(radius * Math.cos(angle), radius * Math.sin(angle)));
  }

  shapes.push(new Polygon(x, y, vertices, mass, immovable));
}

//Separating Axis Theorem implementation
function checkColliding(a, b) {
  let vertices = [];
  let aVertices = a.getVertices();
  let bVertices = b.getVertices();

  vertices.push.apply(vertices, aVertices);
  vertices.push.apply(vertices, bVertices);

  let translationDistance = null;
  let translationDirection;
  let translationObject;

  for (let i = 0; i < vertices.length; i++) {
    let perpendicular;
    if (i == aVertices.length - 1) {
      //connect the last vertex in shape a with the first one
      perpendicular = getPerpendicular(vertices[i], vertices[0]);
    } else if (i == vertices.length - 1) {
      //connect the last vertex in shape b with the first one
      perpendicular = getPerpendicular(vertices[i], vertices[aVertices.length]);
    } else {
      perpendicular = getPerpendicular(vertices[i], vertices[i + 1]);
    }

    let aProjection = projectVerticesOnAxis(perpendicular, aVertices);
    let bProjection = projectVerticesOnAxis(perpendicular, bVertices);

    let overlap = Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min);

    if (overlap < 0) {
      //separating axis can be drawn. no collision
      return false;
    }

    //shapes colliding but no vertices from one shape are inside the other (containment)
    if ((aProjection.max > bProjection.max && aProjection.min < bProjection.min) || (aProjection.max < bProjection.max && aProjection.min > bProjection.min)) {
      let min = Math.abs(aProjection.min - bProjection.min);
      let max = Math.abs(aProjection.max - bProjection.max);
      if (min < max) {
        overlap += min;
      } else {
        overlap += max;
        perpendicular = perpendicular.multiply(-1);
      }
    }

//check to see if the distance to translate for this perpendicular is more efficient than another perpendicular
    if (overlap < translationDistance || translationDistance === null) {
      translationDistance = overlap;
      translationDirection = perpendicular;
      if (i < aVertices.length) {
        translationObject = b;
        if (aProjection.max > bProjection.max) {
          translationDirection = perpendicular.multiply(-1);
        }
      } else {
        translationObject = a;
        if (aProjection.max < bProjection.max) {
          translationDirection = perpendicular.multiply(-1);
        }
      }
    }

  }
  //end for loop

  let overlappingVertex = projectVerticesOnAxis(translationDirection, translationObject.getVertices()).overlappingVertex;

  if (translationObject == b) {
    translationDirection = translationDirection.multiply(-1);
  }

  if (show_debug_display) {
    //draw shape overlap and overlapping vertex
    line(overlappingVertex.x, overlappingVertex.y, translationDirection.x * translationDistance + overlappingVertex.x, translationDirection.y * translationDistance + overlappingVertex.y);
    circle(overlappingVertex.x, overlappingVertex.y, 3);
  }

  if (!do_collision_resolution) {
    return true;
  }

  //collision resolution
  if (!b.immovable) {
    //overlap resolution: move the shapes so that they no longer intersect
    let overlapVector = translationDirection.multiply(translationDistance / (1 / a.mass + 1 / b.mass));
    a.position = a.position.add(overlapVector.multiply(1 / a.mass));
    b.position = b.position.add(overlapVector.multiply(-1 / b.mass));

    //velocity resolution: give the shapes new final velocities
    let relativeVelocity = new Vector(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
    let separatingVelocity = Vector.dot(relativeVelocity, translationDirection);
    let newSeparatingVelocity = -separatingVelocity * elasticity;

    let impulse = (newSeparatingVelocity - separatingVelocity) / (1 / a.mass + 1 / b.mass);
    let impulseVector = translationDirection.multiply(impulse);

    a.velocity = a.velocity.add(impulseVector.multiply(1 / a.mass));
    b.velocity = b.velocity.add(impulseVector.multiply(-1 / b.mass));

    if (do_collision_rotation) {
      //jank rotation code. to be improved the collision arms need to be calculated more accurately (and also the moment of Inertia)
      //seems to mimic real rotational collision pretty well, but sometimes sends shapes spinning insanely fast
      a.rotVelocity += (1 / a.momentOfInertia) * Vector.cross(new Vector(overlappingVertex.x - a.position.x, overlappingVertex.y - a.position.y), impulseVector);
      b.rotVelocity -= (1 / b.momentOfInertia) * Vector.cross(new Vector(overlappingVertex.x - b.position.x, overlappingVertex.y - b.position.y), impulseVector);
    }
  } else {
    //same as above, but adjusted for only one shape moving in response to the collision
    let overlapVector = translationDirection.multiply(translationDistance);
    a.position = a.position.add(overlapVector);

    let separatingVelocity = Vector.dot(a.velocity, translationDirection);
    let newSeparatingVelocity = -separatingVelocity * elasticity;

    let impulse = (newSeparatingVelocity - separatingVelocity) / (1 / a.mass);
    let impulseVector = translationDirection.multiply(impulse);

    a.velocity = a.velocity.add(impulseVector.multiply(1 / a.mass));

    if (do_collision_rotation) {
      //rotation code hasn't changed at all from above. if conservation of angular momentum is a thing, we're screwed
      a.rotVelocity += (1 / a.momentOfInertia) * Vector.cross(new Vector(overlappingVertex.x - a.position.x, overlappingVertex.y - a.position.y), impulseVector);
    }
  }
  return true;
}

//helper functions for SAT collisions

//returns a unit vector with a slope perpendicular to the side passed in via vertices
function getPerpendicular(a, b) {
  let perpendicular = new Vector(-(b.y - a.y), b.x - a.x);
  return perpendicular.normalized();
}

//returns information about the projection of a shape's vertices onto a line
function projectVerticesOnAxis(perpendicular, vertices) {
  let min = Vector.dot(perpendicular, vertices[0]);
  let max = min;
  //the vertex that is found within another shape, from which the translation is calculated
  let overlappingVertex = vertices[0];
  for (let i = 1; i < vertices.length; i++) {
    let dot = Vector.dot(perpendicular, vertices[i]);
    max = Math.max(max, dot);
    min = Math.min(min, dot);
    if (dot == min) {
      overlappingVertex = vertices[i];
    }
  }
  return {
      max: max,
      min: min,
      overlappingVertex: overlappingVertex
  };
}
//End of the SAT functions

//return true if a shape contains a point. used for the shape selection
function polygonContainsPoint(shape, point) {
  let vertices = shape.getVertices();
  let j = vertices.length - 1;
  let flag = false;

  for (let i = 0; i < vertices.length; i++) {
    if ((vertices[i].y < point.y && vertices[j].y >= point.y) || (vertices[i].y >= point.y && vertices[j].y < point.y)) {
      if (vertices[i].x + (point.y - vertices[i].y) / (vertices[j].y - vertices[i].y) * (vertices[j].x - vertices[i].x) < point.x) {
        flag = !flag;
      }
    }
    j = i;
  }

  return flag;
}

//helper class to store any data point with an x and a y value
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  //returns the unit vector (length==1) with the same angle as this vector
  normalized() {
    let x = this.x;
    let y = this.y;

    let magnitude = this.magnitude()
    if (magnitude > 0) {
      x /= magnitude;
      y /= magnitude;
    }
    return new Vector(x, y);
  }

  magnitude() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  add(a) {
      return new Vector(this.x + a.x, this.y + a.y);
  }

  sub(a) {
      return new Vector(this.x - a.x, this.y - a.y);
  }

  multiply(a) {
    return new Vector(this.x * a, this.y * a);
  }

  distanceTo(a) {
    return Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }

  roundedToString(places) {
    let newX = Math.round(this.x * Math.pow(10, places)) / Math.pow(10, places);
    let newY = Math.round(this.y * Math.pow(10, places)) / Math.pow(10, places);
    return '(' + newX + ', ' + newY + ')';
  }
}
