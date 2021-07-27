class Polygon {
  /*
    position (Vector) : the canvas coords of the shape's origin
    points (Array of Vector) : the vertices, relative to the position
    immovable (Boolean) : whether the shape if affected by gravity or not
    velocity (Vector) : the amount the position is changed each AnimationFrame
    rotVelocity (float) : the amount the shape is rotated each AnimationFrame (in radians)
    colliding (Boolean) : set each frame in update(), used for draw()
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

  }

  draw() {
    //drawing the edges
    if (this.colliding) {
      ctx.strokeStyle = "red";
    } else {
      ctx.strokeStyle = "black";
    }

    ctx.beginPath();
    ctx.moveTo(this.position.x + this.points[0].x, this.position.y + this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.position.x + this.points[i].x, this.position.y + this.points[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    //drawing the origin
    if (this.selected) {
      ctx.strokeStyle = "blue";
    } else {
      ctx.strokeStyle = "black";
    }
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 7, 0, Math.PI * 2);
    ctx.closePath();

    ctx.stroke();
  }

  update() {
    this.colliding = false;

    if (this.immovable) {
      return;
    }

    //check for collisions with other polygons
    for (let i in shapes) {
      if (shapes[i] == this) {
        continue;
      }
      if (checkColliding(this, shapes[i])) {
        this.colliding = true;
      }
    }

    //update the location of points. apply gravity and rotation
    if (this.velocity.x > 0) {
      this.velocity.x -= FRICTION;
      this.velocity.x = Math.max(0, this.velocity.x);
    } else {
      this.velocity.x += FRICTION;
      this.velocity.x = Math.min(0, this.velocity.x);
    }

    if (this.velocity.y > 0) {
      this.velocity.y -= FRICTION;
      this.velocity.y = Math.max(0, this.velocity.y);
    } else {
      this.velocity.y += FRICTION;
      this.velocity.y = Math.min(0, this.velocity.y);
    }

    this.velocity.add(gravity);
    this.position.add(this.velocity);

    this.applyRotation();
  }

  //rotates each point in the shape by the rotational velocity
  applyRotation() {
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

/* creates a polygon with the given number of sides. radius is set at 30.
   useful if you don't care about the exact location of the vertices */
function createPolygon(x, y, sides) {
  let radius = 50;
  let vertices = [];

  for (let i = 0; i < sides; i++) {
    let angle = i * (2 * Math.PI / sides);
    vertices.push(new Vector(radius * Math.cos(angle), radius * Math.sin(angle)));
  }

  shapes.push(new Polygon(x, y, vertices));
}

//The following functions are used for the polygon collision calculations (separating axis theorem implementation)
function checkColliding(a, b) {
  let aVertices = a.getVertices();
  let bVertices = b.getVertices();

  let translationDistance = Infinity;
  let translationDirection;
  let translationObject;
//check each perpendicular for polygon a
  for (let i = 0; i < aVertices.length; i++) {
    let perpendicular;
    if (i == aVertices.length - 1) {
      perpendicular = getPerpendicular(aVertices[i], aVertices[0]);
    } else {
      perpendicular = getPerpendicular(aVertices[i], aVertices[i + 1]);
    }

    let aProjection = projectVerticesOnAxis(perpendicular, aVertices);
    let bProjection = projectVerticesOnAxis(perpendicular, bVertices);

    let overlap = Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min);
    if (overlap < 0) {
      return false;
    }

    //conditional for shapes colliding but no vertices from one shape are inside the other
    if ((aProjection.max > bProjection.max && aProjection.min < bProjection.min) || (aProjection.max < bProjection.max && aProjection.min > bProjection.min)) {
      let min = Math.abs(aProjection.min - bProjection.min);
      let max = Math.abs(aProjection.max - bProjection.max);
      if (min < max) {
        translationDistance += min;
      } else {
        translationDistance += max;
        perpendicular.multiply(-1);
      }
    }

    if (overlap < translationDistance) {
      translationDistance = overlap;
      translationDirection = perpendicular;
      translationObject = b;
      if (aProjection.max > bProjection.max) {
        translationDirection.multiply(-1);
      }
    }

  }

//check each perpendicular for polygon b
  for (let i = 0; i < bVertices.length; i++) {
    let perpendicular;
    if (i == bVertices.length - 1) {
      perpendicular = getPerpendicular(bVertices[i], bVertices[0]);
    } else {
      perpendicular = getPerpendicular(bVertices[i], bVertices[i + 1]);
    }

    let aProjection = projectVerticesOnAxis(perpendicular, aVertices);
    let bProjection = projectVerticesOnAxis(perpendicular, bVertices);

    let overlap = Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min)
    if (overlap < 0) {
      return false;
    }

    if ((aProjection.max > bProjection.max && aProjection.min < bProjection.min) || (aProjection.max < bProjection.max && aProjection.min > bProjection.min)) {
      let min = Math.abs(bProjection.min - aProjection.min);
      let max = Math.abs(bProjection.max - aProjection.max);
      if (min < max) {
        translationDistance += min;
      } else {
        translationDistance += max;
        translationDirection.multiply(-1);
      }
    }

    if (overlap < translationDistance) {
      translationDistance = overlap;
      translationDirection = perpendicular;
      translationObject = a;
      if (bProjection.max > aProjection.max) {
        translationDirection.multiply(-1);
      }
    }
  }

  let overlappingVertex = projectVerticesOnAxis(translationDirection, translationObject.getVertices()).overlappingVertex;
  //line(overlappingVertex.x, overlappingVertex.y, translationDirection.x * translationDistance + overlappingVertex.x, translationDirection.y * translationDistance + overlappingVertex.y);

  if (translationObject == b) {
    translationDirection.multiply(-1);
  }
  let overlapVector = new Vector(translationDirection.x, translationDirection.y).multiply(translationDistance / (1 / a.mass + 1 / b.mass));
  a.position.add(new Vector(overlapVector.x, overlapVector.y).multiply(1 / a.mass));
  b.position.add(new Vector(overlapVector.x, overlapVector.y).multiply(-1 / b.mass));

  let relativeVelocity = new Vector(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
  let separatingVelocity = Vector.dot(relativeVelocity, translationDirection);
  let newSeparatingVelocity = -separatingVelocity * ELASTICITY;
  let impulse = (newSeparatingVelocity - separatingVelocity) / (1 / a.mass + 1 / b.mass);
  let impulseVector = new Vector(translationDirection.x, translationDirection.y).multiply(impulse);

  console.log(translationDistance);
  console.log(translationDirection);

  a.velocity.add(new Vector(impulseVector.x, impulseVector.y).multiply(1 / a.mass));
  b.velocity.add(new Vector(impulseVector.x, impulseVector.y).multiply(-1 / b.mass));
  return true;
}

//helper functions for SAT collisions
function getPerpendicular(a, b) {
  let perpendicular = new Vector(-(b.y - a.y), b.x - a.x);
  return perpendicular.normalized();
}

function projectVerticesOnAxis(perpendicular, vertices) {
  let max = Vector.dot(perpendicular, vertices[0]);
  let min = max;
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

  //returns the magnitude (length) of this vector
  magnitude() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  add(a) {
      this.x += a.x;
      this.y += a.y;
      return this;
  }

  sub(a) {
      this.x -= a.x;
      this.y -= a.y;
      return this;
  }

  multiply(a) {
    this.x *= a;
    this.y *= a;
    return this;
  }

  distanceTo(a) {
    return Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

}
