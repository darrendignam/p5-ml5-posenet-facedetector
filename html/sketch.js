let video;
let poseNet;
let pose;
let skeleton;
let ctx;
let img_opf_1;
let img_opf_2;
let x_eye_offset = 0.7;
let y_eye_offset = 0.5;

let drawmode = 0;


function preload() {
  img_opf_1 = loadImage('OPF_White_bg.png');
  img_opf_2 = loadImage('OPF_goggles.png');
  img_opf_3 = loadImage('carl.png');
}


function setup() {
  ctx = createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  b_clear = createButton('Clear');
  b_clear.mousePressed(()=>{ drawmode = 0 });
  b_pose = createButton('Pose net');
  b_pose.mousePressed(()=>{ drawmode = 1 });
  b_math = createButton('Calculate');
  b_math.mousePressed(()=>{ drawmode = 2 });
  b_nose = createButton('Nose');
  b_nose.mousePressed(()=>{ drawmode = 3 });
  b_halo = createButton('Halo');
  b_halo.mousePressed(()=>{ drawmode = 4 });
  b_specs = createButton('Specs');
  b_specs.mousePressed(()=>{ drawmode = 5 });
  b_carl = createButton('Carl');
  b_carl.mousePressed(()=>{ drawmode = 6 });
}

function gotPoses(poses) {
  //console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  image(video, 0, 0);

  if (pose) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    let aaaa = _angle(eyeR.x, eyeR.y, eyeL.x, eyeL.y, 0);
    
    if(drawmode==3){
      // nose
      fill(255, 0, 0);
      ellipse(pose.nose.x, pose.nose.y, d*0.8);
    }

    if(drawmode == 1 || drawmode ==2 ){
      fill(0, 0, 255);
      ellipse(pose.rightWrist.x, pose.rightWrist.y, 32);
      ellipse(pose.leftWrist.x, pose.leftWrist.y, 32);

      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(0,255,0);
        ellipse(x,y,16,16);
      }
      
      for (let i = 0; i < skeleton.length; i++) {
        let a = skeleton[i][0];
        let b = skeleton[i][1];
        strokeWeight(2);
        stroke(255);
        line(a.position.x, a.position.y,b.position.x,b.position.y);      
      }
    }

    if(drawmode==2){
      stroke(255);
      strokeWeight(1);
      line(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
      text(round(d,2),eyeR.x, eyeR.y+20);

      drawAngle(eyeL.x, eyeL.y, d, aaaa, 'red');
      text( round(aaaa, 2), eyeL.x, eyeL.y);

      text(`a: ${aaaa} rx: ${round(eyeR.x,2)} ry: ${round(eyeR.y,2)} lx: ${round(eyeL.x,2)} ly: ${round(eyeL.y,2)} `,10,10);


      line(pose.rightEar.x, pose.rightEar.y, pose.leftEar.x, pose.leftEar.y);
      text(round(dist(pose.rightEar.x, pose.rightEar.y, pose.leftEar.x, pose.leftEar.y) ,2), pose.rightEar.x, pose.rightEar.y+20);
    }
    if(drawmode==4){
      //opf halo
      image(img_opf_1, eyeR.x+(0.5*d), eyeR.y-3*d, 3*d, 3*d);
    }

    if(drawmode==5){
      // opf glasses
      imageMode(CENTER);
      angleMode(DEGREES);
      push();
      // translate( eyeR.x-(0.6*d), eyeR.y-(0.75*d) );
      translate( eyeR.x+(x_eye_offset*d), eyeR.y );
      rotate(aaaa);
      image(img_opf_2, 0, 0,  2.3*d, 1.15*d );
      pop()
      imageMode(CORNER);
      angleMode(RADIANS);
    }

    if(drawmode==6){
      // opf carl
      imageMode(CENTER);
      angleMode(DEGREES);
      push();
      // translate( eyeR.x-(0.6*d), eyeR.y-(0.75*d) );
      translate( eyeR.x+(0.5*d), eyeR.y );
      rotate(aaaa);
      image(img_opf_3, 0, 0,  4.3*d, 4.15*d );
      pop()
      imageMode(CORNER);
      angleMode(RADIANS);
    }
  }
}




function _angle(originX, originY, targetX, targetY) {
  var dx = originX - targetX;
  var dy = originY - targetY;

  var theta = Math.atan2(-dy, -dx); // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = east
  theta *= 180 / Math.PI;           // [0, 180] then [-180, 0]; clockwise; 0° = east
  if (theta < 0) theta += 360;      // [0, 360]; clockwise; 0° = east
  
  return theta;
}


function drawAngle(startx, starty, length, angle, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  angleMode(DEGREES);
  line(startx, starty, startx+length, starty);
  pop();

  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(startx, starty);
  rotate(angle-90);
  line(0, 0, 0, length);
  
  // let arrowSize = 7;
  // translate(vec.mag() - arrowSize, 0);
  // triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
  angleMode(RADIANS);
}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

function keyTyped() {
  if (key === '0') {
    drawmode = 0;
  } else if (key === '1') {
    drawmode = 1;
  } else if (key === '2') {
    drawmode = 2;
  } else if (key === '3') {
    drawmode = 3;
  } else if (key === '4') {
    drawmode = 4;
  } else if (key === '5') {
    drawmode = 5;
  } else if (key === '6') {
    drawmode = 6;
  }
  // uncomment to prevent any default behavior
  // return false;
}