var thetaMin = 0;
var thetaMax = 6 * Math.PI;
var period = 5;
var lineSpacing = 1 / 30;
var lineLength = lineSpacing / 2;
var yScreenOffset = 300;
var xScreenOffset = 260;
var xScreenScale = 360;
var yScreenScale = 360;
var yCamera = 2;
var zCamera = -3;

var rate = 1 / (2 * Math.PI); // every rotation y gets one bigger
var factor = rate / 3;



function createSnowflakes() {
  const snowflakeContainer = document.getElementById('snowflakeContainer');
  const quantity = 50;  // How many snowflakes you want

  for (let i = 0; i < quantity; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = 5 + Math.random() * 10 + 's'; // Randomize speed
    snowflake.style.opacity = Math.random();
    snowflakeContainer.appendChild(snowflake);
  }
}

function init() {
  createSnowflakes();
}


function run() {
  var ctx = document.getElementById('scene').getContext('2d'),
      spirals = [
        new Spiral({
          foreground: "#220000", // Second shadow for red spiral
          angleOffset: Math.PI * 0.92,
          factor: 0.90 * factor
        }),
        new Spiral({
          foreground: "#002211", // Second shadow for cyan spiral
          angleOffset: -Math.PI * 0.08,
          factor: 0.90 * factor
        }),
        new Spiral({
          foreground: "#660000", // red spiral shadow
          angleOffset: Math.PI * 0.95,
          factor: 0.93 * factor
        }),
        new Spiral({
          foreground: "#003322", // cyan spiral shadow
          angleOffset: -Math.PI * 0.05,
          factor: 0.93 * factor
        }),
        new Spiral({
          foreground: "#ff0000", // red Spiral
          angleOffset: Math.PI,
          factor: factor
        }),
        new Spiral({
          foreground: "#00ffcc", // cyan spiral
          angleOffset: 0,
          factor: factor
        })];

  renderFrame(); // animation loop starts here

  function renderFrame() {
    requestAnimationFrame(renderFrame);

    ctx.clearRect(0, 0, 500, 500);
    ctx.beginPath();
    spirals.forEach(renderSpiral);
  }

  function renderSpiral(spiral) {
    spiral.render(ctx);
  }

  function Spiral(config) {
    var offset = 0;
    var lineSegments = computeLineSegments();

    this.render = function(ctx) {
      offset -= 1;
      if (offset <= -period) {
        offset += period;
      }

      lineSegments[offset].forEach(drawLineSegment);
    };

    function drawLineSegment(segment) {
      stroke(config.foreground, segment.start.alpha);
      ctx.moveTo(segment.start.x, segment.start.y);
      ctx.lineTo(segment.end.x, segment.end.y);
    }

    function computeLineSegments() {
      var lineSegments = {};
      var factor = config.factor;
      var thetaNew, thetaOld;
      for (var offset = 0; offset > -period; offset--) {
        lineSegments[offset] = lines = [];
        for (
          var theta = thetaMin + getThetaChangeRate(thetaMin, offset * lineSpacing / period, rate, factor); 
          theta < thetaMax; 
          theta += getThetaChangeRate(theta, lineSpacing, rate, factor)
        ) {
          thetaOld = (theta >= thetaMin) ? theta : thetaMin;
          thetaNew = theta + getThetaChangeRate(theta, lineLength, rate, factor);

          if (thetaNew <= thetaMin) {
            continue;
          }

          lines.push({
            start: getPointByAngle(thetaOld, factor, config.angleOffset, rate),
            end: getPointByAngle(thetaNew, factor, config.angleOffset, rate)
          });
        }
      }

      return lineSegments;
    }
  }

  function stroke(color, alpha) {
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
  }

  function getPointByAngle(theta, factor, angleOffset, rate) {
    var x = theta * factor *  Math.cos(theta + angleOffset);
    var z = - theta * factor * Math.sin(theta + angleOffset);
    var y = rate * theta;
    // now that we have 3d coordinates, project them into 2d space:
    var point = projectTo2d(x, y, z);
    // calculate point's color alpha level:
    point.alpha = Math.atan((y * factor / rate * 0.1 + 0.02 - z) * 40) * 0.35 + 0.65;

    return point;
  }

  function getThetaChangeRate(theta, lineLength, rate, factor) {
    return lineLength / Math.sqrt(rate * rate + factor * factor * theta * theta);
  }

  function projectTo2d(x, y, z) {
    return {
      x: xScreenOffset + xScreenScale * (x / (z - zCamera)),
      y: yScreenOffset + yScreenScale * ((y - yCamera) / (z - zCamera))
    };
  }

  // I actually want it to be slower then 60fps
  function requestAnimationFrame(callback) {
    window.setTimeout(callback, 1000 / 24);
  }
  animateGreeting();
  init();
  displayMessages();
}



function animateGreeting() {
  const greeting = document.getElementById('greeting');
  let opacity = 0;
  let increment = 0.01; // Adjust speed here

  const fade = () => {
    if (opacity < 1 && increment > 0 || opacity > 0 && increment < 0) {
      opacity += increment;
      greeting.style.opacity = opacity;
      requestAnimationFrame(fade); // Recursively call fade
    } else {
      increment = -increment; // Reverse the direction of the fade
      setTimeout(() => requestAnimationFrame(fade), 2000); // Pause before fading back
    }
  };

  fade(); // Start the animation
}

function fadeIn(element, duration) {
  let op = 0; // initial opacity
  element.style.opacity = op;
  const increment = 0.05; // Adjust this value for fade speed

  const fadeInterval = setInterval(() => {
    if (op < 1) {
      op += increment;
      element.style.opacity = op;
    } else {
      clearInterval(fadeInterval);
    }
  }, duration * increment);
}

function fadeOut(element, duration, callback) {
  let op = 1; // initial opacity
  const decrement = 0.05; // Adjust this value for fade speed

  const fadeInterval = setInterval(() => {
    if (op > 0) {
      op -= decrement;
      element.style.opacity = op;
    } else {
      clearInterval(fadeInterval);
      element.style.opacity = 0; // Ensure the element is fully transparent
      if(callback) callback(); // Call the callback function after fade out is done
    }
  }, duration * decrement);
}

function displayMessages() {
  const messages = [
    "To XXX",
    "Merry Christmas",
    "Best, XXX"
  ];

  let greeting = document.getElementById('greeting');
  let messageIndex = 0;

  function displayNextMessage() {
    if (messageIndex < messages.length) {
      greeting.innerText = messages[messageIndex]; // Change the text
      fadeIn(greeting, 100); // Fade in (duration is proportional to increment)

      // Wait for the text to stay visible for a bit before fading out
      setTimeout(() => {
        fadeOut(greeting, 100, () => {
          messageIndex++;
          if(messageIndex < messages.length) {
            // Add some delay before starting the next message to prevent flickering
            setTimeout(displayNextMessage, 1000);
          } else {
            // setTimeout(greeting.innerText = "To XiaoChi\n"+"I hope you can always be as warm as the sun to those around you.\n"+"Merry Christmas\n"+"Best, Zhongwei\n",5000)
            // After all messages have been displayed, show them together for a while
            greeting.innerText = messages.join("\n");
            fadeIn(greeting,300); // Apply your fadeIn effect
            setTimeout(() => {
              let catImage = document.getElementById('catImage');
              let sideGifs = document.querySelectorAll('.side-gif');
              sideGifs.forEach(gif => {
                gif.style.display = 'block';
              });
              greeting.style.display = 'none'; // Hide the text
              catImage.style.display = 'block'; // Show the cat image
              fadeIn(catImage,100); // Apply your fadeIn effect to cat image
            }, 15000); // Adjust time as needed

          }
        });
      }, 3000); // Start over after a brief pause
    }
  }

  displayNextMessage();
}


// 页面加载后

window.onload = function() {
  run();
};