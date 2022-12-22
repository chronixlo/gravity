const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("mousemove", onMouseMove);

const w = canvas.clientWidth;
const h = canvas.clientHeight;
const maxConnectorLength = 300;
const GRAVITY_FACTOR = 0.00001;
const initialNodes = Math.round((w * h) / 130000);
const nodes = new Array(initialNodes)
  .fill()
  .map(() => createNode({ x: random(w), y: random(h) }));

let isMouseDown = false;
let mouseX;
let mouseY;

loop();

function onMouseDown(e) {
  isMouseDown = true;
  nodes.push(createNode({ x: mouseX, y: mouseY }));
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

function onMouseUp() {
  isMouseDown = false;
}

function loop() {
  canvas.height = h;
  canvas.width = w;

  // update positions
  nodes.forEach((node) => {
    let offsetX = node.vectorX;
    let offsetY = node.vectorY;

    // gravity
    nodes.forEach((sibling) => {
      const diffX = node.x - sibling.x;
      const diffY = node.y - sibling.y;
      const distance = Math.hypot(diffX, diffY);
      if (distance && distance < maxConnectorLength) {
        const pullStrength = 1 - distance / maxConnectorLength;

        const sizeRatio = sibling.size / node.size;

        const pull = pullStrength * GRAVITY_FACTOR * sizeRatio;

        offsetX += diffX * -pull;
        offsetY += diffY * -pull;
      }
    });

    node.vectorX = offsetX;
    node.vectorY = offsetY;
    node.x += offsetX;
    node.y += offsetY;

    // out of bounds
    if (
      node.y < -node.size - maxConnectorLength ||
      node.x > w + node.size + maxConnectorLength ||
      node.y > h + node.size + maxConnectorLength ||
      node.x < -node.size - maxConnectorLength
    ) {
      Object.assign(node, createNode());
    }
  });

  // draw nodes
  nodes.forEach((node) => {
    ctx.fillStyle = node.color;
    ctx.strokeStyle = node.color;
    ctx.lineWidth = node.lineWidth;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fill();

    // draw connectors
    nodes.forEach((sibling) => {
      const distance = Math.hypot(
        Math.abs(node.x - sibling.x),
        Math.abs(node.y - sibling.y)
      );

      if (distance && distance < maxConnectorLength) {
        const ratio = distance / maxConnectorLength;
        ctx.strokeStyle =
          node.color +
          Math.floor(64 - ratio * 64)
            .toString(16)
            .padStart(2, "0");
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(sibling.x, sibling.y);
        ctx.closePath();
        ctx.stroke();
      }
    });
  });

  nodes.forEach;

  requestAnimationFrame(loop);
}

function random(max) {
  return Math.floor(Math.random() * max);
}

function createNode(props) {
  const spawningSide = random(4);
  const size = (random(2) + 1) * 10;

  let x, y;

  if (spawningSide === 0) {
    x = random(w);
    y = -size - maxConnectorLength;
  } else if (spawningSide === 1) {
    x = -size - maxConnectorLength;
    y = random(h);
  } else if (spawningSide === 2) {
    x = random(w);
    y = h + size + maxConnectorLength;
  } else {
    x = w + size + maxConnectorLength;
    y = random(h);
  }

  return {
    x,
    y,
    size,
    color: "#ffeedd",
    lineWidth: 3,
    vectorX: (random(3) - 1) / 10,
    vectorY: (random(3) - 1) / 10,
    ...props,
  };
}
