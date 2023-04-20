function setTime() {
  if(camera.isLeft){
    turnLeft();
  } else if(camera.isRight){
    turnRight();
  }else if(camera.isTwoLeft){
    turnLeftTwo();
  }else if(camera.isTwoRight){
    turnRightTwo();
  }else {
    totalSeconds = 0;
    timer.innerHTML = "00";
  }
}
< -------------------------------------------------------------- >
  drawResults(poses) {
    for (const pose of poses) {
      this.drawResult(pose);
      if (pose["keypoints"][0]["x"] > 400) {
        this.isLeft = true;
      } else if (pose["keypoints"][0]["x"] < 250) {
        this.isRight = true;
      } else {
        this.isLeft = false;
        this.isRight = false;
      }
    }
  }
< -------------------------------------------------------------- >

