const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var shapes = [];
var openPoints = [];

var gravity = new Vector(0, 0.01);

document.addEventListener("click", mouseClicked);
document.addEventListener("keypress", keyPressed);

ctx.strokeStyle = 'black';
ctx.lineWidth = 2;

var bottomWall = new Polygon(150, 290, [new Vector(-150, -10), new Vector(-150, 10), new Vector(150, 10), new Vector(150, -10)], true);
shapes.push(bottomWall);

main();

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
    ctx.arc(openPoints[i].x, openPoints[i].y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function update() {
  for (let i in shapes) {
    shapes[i].update();
  }

  for (let i in shapes) {
    for (let j in shapes) {
      if (i != j) {
        shapes[i].checkColliding(shapes[j]);
      }
    }
  }
}

function mouseClicked(e) {
  //normalize point for canvas location. appears off by ~5px? revisit this later
  var rect = canvas.getBoundingClientRect()
  var x = e.clientX - rect.left
  var y = e.clientY - rect.top

  openPoints.push(new Vector(x, y));

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
  var cumulative = new Vector(0, 0);

  for (let i in openPoints) {
    cumulative.add(openPoints[i]);
  }
  var center = new Vector(cumulative.x / openPoints.length, cumulative.y / openPoints.length);

  for (let i in openPoints) {
    openPoints[i].sub(center);
  }

  var shape = new Polygon(center.x, center.y, openPoints);
  shapes.push(shape);

  openPoints = [];
}
