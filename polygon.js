class Polygon {
  //points are relative to the center of the shape, so that moving it is simpler
  constructor(x, y, points, immovable = false) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;

    this.points = points;
    this.immovable = immovable;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x + this.points[0][0], this.y + this.points[0][1]);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.x + this.points[i][0], this.y + this.points[i][1]);
    }
    ctx.closePath();
    ctx.stroke();
  }

  update() {
    if (this.immovable) {
      return
    }

    this.dx += gravity.x;
    this.dy += gravity.y;

    this.x += this.dx;
    this.y += this.dy;
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



      let max = perpendicular[0] * vertices[0][0] + perpendicular[1] * vertices[0][1];
      let min = max;
      for (let j = 1; j < vertices.length; j++) {
        let dot = perpendicular[0] * vertices[j][0] + perpendicular[1] * vertices[j][1];
        max = Math.max(max, dot);
        min = Math.min(min, dot);
      }

      let pMax = perpendicular[0] * pVertices[0][0] + perpendicular[1] * pVertices[0][1];
      let pMin = pMax;
      for (let j = 1; j < pVertices.length; j++) {
        let dot = perpendicular[0] * pVertices[j][0] + perpendicular[1] * pVertices[j][1];
        pMax = Math.max(pMax, dot);
        pMin = Math.min(pMin, dot);
      }

      if (!((pMax < max && pMax > min) || (pMin < max && pMin > min))) {
        console.log(pMax);
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

      let max = perpendicular[0] * vertices[0][0] + perpendicular[1] * vertices[0][1];
      let min = max;
      for (let j = 1; j < vertices.length; j++) {
        let dot = perpendicular[0] * vertices[j][0] + perpendicular[1] * vertices[j][1];
        max = Math.max(max, dot);
        min = Math.min(min, dot);
      }

      let pMax = perpendicular[0] * pVertices[0][0] + perpendicular[1] * pVertices[0][1];
      let pMin = pMax;
      for (let j = 1; j < pVertices.length; j++) {
        let dot = perpendicular[0] * pVertices[j][0] + perpendicular[1] * pVertices[j][1];
        pMax = Math.max(pMax, dot);
        pMin = Math.min(pMin, dot);
      }

      if (!((pMax < max && pMax > min) || (pMin < max && pMin > min))) {
        return;
      }
    }

    console.log("colliding");

  }

  getVertices() {
    let vertices = [];
    for (let i in this.points) {
      vertices.push([this.points[i][0] + this.x, this.points[i][1] + this.y]);
    }
    return vertices;
  }

  getPerpendicular(v2, v1) {
    let perpendicular = [-(v1[1] - v2[1]), v1[0] - v2[0]];

    let magnitude = Math.sqrt(Math.pow(perpendicular[0], 2) + Math.pow(perpendicular[1], 2));
    if (magnitude != 0) {
        perpendicular[0] *= 1 / magnitude;
        perpendicular[1] *= 1 / magnitude;
     }

     return perpendicular;
  }

}
