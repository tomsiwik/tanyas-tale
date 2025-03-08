import { vi } from "vitest";
import * as PIXI from "pixi.js";

// Mock PIXI.js
vi.mock("pixi.js", () => {
  const SCALE_MODES = {
    NEAREST: 0,
    LINEAR: 1,
  };

  const FORMATS = {
    RGBA: "rgba",
  };

  class Container {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.children = [];
      this.addChild = vi.fn((child) => this.children.push(child));
      this.removeChild = vi.fn((child) => {
        const index = this.children.indexOf(child);
        if (index > -1) this.children.splice(index, 1);
      });
      this.destroy = vi.fn();
    }
  }

  class Graphics {
    constructor() {
      this.clear = vi.fn().mockReturnThis();
      this.rect = vi.fn().mockReturnThis();
      this.fill = vi.fn().mockReturnThis();
      this.setStrokeStyle = vi.fn().mockReturnThis();
      this.stroke = vi.fn().mockReturnThis();
      this.width = 100;
      this.x = 0;
      this.y = 0;
      this.alpha = 1;
      this.destroy = vi.fn();
    }
  }

  class AnimatedSprite {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.width = 32;
      this.height = 32;
      this.scale = { set: vi.fn() };
      this.anchor = { set: vi.fn() };
      this.zIndex = 0;
      this.currentAnimation = { name: "standing_s" };
      this.gotoAndPlay = vi.fn();
      this.gotoAndStop = vi.fn();
      this.play = vi.fn();
      this.stop = vi.fn();
      this.destroy = vi.fn();
    }
  }

  class Application {
    constructor(options = {}) {
      this.screen = {
        width: options.width || 800,
        height: options.height || 600,
      };
      this.stage = new Container();
      this.view = document.createElement("canvas");
      this.view.width = this.screen.width;
      this.view.height = this.screen.height;
      this.renderer = {
        screen: this.screen,
        plugins: {
          prepare: {
            upload: vi.fn().mockResolvedValue(undefined),
          },
        },
      };
      this.destroy = vi.fn();
    }
  }

  const Assets = {
    load: vi.fn().mockResolvedValue({
      animations: {
        standing_s: [{}],
        standing_n: [{}],
        standing_e: [{}],
        standing_w: [{}],
        running_s: [{}],
        running_n: [{}],
        running_e: [{}],
        running_w: [{}],
        running_se: [{}],
        running_sw: [{}],
        running_ne: [{}],
        running_nw: [{}],
      },
      textures: {
        healthBar: {},
        healthBarFill: {},
      },
    }),
  };

  return {
    Application: vi.fn().mockImplementation(() => ({
      screen: {
        width: 800,
        height: 600,
      },
      stage: {
        addChild: vi.fn(),
        removeChild: vi.fn(),
      },
      destroy: vi.fn(),
      view: {
        style: {},
        getContext: () => ({
          drawImage: vi.fn(),
          fillRect: vi.fn(),
          getImageData: vi.fn().mockReturnValue({ data: new Uint8Array(4) }),
          putImageData: vi.fn(),
          clearRect: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          scale: vi.fn(),
        }),
      },
    })),
    Container: vi.fn().mockImplementation(() => ({
      addChild: vi.fn(),
      removeChild: vi.fn(),
      destroy: vi.fn(),
      position: { x: 0, y: 0 },
    })),
    Graphics: vi.fn().mockImplementation(() => ({
      rect: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      setStrokeStyle: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      clear: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      position: { x: 0, y: 0 },
    })),
    AnimatedSprite: vi.fn().mockImplementation(() => ({
      gotoAndPlay: vi.fn(),
      gotoAndStop: vi.fn(),
      play: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
      position: { x: 0, y: 0 },
      anchor: { x: 0, y: 0 },
    })),
    Assets: {
      load: vi.fn().mockResolvedValue({
        animations: {},
        textures: {},
      }),
    },
    SCALE_MODES,
    FORMATS,
  };
});

// Setup browser environment
if (typeof window !== "undefined") {
  // Setup canvas context
  window.HTMLCanvasElement.prototype.getContext = function (contextType) {
    if (contextType === "2d") {
      return {
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(4),
        })),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        save: vi.fn(),
        scale: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        lineTo: vi.fn(),
        moveTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
      };
    }

    if (contextType === "webgl2" || contextType === "webgl") {
      return {
        getExtension: () => null,
        getParameter: () => {},
        getShaderPrecisionFormat: () => ({
          precision: 0,
          rangeMin: 0,
          rangeMax: 0,
        }),
        canvas: this,
        drawingBufferWidth: this.width,
        drawingBufferHeight: this.height,
        createTexture: vi.fn(() => ({})),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        blendFunc: vi.fn(),
        clear: vi.fn(),
        viewport: vi.fn(),
        createProgram: vi.fn(() => ({})),
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        useProgram: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        getUniformLocation: vi.fn(() => ({})),
        vertexAttribPointer: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        uniform1i: vi.fn(),
        uniform2f: vi.fn(),
        drawArrays: vi.fn(),
      };
    }
    return null;
  };
}

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});
