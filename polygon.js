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
  constructor(x, y, points, immovable = false) {
    this.position = new Vector(x, y);
    this.points = points;
    this.immovable = immovable;

    this.velocity = new Vector(0, 0);
    this.rotVelocity = 0.01;

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
  let radius = 30;
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

    if (Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min) < 0) {
      return false;
    }
  }

//check each perpendicular for polygon b
  for (let i = 0; i < bVertices.length; i++) {
    let perpendicular;
    if (i < bVertices.length - 1) {
      perpendicular = getPerpendicular(bVertices[i], bVertices[i + 1]);
    } else {
      perpendicular = getPerpendicular(bVertices[i], bVertices[0]);
    }

    let aProjection = projectVerticesOnAxis(perpendicular, aVertices);
    let bProjection = projectVerticesOnAxis(perpendicular, bVertices);

    if (Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min) < 0) {
      return false;
    }
  }

  return true;
}

function getPerpendicular(a, b) {
  let perpendicular = new Vector(-(b.y - a.y), b.x - a.x);
  return perpendicular.normalized();
}

function projectVerticesOnAxis(perpendicular, vertices) {
  let max = Vector.dot(perpendicular, vertices[0]);
  let min = max;
  for (let i = 1; i < vertices.length; i++) {
    let dot = Vector.dot(perpendicular, vertices[i]);
    max = Math.max(max, dot);
    min = Math.min(min, dot);
  }
  return {
      max: max,
      min: min
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

  distanceTo(a) {
    return Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

}
