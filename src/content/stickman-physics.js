/**
 * Interactive Physics-Based Stickman
 * A draggable, throwable stickman with gravity and collision detection
 */

const STICKMAN_ASSET_PATH = "assets/stickman-thicc.png";

const PHYSICS = {
  gravity: 0.5,
  friction: 0.98,
  bounce: 0.7,
  maxVelocity: 150,
  mass: 1,
  size: 160,
};

const ANIMATION_FRAME_RATE = 1000 / 60; // ~60fps

let stickmanPhy = null;

class InteractiveStickman {
  constructor() {
    this.x = window.innerWidth * 0.8;
    this.y = window.innerHeight * 0.2;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.angularVelocity = 0;
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.lastX = this.x;
    this.lastY = this.y;
    this.element = null;
    this.mouseStartX = 0;
    this.mouseStartY = 0;
    this.animationId = null;
    this.created = false;
  }

  create() {
    if (this.created) return;

    // Create container
    this.element = document.createElement("div");
    this.element.id = "interactive-stickman";
    this.element.style.cssText = `
      position: fixed;
      left: ${this.x}px;
      top: ${this.y}px;
      width: ${PHYSICS.size}px;
      height: ${PHYSICS.size}px;
      cursor: grab;
      z-index: 2147483646;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: cursor 0.1s;
      pointer-events: auto;
      transform: rotate(${this.rotation}deg);
      transform-origin: center center;
    `;

    // Create image
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL(STICKMAN_ASSET_PATH);
    img.alt = "Interactive Stickman";
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      user-select: none;
      pointer-events: none;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    `;

    this.element.appendChild(img);
    document.body.appendChild(this.element);

    // Bind events
    this.element.addEventListener("mousedown", (e) => this.onMouseDown(e));
    document.addEventListener("mousemove", (e) => this.onMouseMove(e));
    document.addEventListener("mouseup", (e) => this.onMouseUp(e));

    // Touch events for mobile
    this.element.addEventListener("touchstart", (e) => this.onTouchStart(e));
    document.addEventListener("touchmove", (e) => this.onTouchMove(e));
    document.addEventListener("touchend", (e) => this.onTouchEnd(e));

    this.created = true;
    this.startPhysicsLoop();
  }

  destroy() {
    if (!this.created) return;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    document.removeEventListener("mousemove", (e) => this.onMouseMove(e));
    document.removeEventListener("mouseup", (e) => this.onMouseUp(e));
    document.removeEventListener("touchmove", (e) => this.onTouchMove(e));
    document.removeEventListener("touchend", (e) => this.onTouchEnd(e));

    this.created = false;
  }

  onMouseDown(e) {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.mouseStartX = e.clientX;
    this.mouseStartY = e.clientY;
    this.dragOffsetX = e.clientX - this.x;
    this.dragOffsetY = e.clientY - this.y;
    this.element.style.cursor = "grabbing";
    this.vx = 0;
    this.vy = 0;
    this.angularVelocity = 0;
  }

  onMouseMove(e) {
    if (!this.isDragging) return;

    const newX = e.clientX - this.dragOffsetX;
    const newY = e.clientY - this.dragOffsetY;

    this.vx = (newX - this.x) / (ANIMATION_FRAME_RATE / 1000);
    this.vy = (newY - this.y) / (ANIMATION_FRAME_RATE / 1000);

    this.x = newX;
    this.y = newY;
    this.updatePosition();
  }

  onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.element.style.cursor = "grab";

    // Calculate throw velocity
    const throwScale = 3; // Amplify throw velocity
    this.vx = ((e.clientX - this.mouseStartX) / ANIMATION_FRAME_RATE) * throwScale;
    this.vy = ((e.clientY - this.mouseStartY) / ANIMATION_FRAME_RATE) * throwScale;

    // Cap velocity
    const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    if (speed > PHYSICS.maxVelocity) {
      const scale = PHYSICS.maxVelocity / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // Calculate angular velocity based on throw direction and magnitude
    const throwDist = Math.hypot(e.clientX - this.mouseStartX, e.clientY - this.mouseStartY);
    this.angularVelocity = (throwDist / 50) * 10; // Spin proportional to throw distance
  }

  onTouchStart(e) {
    if (e.touches.length < 1) return;
    const touch = e.touches[0];
    this.isDragging = true;
    this.mouseStartX = touch.clientX;
    this.mouseStartY = touch.clientY;
    this.dragOffsetX = touch.clientX - this.x;
    this.dragOffsetY = touch.clientY - this.y;
    this.vx = 0;
    this.vy = 0;
    this.angularVelocity = 0;
  }

  onTouchMove(e) {
    if (!this.isDragging || e.touches.length < 1) return;
    const touch = e.touches[0];

    const newX = touch.clientX - this.dragOffsetX;
    const newY = touch.clientY - this.dragOffsetY;

    this.vx = (newX - this.x) / (ANIMATION_FRAME_RATE / 1000);
    this.vy = (newY - this.y) / (ANIMATION_FRAME_RATE / 1000);

    this.x = newX;
    this.y = newY;
    this.updatePosition();
  }

  onTouchEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (e.changedTouches.length < 1) {
      this.vx = 0;
      this.vy = 0;
      return;
    }

    // Calculate throw velocity from last touch
    const touch = e.changedTouches[0];
    const throwScale = 3;
    this.vx = ((touch.clientX - this.mouseStartX) / ANIMATION_FRAME_RATE) * throwScale;
    this.vy = ((touch.clientY - this.mouseStartY) / ANIMATION_FRAME_RATE) * throwScale;

    // Cap velocity
    const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    if (speed > PHYSICS.maxVelocity) {
      const scale = PHYSICS.maxVelocity / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // Calculate angular velocity based on throw direction and magnitude
    const throwDist = Math.hypot(touch.clientX - this.mouseStartX, touch.clientY - this.mouseStartY);
    this.angularVelocity = (throwDist / 50) * 10; // Spin proportional to throw distance
  }

  startPhysicsLoop() {
    const update = () => {
      if (!this.isDragging) {
        // Apply gravity
        this.vy += PHYSICS.gravity;

        // Apply friction
        this.vx *= PHYSICS.friction;
        this.vy *= PHYSICS.friction;

        // Apply angular friction
        this.angularVelocity *= 0.98;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Update rotation
        this.rotation += this.angularVelocity;

        // Collision detection with viewport
        const padding = 0;

        // Bottom collision
        if (this.y + PHYSICS.size > window.innerHeight - padding) {
          this.y = window.innerHeight - padding - PHYSICS.size;
          this.vy *= -PHYSICS.bounce;

          // Stop tiny bounces
          if (Math.abs(this.vy) < 1) {
            this.vy = 0;
          }
        }

        // Top collision
        if (this.y < padding) {
          this.y = padding;
          this.vy = 0;
        }

        // Right collision
        if (this.x + PHYSICS.size > window.innerWidth - padding) {
          this.x = window.innerWidth - padding - PHYSICS.size;
          this.vx *= -PHYSICS.bounce;

          if (Math.abs(this.vx) < 1) {
            this.vx = 0;
          }
        }

        // Left collision
        if (this.x < padding) {
          this.x = padding;
          this.vx = 0;
        }
      }

      this.updatePosition();
      this.animationId = requestAnimationFrame(update);
    };

    this.animationId = requestAnimationFrame(update);
  }

  updatePosition() {
    if (this.element) {
      this.element.style.left = `${Math.round(this.x)}px`;
      this.element.style.top = `${Math.round(this.y)}px`;
      this.element.style.transform = `rotate(${this.rotation}deg)`;
    }
  }

  resetPosition() {
    this.x = window.innerWidth * 0.8;
    this.y = window.innerHeight * 0.2;
    this.vx = 0;
    this.vy = 0;
    this.updatePosition();
  }
}

function initializeInteractiveStickman() {
  if (stickmanPhy) {
    stickmanPhy.destroy();
  }

  stickmanPhy = new InteractiveStickman();
  stickmanPhy.create();
}

function disableInteractiveStickman() {
  if (stickmanPhy) {
    stickmanPhy.destroy();
    stickmanPhy = null;
  }
}

// Listen for setting changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;

  if (changes.interactiveStickman) {
    const enabled = changes.interactiveStickman.newValue;
    if (enabled) {
      initializeInteractiveStickman();
    } else {
      disableInteractiveStickman();
    }
  }
});

// Initialize if setting is enabled
(async () => {
  const result = await chrome.storage.sync.get({ interactiveStickman: false });
  if (result.interactiveStickman) {
    initializeInteractiveStickman();
  }
})();
