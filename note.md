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
    <div class="loginPart">
      <div class="background"></div>
      <div class="loginIm">
        <h1>WELLCOME</h1>
        <img src="/logo2.cf598e60.png" alt="">

        <div class="row">
          <div class="loginForm">
            <div class="userPart">
              <lable for="usernameL" class="form-label w-100">USERNAME</lable>
              <input type="text" name="usernameL" id="usernameL" class="form-control">
            </div>

            <div class="passwordPart">
              <label for="passwordL" class="form-label w-100">PASSWORD</label>
              <input type="password" name="passwordL" id="passwordL">
            </div>
            
            <a href="/register.html">Register</a>
          </div>

          <a><button class="btLogin">LOGIN</button></a>
        </div>

      </div>
    </div>