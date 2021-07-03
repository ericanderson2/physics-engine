class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

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

  add(a, b) {
      if (b == null) {
        this.x += a.x;
        this.y += a.y;
        return this;
      } else {
        return new Vector(a.x + b.x, a.y + b.y);
      }
  }

  sub(a, b) {
      if (b == null) {
        this.x -= a.x;
        this.y -= a.y;
        return this;
      } else {
        return new Vector(a.x - b.x, a.y - b.y);
      }
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }


}


class Polygon {
  //points are relative to the center of the shape, so that moving it is simpler
  constructor(x, y, points, immovable = false) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 0);

    this.points = points;
    this.immovable = immovable;

    this.colliding = false
  }

  draw() {
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
  }

  update() {
    this.colliding = false;

    if (this.immovable) {
      return;
    }

    for (let i in shapes) {
      if (shapes[i] == this) {
        continue;
      }
      if (checkColliding(this, shapes[i])) {
        this.colliding = true;
      }
    }

    //this.velocity.add(gravity);
    this.position.add(this.velocity);
  }

  getVertices() {
    let vertices = [];
    for (let i in this.points) {
      vertices.push(new Vector(this.points[i].x + this.position.x, this.points[i].y + this.position.y));
    }
    return vertices;
  }

  getPerpendicular(a, b) {
    let perpendicular = new Vector(-(b.y - a.y), b.x - a.x);
    return perpendicular.normalized();
  }

}

function checkColliding(a, b) {
  let aVertices = a.getVertices();
  let bVertices = b.getVertices();

//check each perpendicular for polygon a
  for (let i = 0; i < aVertices.length; i++) {
    let perpendicular;
    if (i == aVertices.length - 1) {
      perpendicular = a.getPerpendicular(aVertices[i], aVertices[0]);
    } else {
      perpendicular = a.getPerpendicular(aVertices[i], aVertices[i + 1]);
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
      perpendicular = b.getPerpendicular(bVertices[i], bVertices[i + 1]);
    } else {
      perpendicular = b.getPerpendicular(bVertices[i], bVertices[0]);
    }

    let aProjection = projectVerticesOnAxis(perpendicular, aVertices);
    let bProjection = projectVerticesOnAxis(perpendicular, bVertices);

    if (Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min) < 0) {
      return false;
    }
  }

  return true;
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
