const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const FRICTION = 0.02;
const MOVEMENT = 3;
const ELASTICITY = 1;

var shapes = [];
var openPoints = [];
var selectedShape = null;

var gravity = new Vector(0, 0);
var lastMousePos;
document.addEventListener("mousedown", mouseDown);
document.addEventListener("keypress", keyPressed);

ctx.lineWidth = 1;
ctx.font = "16px Arial";

var lastTime = new Date().getTime();
createPolygon(50, 50, 5);
createPolygon(50, 500, 3);
createPolygon(300, 100, 4);
shapes.push(new Polygon(400, 200, [new Vector(-40, -20), new Vector(40, -20), new Vector(40, 20), new Vector(-40, 20)], 15, false));
//shapes.push(new Polygon(400, 10, [new Vector(-400, -10), new Vector(400, -10), new Vector(400, 10), new Vector(-400, 10)], true));

main();

function main() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(main);
}

function draw() {
  let time = new Date().getTime();
  let fps = 1000 / (time - lastTime);
  lastTime = time;
  ctx.fillText("FPS: " + Math.round(fps), 10, 20);
  if (selectedShape != null) {
    ctx.fillText("shape_x: " + Math.round(selectedShape.position.x), 10, 40);
    ctx.fillText("shape_y: " + Math.round(selectedShape.position.y), 10, 60);
    ctx.fillText("shape_velocity_x: " + Math.round(selectedShape.velocity.x), 10, 80);
    ctx.fillText("shape_velocity_y: " + Math.round(selectedShape.velocity.y), 10, 100);
    ctx.fillText("shape_mass: " + Math.round(selectedShape.mass), 10, 120);
  }

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
    shapes[i].selected = false;
    if (shapes[i].position.distanceTo(mousePos) < 8) {
      shapes[i].selected = true;
      selectedFlag = true;
      selectedShape = shapes[i];
      return;
    }
  }
}

function keyPressed(e) {
  if (selectedShape == null) {
    return;
  }
  switch (e.key) {
    case "w":
      selectedShape.velocity.y = -MOVEMENT;
      break;
    case "a":
      selectedShape.velocity.x = -MOVEMENT;
      break;
    case "s":
      selectedShape.velocity.y = MOVEMENT;
      break;
    case "d":
      selectedShape.velocity.x = MOVEMENT;
      break;
    default:
  }
  /*
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
  */
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}
