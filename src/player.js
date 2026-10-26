
export function createPlayer(camera, canvas) {
  const keys = new Set();
  const touchDirections = new Set();
  let lookMode = false;
  let lastTouchX = null;
  let lastTouchY = null;

  const speed = 3.2;
  const minX = -4.3;
  const maxX = 4.3;
  const minZ = -16.3;
  const maxZ = 8;

  camera.position.set(0, 1.65, 7);
  camera.rotation.order = "YXZ";

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
      keys.add(key);
    }
  }

  function onKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", () => {
    keys.clear();
    touchDirections.clear();
  });

  document.querySelectorAll("[data-dir]").forEach(button => {
    const direction = button.dataset.dir;
    const start = event => {
      event.preventDefault();
      touchDirections.add(direction);
      button.setPointerCapture?.(event.pointerId);
    };
    const stop = event => {
      event.preventDefault();
      touchDirections.delete(direction);
    };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("lostpointercapture", () => touchDirections.delete(direction));
    button.addEventListener("contextmenu", e => e.preventDefault());
  });

  const lookButton = document.getElementById("look-mode");
  lookButton?.addEventListener("click", () => {
    lookMode = !lookMode;
    lookButton.textContent = lookMode ? "النظر مفعل" : "تحريك النظر";
    lastTouchX = null;
    lastTouchY = null;
  });

  canvas.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch" && lookMode) {
      lastTouchX = event.clientX;
      lastTouchY = event.clientY;
    }
  });

  canvas.addEventListener("pointermove", event => {
    if (event.pointerType !== "touch" || !lookMode || lastTouchX === null) return;
    const dx = event.clientX - lastTouchX;
    const dy = event.clientY - lastTouchY;
    camera.rotation.y -= dx * 0.004;
    camera.rotation.x -= dy * 0.003;
    camera.rotation.x = Math.max(-0.55, Math.min(0.55, camera.rotation.x));
    lastTouchX = event.clientX;
    lastTouchY = event.clientY;
  });

  canvas.addEventListener("pointerup", () => {
    lastTouchX = null;
    lastTouchY = null;
  });
  canvas.addEventListener("pointercancel", () => {
    lastTouchX = null;
    lastTouchY = null;
  });

  function update(deltaSeconds) {
    const forward = keys.has("w") || keys.has("arrowup") || touchDirections.has("forward");
    const backward = keys.has("s") || keys.has("arrowdown") || touchDirections.has("back");
    const left = keys.has("a") || keys.has("arrowleft") || touchDirections.has("left");
    const right = keys.has("d") || keys.has("arrowright") || touchDirections.has("right");

    let xDirection = Number(right) - Number(left);
    let zDirection = Number(backward) - Number(forward);
    const length = Math.hypot(xDirection, zDirection);

    if (length > 0) {
      xDirection /= length;
      zDirection /= length;
      const yaw = camera.rotation.y;
      const dx = (xDirection * Math.cos(yaw) + zDirection * Math.sin(yaw)) * speed * deltaSeconds;
      const dz = (-xDirection * Math.sin(yaw) + zDirection * Math.cos(yaw)) * speed * deltaSeconds;

      camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x + dx));
      camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z + dz));
    }

    camera.position.y = 1.65;
    camera.rotation.x = Math.max(-0.6, Math.min(0.6, camera.rotation.x));
  }

  function destroy() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  }

  return { update, destroy };
}
