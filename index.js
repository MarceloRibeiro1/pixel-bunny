const img = new Image();
img.crossOrigin = "anonymous";
img.src = "./bunny.png";
const canvas = document.getElementById("canvas");
const root = document.getElementById("root");
const ctx = canvas.getContext("2d");
let pixelBunny = [];

let FRAMES_PER_SECOND = 30;

let mouseX = 0;
let mouseY = 0;
let lastFrameTime = 0;

let MOUSE_FORCE = 2;
let MOUSE_RANGE = 60;
let SPRING_FORCE = 0.9;
let POINT_DENSITY = 10;
let POINT_SIZE = 3;

let FRAME_MIN_TIME =
    (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;

const debugging = false;


img.addEventListener("load", () => {
  loadBunny();

  if (debugging) {
    pixelBunny.push({
      start_x: 100,
      start_y: 100,
      x: 100 + Math.floor(Math.random() * 200 - 100),
      y: 100 + Math.floor(Math.random() * 200 - 100),
      direction: Math.floor(Math.random() * 360 - 180),
      speed: 0,
    });
  }

  console.log("Carregou");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 658, 801);
  ctx.fillStyle = "black";

  paintBunny();
});

function loadBunny() {
  ctx.drawImage(img, 0, 0);
  img.style.display = "none";

  pixelBunny = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < canvas.width / POINT_DENSITY; i++) {
    for (let j = 0; j < canvas.height / POINT_DENSITY; j++) {
      const pixel = ctx.getImageData(x, y, 1, 1);
      const data = pixel.data;

      const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;

      if (rgba === "rgba(0, 0, 0, 1)" && !debugging) {
        pixelBunny.push({
          start_x: x,
          start_y: y,
          x: x + Math.floor(Math.random() * 200 - 100),
          y: y + Math.floor(Math.random() * 200 - 100),
          direction: 0,
          speed: 0,
        });
      }

      y += POINT_DENSITY;
    }
    y = 0;
    x += POINT_DENSITY;
  }
}

function paintBunny() {
  for (let i = 0; i < pixelBunny.length; i++) {
    const element = pixelBunny[i];

    let xOffset = element.x;
    let yOffset = element.y;


      const distance = Math.sqrt(
          Math.pow(element.start_x - xOffset, 2) +
          Math.pow(element.start_y - yOffset, 2)
      );

      const force = SPRING_FORCE
      const angle = (
          Math.atan2(element.start_y - element.y, element.start_x - element.x) *
          (180 / Math.PI)
      );

      addForce(force,i, angle);



    mouseCollision(i);

    if (distance > 1 && pixelBunny[i].speed > 1) {
      addForce(0.4, i, pixelBunny[i].direction - 180)
    }

    {
      if (pixelBunny[i].speed < 1 && distance < 5) {
        pixelBunny[i].speed = 0;
        pixelBunny[i].x = pixelBunny[i].start_x;
        pixelBunny[i].y = pixelBunny[i].start_y;

      } else {
        pixelBunny[i].x += pixelBunny[i].speed * Math.cos(pixelBunny[i].direction * (Math.PI / 180));

        pixelBunny[i].y += pixelBunny[i].speed * Math.sin(pixelBunny[i].direction * (Math.PI / 180));
      }

    }


    ctx.fillRect(pixelBunny[i].x, pixelBunny[i].y, POINT_SIZE, POINT_SIZE);

    if (debugging) {

      ctx.fillStyle = 'red';

      ctx.fillRect(pixelBunny[i].start_x, pixelBunny[i].start_y, POINT_SIZE, POINT_SIZE);
      ctx.fillStyle = 'black';
    }
  }
}

function mouseCollision(i) {
  const {x, y} = pixelBunny[i];


  const distance = Math.sqrt(
      Math.pow(x - mouseX, 2) +
      Math.pow(y - mouseY, 2)
  );

  if (distance < MOUSE_RANGE) {
    const angle = - (
        Math.atan2(mouseY - y, mouseX - x) *
        (180 / Math.PI)
    );
    addForce(MOUSE_FORCE,i, angle);
  }
}

function addForce(force, i, direction) {

  const pixelDirection = (pixelBunny[i].direction * Math.PI) / 180;
  const forceDirection = (direction * Math.PI) / 180;

  const x1 = pixelBunny[i].speed * Math.cos(pixelDirection);
  const y1 = pixelBunny[i].speed * Math.sin(pixelDirection);

  const x2 = force * Math.cos(forceDirection);
  const y2 = force * Math.sin(forceDirection);

  const xVector = x1 + x2;
  const yVector = y1 + y2;

  const newSpeed = Math.sqrt(xVector * xVector + yVector * yVector);

  pixelBunny[i].direction = (Math.atan2(yVector, xVector) * 180) / Math.PI;

  if (pixelBunny[i].speed < 30) {
    pixelBunny[i].speed = Math.min(30, newSpeed);

  }

}
function setMovement(index, direction) {
  pixelBunny[index].direction = direction;
  if (pixelBunny[index].offset < 30) pixelBunny[index].offset += 5;
}

function render(time) {
  if (time - lastFrameTime < FRAME_MIN_TIME) {
    requestAnimationFrame(render);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lastFrameTime = time;

  paintBunny();
  console.log('---------------------------')

  requestAnimationFrame(render);
}

root.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});

requestAnimationFrame(render);


const fps = document.getElementById("fps");
fps.addEventListener("input", function() {
  FRAMES_PER_SECOND = parseInt(fps.value);
  FRAME_MIN_TIME =
      (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;
  fps.nextElementSibling.textContent = 'FPS: ' + FRAMES_PER_SECOND
});

const mouse_force = document.getElementById("mouse_force");
mouse_force.addEventListener("input", function() {
  MOUSE_FORCE = parseInt(mouse_force.value);
  mouse_force.nextElementSibling.textContent = 'mouse_force: ' + MOUSE_FORCE
});

const mouse_range = document.getElementById("mouse_range");
mouse_range.addEventListener("input", function() {
  MOUSE_RANGE = parseInt(mouse_range.value);
  mouse_range.nextElementSibling.textContent = 'mouse_range: ' + MOUSE_RANGE
});

const point_density = document.getElementById("point_density");
point_density.addEventListener("input", function() {
  POINT_DENSITY = parseInt(point_density.value);
  point_density.nextElementSibling.textContent = 'point_density: ' + POINT_DENSITY
});

const point_density_reset = document.getElementById("point_density_reset");
point_density_reset.addEventListener("click", function() {
  loadBunny()
});

const point_size = document.getElementById("point_size");
point_size.addEventListener("input", function() {
  POINT_SIZE = parseInt(point_size.value);
  point_size.nextElementSibling.textContent = 'point_size: ' + POINT_SIZE
});


const preset_default = document.getElementById("preset_default");
preset_default.addEventListener("click", function() {
  FRAMES_PER_SECOND = 30;
  MOUSE_FORCE = 2;
  MOUSE_RANGE = 60;
  POINT_DENSITY = 10;
  POINT_SIZE = 3;
  FRAME_MIN_TIME =
      (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;

  fps.nextElementSibling.textContent = 'FPS: ' + FRAMES_PER_SECOND
  fps.value = FRAMES_PER_SECOND
  mouse_force.nextElementSibling.textContent = 'mouse_force: ' + MOUSE_FORCE
  mouse_force.value = MOUSE_FORCE
  mouse_range.nextElementSibling.textContent = 'mouse_range: ' + MOUSE_RANGE
  mouse_range.value = MOUSE_RANGE
  point_density.nextElementSibling.textContent = 'point_density: ' + POINT_DENSITY
  point_density.value = POINT_DENSITY
  point_size.nextElementSibling.textContent = 'point_size: ' + POINT_SIZE
  point_size.value = POINT_SIZE
  loadBunny()
});

const preset_blocky = document.getElementById("preset_blocky");
preset_blocky.addEventListener("click", function() {
  FRAMES_PER_SECOND = 60;
  MOUSE_FORCE = 3;
  MOUSE_RANGE = 24;
  POINT_DENSITY = 7;
  POINT_SIZE = 5;
  FRAME_MIN_TIME =
      (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;

  fps.nextElementSibling.textContent = 'FPS: ' + FRAMES_PER_SECOND
  fps.value = FRAMES_PER_SECOND
  mouse_force.nextElementSibling.textContent = 'mouse_force: ' + MOUSE_FORCE
  mouse_force.value = MOUSE_FORCE
  mouse_range.nextElementSibling.textContent = 'mouse_range: ' + MOUSE_RANGE
  mouse_range.value = MOUSE_RANGE
  point_density.nextElementSibling.textContent = 'point_density: ' + POINT_DENSITY
  point_density.value = POINT_DENSITY
  point_size.nextElementSibling.textContent = 'point_size: ' + POINT_SIZE
  point_size.value = POINT_SIZE
  loadBunny()
});