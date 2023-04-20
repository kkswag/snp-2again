/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";

import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import sound from "../src/sound/DingSound.mp3";
import countSound from "../src/sound/soundCountDown.mp3";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as posedetection from "@tensorflow-models/pose-detection";

import { Camera } from "./camera";
import { setupDatGui } from "./option_panel";
import { STATE } from "./params";
import { setupStats } from "./stats_panel";
import { setBackendAndEnvFlags } from "./util";
import { clearWebGLContext } from "@tensorflow/tfjs-backend-webgl/dist/canvas_util";
import { time } from "@tensorflow/tfjs-core";

let detector, camera, stats;
let startInferenceTime,
  numInferences = 0;
let inferenceTimeSum = 0,
  lastPanelUpdate = 0,
  totalSeconds = 0;
let rafId;
let timer, result;

async function createDetector() {
  result = document.getElementById("result");
  timer = document.getElementById("timer");
  switch (STATE.model) {
    case posedetection.SupportedModels.PoseNet:
      return posedetection.createDetector(STATE.model, {
        quantBytes: 4,
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: 500, height: 500 },
        multiplier: 0.75,
      });
    case posedetection.SupportedModels.BlazePose:
      const runtime = STATE.backend.split("-")[0];
      if (runtime === "mediapipe") {
        return posedetection.createDetector(STATE.model, {
          runtime,
          modelType: STATE.modelConfig.type,
          solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
        });
      } else if (runtime === "tfjs") {
        return posedetection.createDetector(STATE.model, {
          runtime,
          modelType: STATE.modelConfig.type,
        });
      }
    case posedetection.SupportedModels.MoveNet:
      let modelType;
      if (STATE.modelConfig.type == "lightning") {
        modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
      } else if (STATE.modelConfig.type == "thunder") {
        modelType = posedetection.movenet.modelType.SINGLEPOSE_THUNDER;
      } else if (STATE.modelConfig.type == "multipose") {
        modelType = posedetection.movenet.modelType.MULTIPOSE_LIGHTNING;
      }
      const modelConfig = { modelType };

      if (STATE.modelConfig.customModel !== "") {
        modelConfig.modelUrl = STATE.modelConfig.customModel;
      }
      if (STATE.modelConfig.type === "multipose") {
        modelConfig.enableTracking = STATE.modelConfig.enableTracking;
      }
      return posedetection.createDetector(STATE.model, modelConfig);
  }
}

async function checkGuiUpdate() {
  if (STATE.isTargetFPSChanged || STATE.isSizeOptionChanged) {
    camera = await Camera.setupCamera(STATE.camera);
    STATE.isTargetFPSChanged = false;
    STATE.isSizeOptionChanged = false;
  }

  if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
    STATE.isModelChanged = true;

    window.cancelAnimationFrame(rafId);

    if (detector != null) {
      detector.dispose();
    }

    if (STATE.isFlagChanged || STATE.isBackendChanged) {
      await setBackendAndEnvFlags(STATE.flags, STATE.backend);
    }

    try {
      detector = await createDetector(STATE.model);
    } catch (error) {
      detector = null;
      alert(error);
    }

    STATE.isFlagChanged = false;
    STATE.isBackendChanged = false;
    STATE.isModelChanged = false;
  }
}

function beginEstimatePosesStats() {
  startInferenceTime = (performance || Date).now();
}

function endEstimatePosesStats() {
  const endInferenceTime = (performance || Date).now();
  inferenceTimeSum += endInferenceTime - startInferenceTime;
  ++numInferences;

  const panelUpdateMilliseconds = 1000;
  if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
    const averageInferenceTime = inferenceTimeSum / numInferences;
    inferenceTimeSum = 0;
    numInferences = 0;
    stats.customFpsPanel.update(
      1000.0 / averageInferenceTime,
      120 /* maxValue */
    );
    lastPanelUpdate = endInferenceTime;
  }
}

async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(video);
      };
    });
  }

  let poses = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // FPS only counts the time it takes to finish estimatePoses.
    beginEstimatePosesStats();

    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      poses = await detector.estimatePoses(camera.video, {
        maxPoses: STATE.modelConfig.maxPoses,
        flipHorizontal: false,
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }

    endEstimatePosesStats();
  }

  camera.drawCtx();

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (poses && poses.length > 0 && !STATE.isModelChanged) {
    camera.drawPosesOneLeft(poses);
    camera.drawPosesOneRight(poses);
    camera.drawPosesTwoLeft(poses);
    camera.drawPosesTwoRight(poses);
    camera.drawPosesThreeLeft(poses);
    camera.drawPosesThreeRight(poses);
    camera.drawPosesFourLeft(poses);
    camera.drawPosesFourRight(poses);
    camera.drawPosesFive(poses);
  }
}

function setTimerInterval() {
  window.setInterval(setTime, 1000);
  // window.setInterval(setTimeRight, 1000);
}
      // var btn_save =
      //   '<div class="col-12 mt-3"><a href="./follow.html"><button class="updateExcerise btn btn-success" onclick="upload()">ยืนยัน</button></a></div>';

      // $("#show_btn").append(btn_save);

      let isTwoLeftDone = false;
      let isTwoRightDone = false;
      let isLeftDone = false;
      let isRightDone = false;
      let isThreeLeftDone = false;
      let isThreeRightDone = false;
      let isFourLeftDone = false;
      let isFourRightDone = false;
      // let isFiveDone = false;

// function setTime(){
//   switch(true) {
//     case camera.isTwoLeft:
      
//       turnLeftTwo();
//       break;
//     case camera.isTwoRight:
//       turnRightTwo();
//       break;
//     case camera.isLeft:
//       direction.innerHTML = "Step 1: หันหน้าไปทางซ้าย";
//       turnLeft();
//       break;
//     case camera.isRight:
//       turnRight();
//       break;
//     case camera.isThreeLeft:
//       direction.innerHTML = "Step 1: ยกแขนซ้ายพาดไหล่ขวา";
//       turnLeftThree();
//       break;
//     case camera.isThreeRight:
//       turnRightThree();
//       break;
//       case camera.isFourLeft:
//       direction.innerHTML = "Step 1: ยกข้อศอกแขนซ้ายขึ้น";
//       turnLeftFour();
//       break;
//     case camera.isFourRight:
//       turnRightFour();
//       break;
//     default:
//       totalSeconds = 0;
//       timer.innerHTML = "00";
//       break;
//   }
// }  


function setTime() {
  if (!isTwoLeftDone && camera.isTwoLeft) {
    $('#poseEx1').show()
    // $('#mark2').show()
    turnLeftTwo();

  } else if (!isTwoRightDone && camera.isTwoRight && isTwoLeftDone == true) {
    $('#poseEx1').hide()
    $('#poseEx2').show()
    turnRightTwo();
    
  } else if (!isLeftDone && camera.isLeft && isTwoRightDone == true) {
    direction.innerHTML = "Step 1: หันหน้าไปทางซ้าย";
    $('#poseEx2').hide()
    $('#poseEx3').show()
    $('#mark2').hide()
    $('#mark1').show()
    turnLeft();
  
  } else if (!isRightDone && camera.isRight && isLeftDone == true) {
    $('#poseEx3').hide()
    $('#poseEx4').show()
    turnRight();
  
  } else if (!isThreeLeftDone && camera.isThreeLeft && isRightDone == true) {
    direction.innerHTML = "Step 1: ยกแขนซ้ายพาดไหล่ขวา";
    $('#poseEx4').hide()
    $('#poseEx5').show()
    turnLeftThree();

  } else if (!isThreeRightDone && camera.isThreeRight && isThreeLeftDone == true) {
    $('#poseEx5').hide()
    $('#poseEx6').show()
    turnRightThree();
  
  } else if (!isFourLeftDone && camera.isFourLeft && isThreeRightDone == true) {
    direction.innerHTML = "Step 1: ยกข้อศอกแขนซ้ายขึ้น";
    $('#poseEx6').hide()
    $('#poseEx7').show()
    turnLeftFour();
    
  } else if (!isFourRightDone && camera.isFourRight && isFourLeftDone == true) {
    $('#poseEx7').hide()
    $('#poseEx8').show()
    turnRightFour(); 
    shButton();
    
  }
  // else if (!isFiveDone && camera.isFive && isFiveDone == true) {
  //   turnFive(); 
  //   shButton();
  // } 
  else {
    totalSeconds = 0;
    timer.innerHTML = "00 วินาที";
  }
}


function shButton(){
  if(isFourRightDone && camera.isFourRight && isFourLeftDone == true){
    var btn_save =
    '<div class="col-12 mt-3"><a ><button class="updateExcerise btn btn-success" onclick="upload()">ยืนยัน</button></a></div>';
    
    $("#show_btn").append(btn_save);
  }
}



function turnLeftTwo(){
  if (camera.isTwoLeft) {
    //let tick = new Audio(countSound);
  
    //tick.play();
    ++totalSeconds;
    if (totalSeconds == 5) {
      //tick.pause();
      set_one.innerHTML = "ท่าที่ 1 step 1: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_one").css("background-color", "#63e336");
      console.log("state two success");
      isTwoLeftDone = true;
      direction.innerHTML = "Step 2: เอียงคอไปทางขวา";
      $('#poseEx1').hide()
      $('#poseEx2').show()
      $('#mark2').show()
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }

    
    timer.innerHTML = pad(totalSeconds % 60+" วินาที");
  }
}
function turnRightTwo(){
  if (camera.isTwoRight) {
    //let tick = new Audio(countSound);
    direction.innerHTML = "Step 2: เอียงคอไปทางขวา";
    //tick.play();
    ++totalSeconds;
    if (totalSeconds == 5) {
      //tick.pause();
      set_one.innerHTML = "ท่าที่ 1 step 2: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_two").css("background-color", "#63e336");
      console.log("state two success");
      isTwoRightDone = true;
      direction.innerHTML = "Step 1: หันหน้าไปทางซ้าย";
      $('#poseEx2').hide()
      $('#poseEx3').show()
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";
  }
}

function turnLeft(){
  if (camera.isLeft) {
    //let tick = new Audio(countSound);
    //tick.play();
    direction.innerHTML = "Step 1: หันหน้าไปทางซ้าย";
    ++totalSeconds;

    if (totalSeconds == 5) {
      //tick.pause();
      set_two.innerHTML = "ท่าที่ 2 step 1: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_three").css("background-color", "#63e336");
      console.log("state one success");
      isLeftDone = true;
      direction.innerHTML = "Step 2: หันหน้าไปทางขวา";
      $('#poseEx3').hide()
      $('#poseEx4').show()
      // $('#mark2').hide()
      // $('#mark1').show()
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";
  }
}
function turnRight(){
  if (camera.isRight) {
    //let tick = new Audio(countSound);
    direction.innerHTML = "Step 2: หันหน้าไปทางขวา";
    //tick.play();
    ++totalSeconds;
    if (totalSeconds == 5) {
      //tick.pause();
      set_two.innerHTML = "ท่าที่ 2 step 2: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_four").css("background-color", "#63e336");
      console.log("state two success");
      isRightDone = true;
      direction.innerHTML = "Step 1: ยกแขนซ้ายพาดไหล่ขวา";
      $('#poseEx4').hide()
      $('#poseEx5').show()
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";;
  }
}

function turnLeftThree(){
  if (camera.isThreeLeft) {
    //let tick = new Audio(countSound);
    //tick.play();
    direction.innerHTML = "Step 1: ยกแขนซ้ายพาดไหล่ขวา";
    ++totalSeconds;

    if (totalSeconds == 5) {
      //tick.pause();
      set_three.innerHTML = "ท่าที่ 3 step 1: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_five").css("background-color", "#63e336");
      console.log("state three success");
      isThreeLeftDone = true;
      direction.innerHTML = "Step 2: ยกแขนขวาพาดไหล่ซ้าย";
      $('#poseEx5').hide()
      $('#poseEx6').show()
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";;
  }
}
function turnRightThree(){
  if (camera.isThreeRight) {
    //let tick = new Audio(countSound);
    direction.innerHTML = "Step 2: ยกแขนขวาพาดไหล่ซ้าย";
    //tick.play();
    ++totalSeconds;
    if (totalSeconds == 5) {
      //tick.pause();
      set_three.innerHTML = "ท่าที่ 3 step 2: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_six").css("background-color", "#63e336");
      console.log("state three success");
      isThreeRightDone = true;
      direction.innerHTML = "Step 1: ยกข้อศอกแขนซ้ายขึ้น";
      $('#poseEx6').hide()
      $('#poseEx7').show()
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";;
  }
}

function turnLeftFour(){
  if (camera.isFourLeft) {
    //let tick = new Audio(countSound);
    //tick.play();
    direction.innerHTML = "Step 1: ยกข้อศอกแขนซ้ายขึ้น";
    ++totalSeconds;

    if (totalSeconds == 5) {
      //tick.pause();
      set_four.innerHTML = "ท่าที่ 4 step 1: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_seven").css("background-color", "#63e336");
      console.log("state three success");
      isFourLeftDone = true;
      direction.innerHTML = "Step 2: ยกข้อศอกแขนขวาขึ้น";
      $('#poseEx7').hide()
      $('#poseEx8').show()
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";;
  }
}
function turnRightFour(){
  if (camera.isFourRight) {
    //let tick = new Audio(countSound);
    direction.innerHTML = "Step 2: ยกข้อศอกแขนขวาขึ้น";
    //tick.play();
    ++totalSeconds;
    if (totalSeconds == 5) {
      //tick.pause();
      set_four.innerHTML = "ท่าที่ 4 step 2: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_eight").css("background-color", "#63e336");
      console.log("state three success");
      isFourRightDone = true;
      direction.innerHTML = "Step 1: ประกบมือและยื่นแขนไปข้างหน้า";
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";;
  }
} 

function turnFive(){
  if (camera.isFive) {
    //let tick = new Audio(countSound);
    //tick.play();
    direction.innerHTML = "Step 1: ประกบมือและยื่นแขนไปข้างหน้า";
    ++totalSeconds;

    if (totalSeconds == 5) {
      //tick.pause();
      set_five.innerHTML = "ท่าที่ 5 step 1: ";
      let ding = new Audio(sound);
      ding.play();
      $(".circle_seven").css("background-color", "#63e336");
      console.log("state three success");
      isFiveDone = true;
      totalSeconds = 0;
      timer.innerHTML = "00 วินาที";
    }
    
    timer.innerHTML = pad(totalSeconds % 60)+" วินาที";;
  }
}




function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

async function renderPrediction() {
  // await checkGuiUpdate();
  if (!STATE.isModelChanged) {
    await renderResult();
  }

  rafId = requestAnimationFrame(renderPrediction);
}

async function app() {
  // Gui content will change depending on which model is in the query string.
  // const urlParams = new URLSearchParams(window.location.search);
  // if (!urlParams.has('model')) {
  //   alert('Cannot find model in the query string.');
  //   return;
  // }

  await setupDatGui();

  stats = setupStats();

  camera = await Camera.setupCamera(STATE.camera);

  await setBackendAndEnvFlags(STATE.flags, STATE.backend);

  detector = await createDetector();

  renderPrediction();

  setTimerInterval();
  // setTimerIntervalTwo();
}

app();
