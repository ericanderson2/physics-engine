const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

document.addEventListener("mousedown", mouseDown);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

var friction = 0.002; //default: 0.02
var angular_friction = 0.001;
var elasticity = 1.0; //default: 1
var do_collision_resolution = true; //default: true
var do_collision_rotation = true;
var show_debug_display = false;
var gravity = new Vector(0, 0);
var impulse_multiplier = 8.0;

var heldKeys = [];
var shapes = [];
var selectedShape = null;

ctx.lineWidth = 1;
ctx.font = "16px Arial";

var lastTime = new Date().getTime();

resetSimulation();

main();

function main() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(main);
}

function draw() {
  ctx.fillStyle = "WhiteSmoke";
  ctx.fillRect(0, 0, 800, 600);

  for (let i in shapes) {
    shapes[i].draw();
  }

//draw FPS
  let time = new Date().getTime();
  let fps = 1000 / (time - lastTime);
  lastTime = time;
  if (show_debug_display) {
    ctx.fillStyle = "black";
    ctx.fillText("FPS: " + Math.round(fps), 10, 20);
  }
}

function update() {
  updateSelectedShape();
  for (let i in shapes) {
    shapes[i].update();
  }
}

function mouseDown(e) {
  let rect = canvas.getBoundingClientRect()
  let mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);

  if (mousePos.x < 0 || mousePos.x > 800 || mousePos.y < 0 || mousePos.y > 600) {
    return;
  }

  for (let i in shapes) {
    shapes[i].selected = false;
  }

  for (let i in shapes) {
    if (polygonContainsPoint(shapes[i], mousePos)) {
      shapes[i].selected = true;
      selectedShape = shapes[i];
      document.getElementById("selectedShapeMass").innerHTML = selectedShape.mass;
      document.getElementById("selectedShapeImmovable").innerHTML = selectedShape.immovable;
      document.getElementById("selectedShapeSides").innerHTML = selectedShape.points.length;
      document.getElementById("noSelectedShape").style.display = "none";
      document.getElementById("box1").style.display = "block";
      return;
    }
  }
  document.getElementById("noSelectedShape").style.display = "block";
  document.getElementById("box1").style.display = "none";
}

function keyDown(e) {
  if (heldKeys.indexOf(e.key) < 0) {
    heldKeys.push(e.key);
  }
}

function keyUp(e) {
  let i = heldKeys.indexOf(e.key);
  if (i > -1) {
    heldKeys.splice(i, 1);
  }
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}

function circle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();
}

function updateSelectedShape() {
  if (selectedShape == null) {
    return;
  }
  for (let i in heldKeys) {
    switch (heldKeys[i]) {
      case "w":
        selectedShape.velocity.y = -impulse_multiplier / 2;
        break;
      case "a":
        selectedShape.velocity.x = -impulse_multiplier / 2;
        break;
      case "s":
        selectedShape.velocity.y = impulse_multiplier / 2;
        break;
      case "d":
        selectedShape.velocity.x = impulse_multiplier / 2;
        break;
      case "r":
        selectedShape.rotVelocity = 0.15;
      default:
    }
  }
  document.getElementById("selectedShapePos").innerHTML = selectedShape.position.roundedToString(0);
  document.getElementById("selectedShapeVel").innerHTML = selectedShape.velocity.roundedToString(1);
  document.getElementById("selectedShapeRot").innerHTML = Math.round(selectedShape.rotVelocity * 100) / 100;
}

function createShape() {
  let x = Number(document.getElementById("xPos").value);
  let y = Number(document.getElementById("yPos").value);
  let sides = Math.abs(Number(document.getElementById("sides").value));
  let radius = Math.abs(Number(document.getElementById("radius").value));
  let mass = Math.max(Math.abs(Number(document.getElementById("mass").value)), 0.01);
  let immovable = Boolean(document.getElementById("immovable").checked);

//limit the shape to inside of the canvas window
  x = Math.max(0 + radius, x);
  x = Math.min(800 - radius, x);
  y = Math.max(0 + radius, y);
  y = Math.min(600 - radius, y);

  createPolygon(x, y, sides, radius, mass, immovable);
}

function addImpulse() {
  for (i in shapes) {
    shapes[i].velocity = new Vector(Math.random() * impulse_multiplier - impulse_multiplier, Math.random() * impulse_multiplier - impulse_multiplier);
  }
}

function resetSimulation() {
  shapes = [];

  shapes.push(new Polygon(400, -10, [new Vector(-400, -50), new Vector(-400, 10), new Vector(400, 10), new Vector(400, -50)], 15, true));
  shapes.push(new Polygon(400, 610, [new Vector(-400, -10), new Vector(-400, 50), new Vector(400, 50), new Vector(400, -10)], 15, true));
  shapes.push(new Polygon(-10, 300, [new Vector(-50, -300), new Vector(-50, 300), new Vector(10, 300), new Vector(10, -300)], 15, true));
  shapes.push(new Polygon(810, 300, [new Vector(-10, -300), new Vector(-10, 300), new Vector(50, 300), new Vector(50, -300)], 15, true));

  createPolygon(600, 400, 5);
  createPolygon(50, 500, 3);
  createPolygon(300, 100, 4);
  createPolygon(500, 200, 6);
  createPolygon(200, 400, 7);
  createPolygon(600, 220, 4, 50, 5, true);

  friction = 0.002;
  elasticity = 1.0;
  angular_friction = 0.001
  gravity = new Vector(0, 0);
  impulse_multiplier = 8;
  show_debug_display = false
  do_collision_resolution = true;
  do_collision_rotation = true;

  document.getElementById("friction").innerHTML = "Friction: " + (friction * 100);
  document.getElementById("elasticity").innerHTML = "Elasticity: " + elasticity;
  document.getElementById("angularFriction").innerHTML = "Angular Friction: " + (angular_friction * 100);
  document.getElementById("gravity").innerHTML = "Gravity: (" + (gravity.x * 10) + ", " + (gravity.y * 10) + ")";
  document.getElementById("collisionResolution").checked = true;
  document.getElementById("collisionRotation").checked = true;

  document.getElementById("frictionSlider").value = friction * 100;
  document.getElementById("elasticitySlider").value = elasticity;
  document.getElementById("angularFrictionSlider").value = angular_friction * 100;
  document.getElementById("gravityXSlider").value = gravity.x * 10;
  document.getElementById("gravityYSlider").value = gravity.y * 10;
  document.getElementById("impulseSlider").value = 8;

  document.getElementById("xPos").value = 400;
  document.getElementById("yPos").value = 300;
  document.getElementById("sides").value = 4;
  document.getElementById("radius").value = 50;
  document.getElementById("mass").value = 5;
  document.getElementById("immovable").checked = false;

  document.getElementById("noSelectedShape").style.display = "block";
  document.getElementById("box1").style.display = "none";
  selectedShape = null;
}

function frictionChange(value) {
  friction = value / 100;
  document.getElementById("friction").innerHTML = "Friction: " + value;
}

function elasticityChange(value) {
  elasticity = value;
  document.getElementById("elasticity").innerHTML = "Elasticity: " + value;
}

function angularFrictionChange(value) {
  angular_friction = value / 100;
  document.getElementById("angularFriction").innerHTML = "Angular Friction: " + value;
}

function gravityXChange(value) {
  gravity.x = value / 10;
  document.getElementById("gravity").innerHTML = "Gravity: (" + value + ", " + (gravity.y * 10) + ")";
}

function gravityYChange(value) {
  gravity.y = value / 10;
  document.getElementById("gravity").innerHTML = "Gravity: (" + (gravity.x * 10) + ", " + value + ")";
}

function collisionResolutionChange(value) {
  do_collision_resolution = value;
}

function collisionRotationChange(value) {
  do_collision_rotation = value;
}

function impulseChange(value) {
  impulse_multiplier = value;
}
