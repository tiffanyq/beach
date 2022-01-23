/*
Grain background: by max fuchs @designfuchs on Unsplash https://unsplash.com/photos/Nm6ojlDO-5c
*/

const NUM_LINES = 8;
const WINDOW_BUFFER = 64; // extend beyond ends of window
const XSCALE = 0.0009;
const YSCALE = 0.6;
const XSTEP_SIZE = 20; // reduce computation
const ZSTEP_SIZE = 0.003;
const YHEIGHT_MULTIPLIER = 0.5;
const WATER_LINE_STEP_SIZE = 3;
const WATER_LINE_PROX_THRESHOLD = 16;

let initWaterLine = false;
let reachedTargetWaterLine = false;

let numWaterLineSteps = 1;
let pastOffset = 0;
let tempOffset = 0;
let zStep = 0;
let waterLayers = [];
let waterLineYValues = [];
let targetWaterLine;
let waterLine;
let grain;
let currScroll;

// for you/me tiles
let mouseInitiated = false;

// todo later
class WaterLayer {
  constructor(color, offset, smoothFactor) {
    this.color = color;
    this.offset = offset;
    this.smoothFactor = smoothFactor;
  }
  
  render() {
    fill(this.color);
    noStroke();
    beginShape();
    for (let x = currScroll - WINDOW_BUFFER; x < currScroll + window.innerHeight + WINDOW_BUFFER; x += XSTEP_SIZE) {
      let y = map(noise(x * XSCALE, this.smoothFactor, zStep), 0, 1, 0, width) - this.offset;
      if (initWaterLine) {
        y += pastOffset + tempOffset;
      }
      vertex(y, x-currScroll);
    }
    vertex(-WINDOW_BUFFER, height+WINDOW_BUFFER);
    vertex(-WINDOW_BUFFER,-WINDOW_BUFFER);
    endShape(CLOSE);
  }
}

function preload() {
  grain = loadImage('assets/grain.jpeg');
}

function setup() {
  const cnv = createCanvas(window.innerWidth, window.innerHeight);
  cnv.style('display', 'block');
  cnv.style('position', 'fixed');
  frameRate(16);
  targetWaterLine = width/2;
  currScroll = window.scrollY;
  generateSand();
  // create first wave to calibrate water line
  generateWaterBorder();
  // init waves
  waterLayers.push(new WaterLayer(color(206,232,242), 0, 0.016));
  waterLayers.push(new WaterLayer(color(170,198,227), 80, 0.16));
  waterLayers.push(new WaterLayer(color(160,214,217), 160, 0.4));
  waterLayers.push(new WaterLayer(color(150,188,207), 240, 0.8));
  // init random y vals for water line noise
  for (let i = 0; i < NUM_LINES; i++) {
    waterLineYValues.push(random(-1*YSCALE*0.8,YSCALE*0.8));
  }
  // init youMe labels
  textSize(24);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function mouseMoved() {
  setNewTargetWaterLine();
  mouseInitiated = true;
}

function touchStarted() {
  setNewTargetWaterLine();
  mouseInitiated = true;
}

function setNewTargetWaterLine() {
  reachedTargetWaterLine = false;
  numWaterLineSteps = 1;
  pastOffset = pastOffset + tempOffset;
  tempOffset = 0;
  targetWaterLine = mouseX;
}

function moveYouMe() {
  let xrel;
  let yTo;
  let yFrom;
  
  let currSection = int(mouseY / 50);

  if (currSection % 2 === 0) {
    yTo = 50 * currSection;
    yFrom = 50 * currSection + 50;
  } else {
    yTo = 50* currSection + 50;
    yFrom = 50 * currSection;
  }

  if (!mouseInitiated) {
    xrel = width/2;
    yTo = 150;
    yFrom = 200;
  } else {
    xrel = mouseX;
  }

  fill(49,65,112); // you
  rect(xrel - toWidth, yTo, toWidth + 30, 40);
  fill(166,86,131); // me
  rect(xrel, yFrom, fromWidth + 30, 40);
  fill(255); // text
  strokeWeight(0);
  const c = color(255);
  c.setAlpha(255);
  fill(c);
  text(sentTo, xrel - toWidth + 15, yTo + 27);
  text(sentFrom, xrel + 15, yFrom + 27);
}

function draw() {
  currScroll = window.scrollY;
  tint(255,255);
  generateSand();
  for (let i = 0; i < waterLayers.length; i++) {
    waterLayers[i].render();
  }
  generateWaterBorder();
  addGrain();
  zStep += ZSTEP_SIZE;
  moveYouMe();
}

function generateSand() {
  background(232,207,182);
}

function generateWaterBorder() {
  noFill();
  strokeWeight(3);
  let topmostHeights = [];
  let tempNum = 0;

  for (let i = 0; i < NUM_LINES; i++) {
    stroke(255);
    beginShape();
    for (let x = currScroll - WINDOW_BUFFER; x < currScroll + window.innerHeight + WINDOW_BUFFER; x += XSTEP_SIZE) {
      let y = map(noise(x * XSCALE, waterLineYValues[i], zStep), 0, 1, 0, width);
      if (initWaterLine) {
        y += pastOffset + tempOffset;
      }
      vertex(y, x-currScroll);
      if (x === currScroll - WINDOW_BUFFER) {
        topmostHeights.push(y); 
      }
    }
    vertex(-WINDOW_BUFFER, height+WINDOW_BUFFER);
    vertex(-WINDOW_BUFFER,-WINDOW_BUFFER);
    endShape(CLOSE);
  }
  initWaterLine = true; // stop init calibration
  // calculate new waterline based on topmost visible coords
  for (let i = 0; i < NUM_LINES; i++) {
    tempNum += topmostHeights[i];
  }
  waterLine = tempNum / NUM_LINES;
  if (!reachedTargetWaterLine) {
    updateWaterLineOffset();
  }
}

function updateWaterLineOffset() {
  // check if target waterline is in reach
  tempOffset = targetWaterLine < waterLine ? -1 * WATER_LINE_STEP_SIZE * numWaterLineSteps : WATER_LINE_STEP_SIZE * numWaterLineSteps;
  numWaterLineSteps = reachedTargetWaterLine ? numWaterLineSteps : numWaterLineSteps + 1;
  if (!reachedTargetWaterLine) {
    reachedTargetWaterLine = abs(targetWaterLine - waterLine) < WATER_LINE_PROX_THRESHOLD ? true : false;
  } else {
    pastOffset = pastOffset + tempOffset;
    tempOffset = 0;
  }
}

function addGrain() {
  tint(255, 128); // change opacity of overlay
  image(grain, 0-WINDOW_BUFFER, 0-WINDOW_BUFFER, width + WINDOW_BUFFER, window.innerHeight + WINDOW_BUFFER);
}
