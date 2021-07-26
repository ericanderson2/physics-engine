const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var shapes = [];
var openPoints = [];
var selectedShape = null;

var gravity = new Vector(0, 0);
var lastMousePos;
document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp)
document.addEventListener("mousemove", mouseMove);
document.addEventListener("keypress", keyPressed);

ctx.lineWidth = 1;

createPolygon(50, 50, 5);
createPolygon(50, 100, 3);
createPolygon(100, 100, 4);

main();

function main() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(main);
}

function draw() {

  for (let i in shapes) {
    shapes[i].draw();
  }

  //show the currently clicked on points
  for (let i in openPoints) {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(openPoints[i].x, openPoints[i].y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function update() {
  for (let i in shapes) {
    shapes[i].update();
  }

}

function mouseDown(e) {
  let rect = canvas.getBoundingClientRect()
  let mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);

  for (let i in shapes) {
    if (shapes[i].position.distanceTo(mousePos) < 8) {
      shapes[i].selected = true;
      selectedFlag = true;
      selectedShape = shapes[i];
      return;
    }
  }
}

function mouseUp(e) {
  for (let i in shapes) {
    shapes[i].selected = false;
  }
  selectedShape = null;
}

function mouseMove(e) {
  let rect = canvas.getBoundingClientRect()
  let mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);

  if (selectedShape != null) {
    selectedShape.position.add(new Vector(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y));
  }
  lastMousePos = mousePos;
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

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}
