const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

document.addEventListener("click", mouseClicked);
document.addEventListener("keypress", keyPressed);

ctx.strokeStyle = 'black';
ctx.lineWidth = 2;

var shapes = [];
var openPoints = [];

main();

class Polygon {
  //points are relative to the center of the shape, so that moving it is simpler
  constructor(x, y, points) {
    this.x = x;
    this.y = y;
    this.points = points;
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

}

function main() {
  update();
  draw();
  requestAnimationFrame(main);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i in shapes) {
    shapes[i].draw();
  }

  //show the currently clicked on points
  for (let i in openPoints) {
    ctx.beginPath();
    ctx.arc(openPoints[i][0], openPoints[i][1], 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function update() {

}

function mouseClicked(e) {
  //normalize point for canvas location. appears off by ~5px? revisit this later
  var rect = canvas.getBoundingClientRect()
  var x = e.clientX - rect.left
  var y = e.clientY - rect.top

  openPoints.push([x, y]);

}

function keyPressed(e) {
  if (openPoints.length < 3) {
    return;
  }
  if (e.code != 'Enter') {
    openPoints = [];
    return;
  }

  //take absolute points and make them relative to a center location
  var cumulativeX = 0;
  var cumulativeY = 0;
  for (let i in openPoints) {
    cumulativeX += openPoints[i][0];
    cumulativeY += openPoints[i][1];
  }
  var centerX = cumulativeX / openPoints.length;
  var centerY = cumulativeY / openPoints.length;

  for (let i in openPoints) {
    openPoints[i][0] -= centerX;
    openPoints[i][1] -= centerY;
  }

  var shape = new Polygon(centerX, centerY, openPoints);
  shapes.push(shape);

  openPoints = [];
}
