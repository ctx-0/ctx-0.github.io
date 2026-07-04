// ── theme field picker ──
const themes = {
  "paper-green": {
    bg: "#f8f7f3",
    ink: "#111110",
    ink2: "#4f4d49",
    ink3: "#807b74",
    hue: "#2e5440",
    gold: "#a2873f",
    graphite: "#080b09",
  },
  "silicon-sage": {
    bg: "#edf0e9",
    ink: "#151713",
    ink2: "#4f574f",
    ink3: "#747f75",
    hue: "#365d43",
    gold: "#9a8242",
    graphite: "#111711",
  },
  "warm-mineral": {
    bg: "#eeeae2",
    ink: "#181714",
    ink2: "#555249",
    ink3: "#7c776e",
    hue: "#52624a",
    gold: "#9a7d42",
    graphite: "#171914",
  },
  "wafer-grey": {
    bg: "#e8ebe8",
    ink: "#121513",
    ink2: "#4d5651",
    ink3: "#727d76",
    hue: "#416c59",
    gold: "#968146",
    graphite: "#101512",
  },
  "gold-paper": {
    bg: "#f0ece1",
    ink: "#191713",
    ink2: "#575146",
    ink3: "#7f7769",
    hue: "#796b38",
    gold: "#9d7c36",
    graphite: "#191810",
  },
  "lavender-silicon": {
    bg: "#eceaee",
    ink: "#171519",
    ink2: "#514d56",
    ink3: "#777180",
    hue: "#535a73",
    gold: "#9a8248",
    graphite: "#141318",
  },
  "dark-silicon": {
    bg: "#0d110e",
    ink: "#e4e7df",
    ink2: "#bcc4ba",
    ink3: "#8f9a91",
    hue: "#78a584",
    gold: "#b59a55",
    graphite: "#070a08",
    dark: true,
  },
  "graphite-silicon": {
    bg: "#101311",
    ink: "#e4e6e1",
    ink2: "#bbc2bc",
    ink3: "#8e9790",
    hue: "#769a7c",
    gold: "#ad9557",
    graphite: "#090b0a",
    dark: true,
  },
  "blue-wafer": {
    bg: "#0d1115",
    ink: "#e1e5e7",
    ink2: "#b8c2c8",
    ink3: "#8b97a0",
    hue: "#718c91",
    gold: "#aa9258",
    graphite: "#070a0d",
    dark: true,
  },
  "olive-terminal": {
    bg: "#12150e",
    ink: "#e6e8dc",
    ink2: "#bec4b0",
    ink3: "#939a83",
    hue: "#91a36a",
    gold: "#b29b55",
    graphite: "#0a0c07",
    dark: true,
  },
  "charcoal-violet": {
    bg: "#121116",
    ink: "#e6e3e9",
    ink2: "#c0bac8",
    ink3: "#958da0",
    hue: "#8b839e",
    gold: "#ad955c",
    graphite: "#09080c",
    dark: true,
  },
};
const themeDialog = document.querySelector(".theme-dialog");
const themeOptions = [...document.querySelectorAll(".theme-option")];
const backgroundToggle = document.querySelector(".background-toggle");
const heroDitherToggle = document.querySelector(".hero-dither-toggle");
let ribbonColors;
var topographicState;
let topographicEnabled = true;
let heroDitherEnabled = true;
const topographicPointer = { x: 0.5, y: 0.5, active: 0 };

function hexToRgb(hex) {
  return hex.match(/\w\w/g).map((part) => parseInt(part, 16));
}

function rgba(hex, alpha) {
  return `rgba(${hexToRgb(hex).join(",")},${alpha})`;
}

function applyTheme(name) {
  const theme = themes[name] || themes["warm-mineral"];
  const root = document.documentElement;
  const variables = {
    "--white": theme.bg,
    "--ink": theme.ink,
    "--ink2": theme.ink2,
    "--ink3": theme.ink3,
    "--hue": theme.hue,
    "--gold": theme.gold,
    "--graphite": theme.graphite,
    "--line": theme.dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)",
    "--nav-bg": rgba(theme.bg, 0.92),
    "--wash-soft": rgba(theme.hue, theme.dark ? 0.14 : 0.16),
    "--dither-dot": rgba(theme.hue, theme.dark ? 0.48 : 0.34),
    "--dither-field": rgba(theme.hue, theme.dark ? 0.24 : 0.2),
  };
  Object.entries(variables).forEach(([property, value]) =>
    root.style.setProperty(property, value),
  );
  root.dataset.theme = name;
  root.style.colorScheme = theme.dark ? "dark" : "light";
  ribbonColors = [
    hexToRgb(theme.hue),
    hexToRgb(theme.gold),
    hexToRgb(theme.ink3),
  ];
  syncTopographicPalette(theme);
  themeOptions.forEach((option) => {
    option.setAttribute(
      "aria-pressed",
      option.dataset.theme === name ? "true" : "false",
    );
  });
  try {
    localStorage.setItem("homepage-theme", name);
  } catch {}
}

function applyHeroDither(enabled, options = {}) {
  heroDitherEnabled = enabled;
  document.documentElement.dataset.heroDither = enabled ? "on" : "off";
  if (heroDitherToggle) heroDitherToggle.checked = enabled;
  if (options.persist !== false) {
    try {
      localStorage.setItem("homepage-hero-dither", enabled ? "on" : "off");
    } catch {}
  }
}

let savedTheme = "gold-paper";
try {
  savedTheme = localStorage.getItem("homepage-theme") || savedTheme;
} catch {}
try {
  topographicEnabled =
    localStorage.getItem("homepage-background-animation") !== "off";
} catch {}
try {
  heroDitherEnabled = localStorage.getItem("homepage-hero-dither") !== "off";
} catch {}
if (backgroundToggle) backgroundToggle.checked = topographicEnabled;
applyHeroDither(heroDitherEnabled, { persist: false });
applyTheme(savedTheme);
document
  .querySelector(".theme-open")
  .addEventListener("click", () => themeDialog.showModal());
document
  .querySelector(".theme-close")
  .addEventListener("click", () => themeDialog.close());
themeDialog.addEventListener("click", (event) => {
  if (event.target === themeDialog) themeDialog.close();
});
themeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    applyTheme(option.dataset.theme);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueRibbons();
    }
  });
});
if (heroDitherToggle) {
  heroDitherToggle.addEventListener("change", () => {
    applyHeroDither(heroDitherToggle.checked);
  });
}

// ── scroll reveal ──
const ro = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        ro.unobserve(e.target);
      }
    });
  },
  { threshold: 0.07 },
);
document.querySelectorAll(".reveal").forEach((el) => ro.observe(el));

const readingSection = document.querySelector("#reading");
const readingToggle = document.querySelector(".reading-toggle");
if (readingToggle) {
  readingToggle.addEventListener("click", () => {
    const expanded = readingSection.classList.toggle("expanded");
    readingToggle.setAttribute("aria-expanded", String(expanded));
    readingToggle.textContent = expanded
      ? "show fewer entries"
      : "show full reading list";
  });
}

// ── diffusion-like text denoising ──
const diffuseGlyphs = "abcdefghijklmnopqrstuvwxyz0123456789:;./+-";

function shuffle(values) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function diffuseText(element) {
  if (element.dataset.diffuseStarted) return;
  element.dataset.diffuseStarted = "true";

  const text = element.textContent.replace(/\s+/g, " ").trim();
  if (!text) return;

  const mutable = [...text]
    .map((character, index) => (/[a-z0-9]/i.test(character) ? index : -1))
    .filter((index) => index >= 0);
  const resolveOrder = shuffle([...mutable]);
  const resolved = new Set();
  const delay = Number(element.dataset.diffuseDelay || 0);
  const duration = Number(
    element.dataset.diffuseDuration || (text.length > 20 ? 1600 : 900),
  );
  const resolvedRatio = Number(element.dataset.diffuseResolved || 0.82);
  const blur = Number(element.dataset.diffuseBlur || 0.25);
  const initiallyResolved = Math.floor(resolveOrder.length * resolvedRatio);
  const finalHeight = element.getBoundingClientRect().height;
  const renderInterval = window.matchMedia("(max-width: 760px)").matches
    ? 120
    : 90;
  let lastRender = 0;

  for (let i = 0; i < initiallyResolved; i++) resolved.add(resolveOrder[i]);

  element.setAttribute("aria-label", text);
  element.dataset.diffuseActive = "true";
  element.style.height = `${finalHeight}px`;
  element.textContent = [...text]
    .map((character, index) =>
      /[a-z0-9]/i.test(character) && !resolved.has(index)
        ? diffuseGlyphs[Math.floor(Math.random() * diffuseGlyphs.length)]
        : character,
    )
    .join("");
  element.style.setProperty("--diffuse-blur", `${blur}px`);

  setTimeout(() => {
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const target = Math.floor(
        initiallyResolved + (resolveOrder.length - initiallyResolved) * eased,
      );

      while (resolved.size < target) resolved.add(resolveOrder[resolved.size]);

      if (now - lastRender >= renderInterval || progress === 1) {
        lastRender = now;
        element.textContent = [...text]
          .map((character, index) => {
            if (!/[a-z0-9]/i.test(character) || resolved.has(index))
              return character;
            return diffuseGlyphs[
              Math.floor(Math.random() * diffuseGlyphs.length)
            ];
          })
          .join("");
        element.style.setProperty("--diffuse-blur", `${(1 - eased) * blur}px`);
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        element.textContent = text;
        element.style.removeProperty("--diffuse-blur");
        element.style.removeProperty("height");
        delete element.dataset.diffuseActive;
      }
    }

    requestAnimationFrame(frame);
  }, delay);
}

const diffuseReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

if (!diffuseReducedMotion.matches) {
  document.fonts.ready.then(() => {
    document.querySelectorAll("[data-diffuse]").forEach(diffuseText);
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileTopographicPointer = window.matchMedia("(max-width: 760px)");

// ── topographic background shader ──
const topographicCanvas = document.getElementById("topographic-bg");
const topoVertex = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;
const topoFragment = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_scroll;
  uniform vec2 u_pointer;
  uniform float u_pointer_active;
  uniform vec3 u_paper;
  uniform vec3 u_line;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + 17.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) /
      min(u_resolution.x, u_resolution.y);
    vec2 pointer = (u_pointer - 0.5 * u_resolution.xy) /
      min(u_resolution.x, u_resolution.y);
    vec2 fromPointer = uv - pointer;
    float pointerDistance = length(fromPointer);
    float push = smoothstep(0.5, 0.0, pointerDistance) * u_pointer_active;
    vec2 pushDirection = fromPointer / max(pointerDistance, 0.001);
    vec2 displacedUv = uv + pushDirection * push * 0.085;
    float bloom = smoothstep(0.48, 0.0, pointerDistance) * u_pointer_active;
    float t = u_time + u_scroll * 0.4;
    float h = fbm(displacedUv * 5.0 + t * 0.04) + fbm(displacedUv * 11.0 - t * 0.025) * 0.28;
    float contour = 1.0 - smoothstep(0.018, 0.055, abs(fract(h * 18.0) - 0.5));
    vec3 col = mix(u_paper, u_line, contour * (0.72 + bloom * 1.1));
    col = mix(col, u_line, bloom * contour * 0.34);
    gl_FragColor = vec4(pow(col, vec3(0.92)), 1.0);
  }
`;

function compileTopoShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function rgbTriplet(hex) {
  return hexToRgb(hex).map((value) => value / 255);
}

function syncTopographicPalette(theme) {
  if (!topographicState) return;
  const gl = topographicState.gl;
  gl.useProgram(topographicState.program);
  gl.uniform3fv(topographicState.uniforms.paper, rgbTriplet(theme.bg));
  gl.uniform3fv(topographicState.uniforms.line, rgbTriplet(theme.hue));
  drawTopographic(performance.now());
}

function resizeTopographic() {
  if (!topographicState) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
  const width = Math.round(innerWidth * ratio);
  const height = Math.round(innerHeight * ratio);
  if (
    topographicCanvas.width !== width ||
    topographicCanvas.height !== height
  ) {
    topographicCanvas.width = width;
    topographicCanvas.height = height;
    topographicState.gl.viewport(0, 0, width, height);
  }
  topographicState.gl.uniform2f(
    topographicState.uniforms.resolution,
    width,
    height,
  );
}

function syncMobileTopographicPointer() {
  if (!mobileTopographicPointer.matches) return;
  topographicPointer.x = innerWidth - 72;
  topographicPointer.y = 92;
  topographicPointer.active = 1;
}

function drawTopographic(now) {
  if (!topographicEnabled || !topographicState) return;
  syncMobileTopographicPointer();
  const gl = topographicState.gl;
  resizeTopographic();
  gl.useProgram(topographicState.program);
  gl.uniform1f(
    topographicState.uniforms.time,
    reduceMotion.matches ? 0 : now * 0.001,
  );
  gl.uniform1f(
    topographicState.uniforms.scroll,
    scrollY / Math.max(document.body.scrollHeight - innerHeight, 1),
  );
  const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
  gl.uniform2f(
    topographicState.uniforms.pointer,
    topographicPointer.x * ratio,
    (innerHeight - topographicPointer.y) * ratio,
  );
  gl.uniform1f(
    topographicState.uniforms.pointerActive,
    topographicPointer.active,
  );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function animateTopographic(now) {
  if (!topographicEnabled) return;
  drawTopographic(now);
  if (!reduceMotion.matches) requestAnimationFrame(animateTopographic);
}

function applyBackgroundAnimation(enabled, options = {}) {
  topographicEnabled = enabled;
  document.documentElement.dataset.backgroundAnimation = enabled ? "on" : "off";
  if (backgroundToggle) backgroundToggle.checked = enabled;
  if (!enabled) {
    topographicPointer.active = 0;
    topographicCanvas.hidden = true;
  } else {
    topographicCanvas.hidden = false;
    if (!topographicState) {
      initTopographicBackground();
    } else {
      drawTopographic(performance.now());
      if (!reduceMotion.matches) requestAnimationFrame(animateTopographic);
    }
  }
  if (options.persist !== false) {
    try {
      localStorage.setItem(
        "homepage-background-animation",
        enabled ? "on" : "off",
      );
    } catch {}
  }
}

function initTopographicBackground() {
  const gl = topographicCanvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    powerPreference: "low-power",
  });
  if (!gl) {
    topographicCanvas.hidden = true;
    return;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compileTopoShader(gl, gl.VERTEX_SHADER, topoVertex));
  gl.attachShader(
    program,
    compileTopoShader(gl, gl.FRAGMENT_SHADER, topoFragment),
  );
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    topographicCanvas.hidden = true;
    return;
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "a_position");
  gl.useProgram(program);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  topographicState = {
    gl,
    program,
    uniforms: {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      pointerActive: gl.getUniformLocation(program, "u_pointer_active"),
      paper: gl.getUniformLocation(program, "u_paper"),
      line: gl.getUniformLocation(program, "u_line"),
    },
  };
  syncTopographicPalette(
    themes[document.documentElement.dataset.theme] || themes["warm-mineral"],
  );
  requestAnimationFrame(animateTopographic);
}

if (backgroundToggle) {
  backgroundToggle.addEventListener("change", () => {
    applyBackgroundAnimation(backgroundToggle.checked);
  });
}
applyBackgroundAnimation(topographicEnabled, { persist: false });
window.addEventListener("resize", () => {
  syncMobileTopographicPointer();
  drawTopographic(performance.now());
});
window.addEventListener("scroll", () => drawTopographic(performance.now()), {
  passive: true,
});
window.addEventListener(
  "pointermove",
  (event) => {
    if (mobileTopographicPointer.matches) return;
    topographicPointer.x = event.clientX;
    topographicPointer.y = event.clientY;
    topographicPointer.active = event.pointerType === "touch" ? 0 : 1;
    drawTopographic(performance.now());
  },
  { passive: true },
);
window.addEventListener("pointerleave", () => {
  if (mobileTopographicPointer.matches) return;
  topographicPointer.active = 0;
  drawTopographic(performance.now());
});
reduceMotion.addEventListener("change", () =>
  requestAnimationFrame(animateTopographic),
);

// ── slow background gradient drift ──
let backgroundFrame;

function updateBackgroundDrift() {
  backgroundFrame = null;
  const offset = reduceMotion.matches ? 0 : Math.min(scrollY * 0.045, 220);
  document.body.style.setProperty("--background-shift", `${offset}px`);
}

function queueBackgroundDrift() {
  if (!backgroundFrame) {
    backgroundFrame = requestAnimationFrame(updateBackgroundDrift);
  }
}

updateBackgroundDrift();
window.addEventListener("scroll", queueBackgroundDrift, { passive: true });
reduceMotion.addEventListener("change", queueBackgroundDrift);

// ── transparent footer ribbons ──
const ribbonCanvas = document.getElementById("footer-ribbons");
const ribbonContext = ribbonCanvas.getContext("2d");
let ribbonWidth;
let ribbonHeight;
let ribbonFrame;
let ribbonActive = false;
let lastRibbonDraw = 0;

function resizeRibbons() {
  const ratio = Math.min(
    window.devicePixelRatio || 1,
    innerWidth <= 760 ? 1 : 1.25,
  );
  ribbonWidth = ribbonCanvas.offsetWidth;
  ribbonHeight = ribbonCanvas.offsetHeight;
  ribbonCanvas.width = ribbonWidth * ratio;
  ribbonCanvas.height = ribbonHeight * ratio;
  ribbonContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  queueRibbons();
}

function queueRibbons() {
  if (!ribbonFrame && ribbonActive) {
    ribbonFrame = requestAnimationFrame(drawRibbons);
  }
}

function drawRibbons(time) {
  ribbonFrame = null;
  if (!ribbonActive) return;
  if (!reduceMotion.matches && time - lastRibbonDraw < 1000 / 30) {
    queueRibbons();
    return;
  }
  lastRibbonDraw = time;
  ribbonContext.clearRect(0, 0, ribbonWidth, ribbonHeight);
  ribbonContext.globalCompositeOperation = "lighter";
  const motion = reduceMotion.matches ? 0 : time * 0.001;

  ribbonColors.forEach(([red, green, blue], ribbon) => {
    const gradient = ribbonContext.createLinearGradient(0, 0, ribbonWidth, 0);
    gradient.addColorStop(0, `rgba(${red},${green},${blue},0)`);
    gradient.addColorStop(0.4, `rgba(${red},${green},${blue},.2)`);
    gradient.addColorStop(0.75, `rgba(${red},${green},${blue},.1)`);
    gradient.addColorStop(1, `rgba(${red},${green},${blue},0)`);
    ribbonContext.strokeStyle = gradient;
    ribbonContext.lineWidth = 45 + ribbon * 25;
    ribbonContext.filter = `blur(${24 + ribbon * 9}px)`;
    ribbonContext.beginPath();

    for (let x = -40; x <= ribbonWidth + 40; x += 24) {
      const y =
        ribbonHeight * (0.32 + ribbon * 0.17) +
        Math.sin(x * 0.006 + motion * 0.35 + ribbon) * ribbonHeight * 0.1 +
        Math.sin(x * 0.012 - motion * 0.45) * ribbonHeight * 0.035;
      if (x === -40) ribbonContext.moveTo(x, y);
      else ribbonContext.lineTo(x, y);
    }
    ribbonContext.stroke();
  });

  ribbonContext.filter = "none";
  ribbonContext.globalCompositeOperation = "source-over";
  if (!reduceMotion.matches) queueRibbons();
}

const ribbonObserver = new IntersectionObserver(
  ([entry]) => {
    ribbonActive = entry.isIntersecting;
    if (ribbonActive) resizeRibbons();
  },
  { rootMargin: "10% 0px" },
);
ribbonObserver.observe(document.querySelector("footer"));
resizeRibbons();
window.addEventListener("resize", resizeRibbons);
reduceMotion.addEventListener("change", queueRibbons);
