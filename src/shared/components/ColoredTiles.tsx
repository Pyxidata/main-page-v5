import React, { useRef, useEffect, useState, useCallback } from 'react';

const FPS = 100;
const DELAY_MS = 1000 / FPS;
const PIXEL_SIZE = 5;
const DENSITY = 10;
const ACTIVE_CHANCE = 0.3;
const REDISTRIBUTION_PERIOD = 200000;

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 1500;

const GRID_COLS = Math.floor(CANVAS_WIDTH / PIXEL_SIZE);
const GRID_ROWS = Math.floor(CANVAS_HEIGHT / PIXEL_SIZE);
const GAP = Math.floor(GRID_COLS / DENSITY);

const Util = {
  bound: (num: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, Math.round(num)));
  },
  signOf: (num: number): number => {
    return (num > 0) ? 1 : ((num < 0) ? -1 : 0);
  }
};

class Slot {
  public CHARGE_OFFSET = 0.2;
  public MAX_TOTAL = 255;

  public x: number;
  public y: number;
  public energy: number;

  public r: number;
  public g: number;
  public b: number;
  public color: string;

  public branching: boolean = false;
  public magnitude: number;
  public h: number;
  public v: number;

  constructor(x: number, y: number, energy: number) {
    this.x = x;
    this.y = y;
    this.energy = energy;

    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.color = 'rgb(0,0,0)'; // Black
    this.h = 0;
    this.v = 0;
    this.magnitude = 0;
    this.branching = true; // Set to true as per Java's default field initialization
  }

  // Clones a slot's properties (useful for deep copying)
  public clone(): Slot {
    const cloned = new Slot(this.x, this.y, this.energy);
    cloned.setColor(this.r, this.g, this.b);
    cloned.branching = this.branching;
    cloned.magnitude = this.magnitude;
    cloned.h = this.h;
    cloned.v = this.v;
    return cloned;
  }

  public setColor(r: number, g: number, b: number): void {
    this.r = Util.bound(r, 0, 255);
    this.g = Util.bound(g, 0, 255);
    this.b = Util.bound(b, 0, 255);
    this.color = `rgb(${this.r},${this.g},${this.b})`;
  }

  // Note: mixColor will blend the current slot's color with the incoming color.
  // For a strict two-buffer system, the color passed here should be from the 'old' grid.
  // This function is still valid as it's meant to apply a blend.
  public mixColor(r: number, g: number, b: number): void {
    this.setColor(
      Math.floor((this.r + r) / 2),
      Math.floor((this.g + g) / 2),
      Math.floor((this.b + b) / 2)
    );
  }

  public chargeColor(): void {
    // Only charge if there's room for total color to increase
    if (this.getTotal() < this.MAX_TOTAL) {
        this.setColor(this.charge(this.r), this.charge(this.g), this.charge(this.b));
    }
  }
  private charge(c: number): number {
    return Util.bound((this.energy + this.CHARGE_OFFSET) * c, 0, 255);
  }

  public addColor(r: number, g: number, b: number): void {
    this.setColor(this.r + r, this.g + g, this.b + b);
  }

  public getSaturation(): number {
    return Math.max(this.r, Math.max(this.g, this.b));
  }

  public getTotal(): number {
    return this.r + this.g + this.b;
  }

  public randomizeBranch(): void {
    this.branching = true;
    this.magnitude = this.energy * (this.g + 1) * Math.random() * GAP * 1.1;
    this.h = 2 * Math.random() - 1;
    this.v = 2 * Math.random() - 1;
  }

  public branchOnce(): [number, number] {
    let x = 0;
    let y = 0;

    if (Math.random() * Math.abs(this.h) > Math.random() * Math.abs(this.v)) {
      x = Util.signOf(this.h);
    } else {
      y = Util.signOf(this.v);
    }
    return [x, y];
  }
}

// --- Grid Class (Translated from Java's Grid) ---
class Grid {
  public width: number;
  public height: number;
  private redistributionTime: number; // timestamp for next redistribution

  public energyDistr: number[][];
  public slots: Slot[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.redistributionTime = Date.now() + REDISTRIBUTION_PERIOD;

    this.energyDistr = Array(width).fill(0).map(() => Array(height).fill(0));
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.energyDistr[x][y] = (Math.random() > ACTIVE_CHANCE) ? 0 : 1;
      }
    }

    this.slots = Array(width).fill(0).map(() => Array(height).fill(null));
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.slots[x][y] = new Slot(x, y, 0);
      }
    }

    // Initial colors as per Java's Window class
    // Apply these to the *initial* slots
    this.slots[12][4].setColor(255, 0, 0);
    this.slots[31][41].setColor(0, 255, 0);
    this.slots[47][73].setColor(0, 0, 255);

    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        if (this.slots[30 + i] && this.slots[30 + i][30 + j]) {
          this.slots[30 + i][30 + j].setColor(0, 0, 255);
        }
      }
    }

    for (let i = 70; i < 140; i++) {
      for (let j = 10; j < 90; j++) {
        if (this.slots[10 + i] && this.slots[10 + i][0 + j]) {
          this.slots[10 + i][0 + j].setColor(255, 0, 0);
        }
      }
    }

    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        if (this.slots[60 + i] && this.slots[60 + i][40 + j]) {
          this.slots[60 + i][40 + j].setColor(0, 255, 0);
        }
      }
    }
  }

  public update(): void {
    // Create a new grid for the NEXT state, deeply copying current slots.
    // All calculations for newSlots will strictly use data from this.slots (the previous frame's state).
    const nextSlots: Slot[][] = Array(this.width).fill(0).map((_, x) =>
      Array(this.height).fill(0).map((__, y) => this.slots[x][y].clone())
    );

    // --- Pass 1: Apply 'spread' and 'branch' effects from current slots to nextSlots ---
    // These effects target OTHER cells based on the CURRENT state of 'slots'
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const currentSlot = this.slots[x][y]; // Get slot from the CURRENT frame's state
        const total = currentSlot.getTotal();

        // Default color spread
        if (total * total > Math.random() * currentSlot.MAX_TOTAL * currentSlot.MAX_TOTAL) {
          const newX = Util.bound(x + Math.floor(Math.random() * 3) - 1, 0, this.width - 1); // Random -1, 0, or 1
          const newY = Util.bound(y + Math.floor(Math.random() * 3) - 1, 0, this.height - 1); // Random -1, 0, or 1
          
          // Apply spread to the target slot in 'nextSlots'
          // We need to mix the color of the *current* target in nextSlots with the *source* color from currentSlot
          nextSlots[newX][newY].mixColor(currentSlot.r, currentSlot.g, currentSlot.b);
        }

        // Branch spread
        if (currentSlot.branching) {
          const [dx, dy] = currentSlot.branchOnce();
          const newX = Util.bound(x + dx, 0, this.width - 1);
          const newY = Util.bound(y + dy, 0, this.height - 1);
          
          // Set color directly in nextSlots
          nextSlots[newX][newY].setColor(currentSlot.r, currentSlot.g, currentSlot.b);
          
          // Branching property and magnitude are handled in Pass 2 for the source slot's next state
          // and for the new branched slot's next state.
        }
      }
    }

    // --- Pass 2: Apply self-modifying effects and update branching/magnitude ---
    // These effects modify the cell itself based on the CURRENT state of 'slots'
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const currentSlot = this.slots[x][y]; // Still using current frame's state for calculations
        const nextSlot = nextSlots[x][y]; // The slot in the next frame's buffer

        // Color changing (applies to the current cell (x,y) in the next frame)
        nextSlot.addColor(Math.floor(Math.random() * 10 - 5), Math.floor(Math.random() * 10 - 5), Math.floor(Math.random() * 10 - 5));
        nextSlot.chargeColor(); // Note: chargeColor relies on the current `r,g,b` of `nextSlot`, which might already include spreads from Pass 1. This is generally acceptable for diffusion models.

        // Branching condition and randomization (applies to the current cell (x,y) in the next frame)
        const total = currentSlot.getTotal(); // Using currentSlot's total for this condition
        if (Math.pow(total / currentSlot.MAX_TOTAL, 2) * ((currentSlot.r + 256.0) / 511.0) > Math.random() * 100) {
          nextSlot.addColor(Math.floor(Math.random() * 40 - 20), Math.floor(Math.random() * 40 - 20), Math.floor(Math.random() * 40 - 20));
          nextSlot.randomizeBranch();
        }

        // Update branching state and magnitude for the *next* slot based on *current* slot
        if (currentSlot.branching) {
            // The source slot stops branching
            nextSlot.branching = false; 

            // If it had magnitude, the *newly branched* slot will get it
            // We need to re-evaluate the target of the branch if magnitude is passed
            // This is a bit tricky with strict two-buffer if the target also has a branch magnitude.
            // Let's re-apply the logic for the branch spread where the magnitude is consumed.
            // This part is a bit ambiguous in the Java if the newX, newY slot is modified or if a new branch is created.
            // Given the existing logic:
            if (currentSlot.magnitude > 0) {
                const [dx, dy] = currentSlot.branchOnce(); // Recalculate branch target based on original state
                const newX = Util.bound(x + dx, 0, this.width - 1);
                const newY = Util.bound(y + dy, 0, this.height - 1);
                
                // The target slot in nextSlots should now randomize its branch and reduce magnitude
                nextSlots[newX][newY].randomizeBranch();
                nextSlots[newX][newY].magnitude = currentSlot.magnitude - 1;
            }
        }
      }
    }
            
    this.slots = nextSlots;
  }
}

// --- React Component ---
export default function ColoredTiles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid | null>(null); // Use a ref to persist the Grid instance
  const animationFrameId = useRef<number>();

  // Initialize grid once
  useEffect(() => {
    gridRef.current = new Grid(GRID_COLS, GRID_ROWS);
    return () => {
      // Cleanup animation frame on unmount
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = gridRef.current;
    if (!grid) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw slots
    for (const row of grid.slots) {
      for (const slot of row) {
        ctx.fillStyle = `rgb(${Math.min(255, slot.r + slot.energy * 100)}, ${slot.g}, ${slot.b})`;
        ctx.fillRect(slot.x * PIXEL_SIZE, slot.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    // Draw grid lines (as per Java's Painter)
    const xOff = Math.max(0, Math.floor(GRID_COLS % GAP / 2));
    const yOff = Math.max(0, Math.floor(GRID_ROWS % GAP / 2));

    ctx.fillStyle = 'darkgray'; // Set color once outside loop for performance
    for (const row of grid.slots) {
      for (const slot of row) {
        if (slot.x % GAP === 0 && slot.y % GAP === 0) {
          ctx.fillRect(
            (slot.x + xOff) * PIXEL_SIZE + PIXEL_SIZE / 2 - 1,
            (slot.y + yOff) * PIXEL_SIZE + PIXEL_SIZE / 2 - 1,
            2,
            2
          );
        }
      }
    }
  }, []);

  // Animation loop
  useEffect(() => {
    let lastUpdateTime = 0;

    const animate = (currentTime: DOMHighResTimeStamp) => {
      if (!gridRef.current) return;

      const deltaTime = currentTime - lastUpdateTime;

      if (deltaTime >= DELAY_MS) {
        gridRef.current.update();
        draw();
        lastUpdateTime = currentTime;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
}