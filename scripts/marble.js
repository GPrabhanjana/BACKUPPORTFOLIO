(function () {
const dropPalette = [
  [123, 57, 113],   // #7B3971
  [148, 31, 66],    // #941F42
  [210, 32, 42],    // #D2202A
  [248, 128, 66],   // #F88042
  [255, 193, 150],  // #FFC196
  [253, 227, 227],  // #FDE3E3
];

  // The animation is intentionally organic, so it does not need retina-level
  // geometry or a 60 fps simulation to read as fluid.
  const circleDetail = 84;
  const MAX_PIXEL_DENSITY = 1.5;

  // How far beyond the canvas edges to generate drops, as a fraction of canvas size.
  // This ensures there is always textured geometry behind any area that pointer/vortex
  // distortion can reach, so no cream background bleeds through at the borders.
  const OVERSCAN = 0.35;

  class Drop {
    constructor(p, x, y, r) {
      this.center = p.createVector(x, y);
      this.r = r;
      this.baseVertices = [];
      for (let i = 0; i < circleDetail; i++) {
        const angle = p.map(i, 0, circleDetail, 0, p.TWO_PI);
        const v = p.createVector(p.cos(angle), p.sin(angle));
        v.mult(this.r);
        v.add(this.center);
        this.baseVertices[i] = v;
      }
      this.vertices = this.baseVertices.map(v => v.copy());
      this.ambientOffset = this.baseVertices.map(() => ({ x: 0, y: 0 }));
      this.pointerOffset = this.baseVertices.map(() => ({ x: 0, y: 0 }));
      this.col = p.random(dropPalette);
    }

    vTine(x, z, c, dir) {
      const u = 1 / Math.pow(2, 1 / c);
      for (const v of this.baseVertices) {
        if (dir === 0) v.y = v.y + z * Math.pow(u, Math.abs(v.x - x));
        else if (dir === 1) v.y = v.y - z * Math.pow(u, Math.abs(v.x - x));
      }
    }

    hTine(y, z, c, dir) {
      const u = 1 / Math.pow(2, 1 / c);
      for (const v of this.baseVertices) {
        if (dir === 0) v.x = v.x + z * Math.pow(u, Math.abs(v.y - y));
        else if (dir === 1) v.x = v.x - z * Math.pow(u, Math.abs(v.y - y));
      }
    }

    marble(other) {
      for (const v of this.baseVertices) {
        const c = other.center;
        const r = other.r;
        const p = v.copy();
        p.sub(c);
        const m = p.mag();
        const root = Math.sqrt(1 + (r * r) / (m * m));
        p.mult(root);
        p.add(c);
        v.set(p);
      }
    }

    applyVortices(vortices, canvasW, canvasH, strength) {
      for (let i = 0; i < this.baseVertices.length; i++) {
        const base = this.baseVertices[i];
        const off = this.ambientOffset[i];

        for (const vo of vortices) {
          const vx0 = vo.fx * canvasW;
          const vy0 = vo.fy * canvasH;
          const radius = vo.r * Math.max(canvasW, canvasH);
          const px0 = base.x + off.x;
          const py0 = base.y + off.y;
          const dx = px0 - vx0;
          const dy = py0 - vy0;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius && dist > 0.0001) {
            const falloff = 1 - dist / radius;
            const angle = vo.speed * vo.dir * falloff * strength * 0.05;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const rx = dx * cosA - dy * sinA;
            const ry = dx * sinA + dy * cosA;
            off.x = (vx0 + rx) - base.x;
            off.y = (vy0 + ry) - base.y;
          }
        }

        const maxAmbient = this.r * 0.5;
        const mag = Math.sqrt(off.x * off.x + off.y * off.y);
        if (mag > maxAmbient) {
          const scale = maxAmbient / mag;
          off.x *= scale;
          off.y *= scale;
        }
      }
    }

    applyPointerFlow(px, py, speed, dir, radius, strength) {
      for (let i = 0; i < this.baseVertices.length; i++) {
        const base = this.baseVertices[i];
        const off = this.pointerOffset[i];
        const curX = base.x + off.x;
        const curY = base.y + off.y;
        const dx = curX - px;
        const dy = curY - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius && dist > 0.0001) {
          const falloff = 1 - dist / radius;
          const angle = dir * speed * falloff * strength;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const rx = dx * cosA - dy * sinA;
          const ry = dx * sinA + dy * cosA;
          off.x = (px + rx) - base.x;
          off.y = (py + ry) - base.y;
        }
      }
    }

    settle() {
      const maxPointer = this.r * 0.9;
      for (let i = 0; i < this.baseVertices.length; i++) {
        const pOff = this.pointerOffset[i];
        pOff.x *= 0.94;
        pOff.y *= 0.94;

        const pMag = Math.sqrt(pOff.x * pOff.x + pOff.y * pOff.y);
        if (pMag > maxPointer) {
          const scale = maxPointer / pMag;
          pOff.x *= scale;
          pOff.y *= scale;
        }

        const aOff = this.ambientOffset[i];
        const base = this.baseVertices[i];
        const out = this.vertices[i];
        out.x = base.x + aOff.x + pOff.x;
        out.y = base.y + aOff.y + pOff.y;
      }
    }

    show(p) {
      p.fill(this.col[0], this.col[1], this.col[2]);
      p.noStroke();
      p.beginShape();
      for (const v of this.vertices) p.vertex(v.x, v.y);
      p.endShape(p.CLOSE);
    }
  }

  // Shared scene builder. Takes explicit pixel dimensions so the same logic
  // works for both the animated and reduced-motion variants.
  // pads generates drop centres in the range [-padW .. W+padW, -padH .. H+padH]
  // so border interactions always have textured geometry behind them.
  function buildDrops(p, W, H) {
    const n = 7;
    const padW = W * OVERSCAN;
    const padH = H * OVERSCAN;

    // Spacing is based on the visible area as before; bleed simply adds extra columns/rows.
    const sp = W / n;
    const blobRadius = W / (3 * n);

    let centerPoints = [];
    for (let i = sp - padW; i < W + padW; i += sp) {
      for (let j = sp - padH; j < H + padH; j += sp) {
        centerPoints.push(p.createVector(i, j));
      }
    }
    centerPoints = p.shuffle(centerPoints);

    const drops = [];
    const layersPerPoint = 3;
    for (let i = 0; i < centerPoints.length; i++) {
      for (let j = 0; j < layersPerPoint; j++) {
        const drop = new Drop(p, centerPoints[i].x, centerPoints[i].y, blobRadius);
        for (const other of drops) other.marble(drop);
        drops.push(drop);
      }
    }

    // Tine passes sweep the full extended area so the pattern is seamless up to the edges.
    const tinePasses = 10;
    for (const drop of drops) {
      for (let k = 0; k < tinePasses; k++) {
        const frac = (k + 1) / (tinePasses + 1);
        const dir = k % 2;
        // Tine positions sweep the visible range; bleed drops still receive the correct
        // displacement because vTine / hTine fall off with distance from the tine position.
        drop.vTine(W * frac, 95, 16, dir);
        drop.hTine(H * frac, 95, 16, 1 - dir);
      }
    }

    return drops;
  }

  const sketch = (p) => {
    let drops = [];
    let container;
    let hero;
    let sceneActive = false;

    let px = -9999, py = -9999;
    let prevPx = -9999, prevPy = -9999;
    let vx = 0, vy = 0;
    let hasPointer = false;

    let vortices = [];

    function buildVortices() {
      vortices = [
        { fx: 0.22, fy: 0.30, speed: 0.45, dir:  1, r: 0.5 },
        { fx: 0.78, fy: 0.25, speed: 0.6,  dir: -1, r: 0.45 },
        { fx: 0.5,  fy: 0.7,  speed: 0.35, dir:  1, r: 0.55 },
        { fx: 0.85, fy: 0.8,  speed: 0.5,  dir: -1, r: 0.4 },
      ];
    }

    function getSceneSize() {
      return {
        width: Math.max(1, container.clientWidth),
        height: Math.max(1, container.clientHeight),
      };
    }

    function startScene() {
      if (sceneActive || !container) return;
      const { width, height } = getSceneSize();
      p.resizeCanvas(width, height, true);
      drops = buildDrops(p, p.width, p.height);
      sceneActive = true;
      p.loop();
    }

    function stopScene() {
      if (!sceneActive) return;
      p.noLoop();
      drops = [];
      // Release the viewport-sized backing store while later sections cover
      // the sticky hero. The scene is rebuilt only when it is needed again.
      p.resizeCanvas(1, 1, true);
      sceneActive = false;
    }

    function updateSceneVisibility() {
      const heroIsCurrent = hero && window.scrollY < hero.offsetHeight;
      if (!document.hidden && heroIsCurrent) startScene();
      else stopScene();
    }

    p.setup = function () {
      container = document.getElementById('marble-canvas');
      hero = container.closest('.hero');
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_DENSITY));
      const { width, height } = getSceneSize();
      const cnv = p.createCanvas(width, height);
      cnv.parent('marble-canvas');
      drops = buildDrops(p, p.width, p.height);
      buildVortices();
      sceneActive = true;
      p.frameRate(30);

      container.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;
        if (!hasPointer) {
          prevPx = newX;
          prevPy = newY;
        }
        px = newX;
        py = newY;
        hasPointer = true;
        document.documentElement.style.setProperty('--pointer-x', (px / rect.width * 100) + '%');
        document.documentElement.style.setProperty('--pointer-y', (py / rect.height * 100) + '%');
      });
      container.addEventListener('pointerleave', () => {
        hasPointer = false;
      });

      let scrollTicking = false;
      window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          updateSceneVisibility();
          scrollTicking = false;
        });
      }, { passive: true });
      document.addEventListener('visibilitychange', updateSceneVisibility);
      updateSceneVisibility();
    };

    p.draw = function () {
      p.background(247, 244, 236);

      for (const drop of drops) {
        drop.applyVortices(vortices, p.width, p.height, 0.6);
      }

      if (hasPointer) {
        vx = p.constrain(px - prevPx, -40, 40);
        vy = p.constrain(py - prevPy, -40, 40);
        prevPx = px;
        prevPy = py;

        const moveMag = Math.sqrt(vx * vx + vy * vy);
        const baseSpeed = 0.06;
        const moveBoost = Math.min(moveMag * 0.004, 0.16);
        const radius = Math.max(p.width, p.height) * 0.3;
        const strength = 1;

        for (const drop of drops) {
          drop.applyPointerFlow(px, py, baseSpeed + moveBoost, 1, radius, strength);
        }
      }

      for (const drop of drops) {
        drop.settle();
        drop.show(p);
      }
    };

    p.windowResized = function () {
      if (!sceneActive) return;
      const { width, height } = getSceneSize();
      p.resizeCanvas(width, height, true);
      drops = buildDrops(p, p.width, p.height);
    };
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    const staticSketch = (p) => {
      let drops = [];
      let container;

      p.setup = function () {
        container = document.getElementById('marble-canvas');
        const cnv = p.createCanvas(container.clientWidth, container.clientHeight);
        cnv.parent('marble-canvas');
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        drops = buildDrops(p, p.width, p.height);
        p.noLoop();
      };

      p.draw = function () {
        p.background(247, 244, 236);
        for (const drop of drops) drop.show(p);
      };
    };

    new p5(staticSketch);
  } else {
    new p5(sketch);
  }
})();
