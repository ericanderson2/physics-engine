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
      return
    }

    //this.velocity.add(gravity);
    this.position.add(this.velocity);
  }

  checkColliding(p) {
    let vertices = this.getVertices();
    let pVertices = p.getVertices();

    for (let i = 0; i < vertices.length; i++) {
      let perpendicular;
      if (i == vertices.length - 1) {
        perpendicular = this.getPerpendicular(vertices[i], vertices[0]);
      //  console.log("v1:" + vertices[i] + "\nv2:" + vertices[0] + "\np:" + perpendicular);
      } else {
        perpendicular = this.getPerpendicular(vertices[i], vertices[i + 1]);
        //console.log("v1:" + vertices[i] + "\nv2:" + vertices[i + 1] + "\np:" + perpendicular);
      }

      let max = perpendicular.x * vertices[0].x + perpendicular.y * vertices[0].y;
      let min = max;
      for (let j = 1; j < vertices.length; j++) {
        let dot = perpendicular.x * vertices[j].x + perpendicular.y * vertices[j].y;
        max = Math.max(max, dot);
        min = Math.min(min, dot);
      }

      let pMax = Vector.dot(perpendicular, pVertices[0]);
      let pMin = pMax;
      for (let j = 1; j < pVertices.length; j++) {
        let dot = Vector.dot(perpendicular, pVertices[j]);
        pMax = Math.max(pMax, dot);
        pMin = Math.min(pMin, dot);
      }

      if (Math.min(max, pMax) - Math.max(min, pMin) < 0) {
        return;
      }

    }

    for (let i = 0; i < pVertices.length; i++) {
      let perpendicular;
      if (i < pVertices.length - 1) {
        perpendicular = p.getPerpendicular(pVertices[i], pVertices[i + 1]);
      } else {
        perpendicular = p.getPerpendicular(pVertices[i], pVertices[0]);
      }

      let max = perpendicular.x * vertices[0].x + perpendicular.y * vertices[0].y;
      let min = max;
      for (let j = 1; j < vertices.length; j++) {
        let dot = perpendicular.x * vertices[j].x + perpendicular.y * vertices[j].y;
        max = Math.max(max, dot);
        min = Math.min(min, dot);
      }

      let pMax = perpendicular.x * pVertices[0].x + perpendicular.y * pVertices[0].y;
      let pMin = pMax;
      for (let j = 1; j < pVertices.length; j++) {
        let dot = perpendicular.x * pVertices[j].x + perpendicular.y * pVertices[j].y;
        pMax = Math.max(pMax, dot);
        pMin = Math.min(pMin, dot);
      }

      if (!((pMax < max && pMax > min) || (pMin < max && pMin > min))) {
        return;
      }
    }

    this.colliding = true;

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
