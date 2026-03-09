class EmailVerification {

  constructor(config) {

    this.emailInput = document.getElementById(config.emailInput);
    this.codeInput = document.getElementById(config.codeInput);

    this.sendBtn = document.getElementById(config.sendBtn);
    this.validateBtn = document.getElementById(config.validateBtn);
    this.resendBtn = document.getElementById(config.resendBtn);

    this.afterCodeSection = document.getElementById(config.afterCodeSection);
    this.successSection = document.getElementById(config.successSection);

    this.timerText = document.getElementById(config.timerText);
    this.timerElement = config.timerElement;

    this.message = document.getElementById(config.message);

    this.maxAttempts = 3;
    this.validationAttempts = 0;
    this.codeValidated = false;

    this.timeLeft = 60;
    this.interval = null;

    this.attachEvents();
  }


  attachEvents() {

  if (this.sendBtn)
    this.sendBtn.addEventListener("click", () => this.sendCode());

  if (this.validateBtn)
    this.validateBtn.addEventListener("click", () => this.validateCode());

  if (this.resendBtn)
    this.resendBtn.addEventListener("click", () => this.resendCode());

}


  async sendCode() {
    console.log("inside send code")
    const email = this.emailInput.value;

    if (!email) {
      alert("Enter email first");
      return;
    }

    try {

      const res = await fetch("/api/email/send-code", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if(res.ok && data.success){

        alert("Verification code sent");

        this.afterCodeSection.classList.remove("hidden");
        this.sendBtn.style.display = "none";
        this.validateBtn.style.display = "block";
        this.codeInput.disabled = false;

        this.timerText.innerHTML =
          `Code expires in <span id="${this.timerElement}">60</span>s`;

        this.startTimer();

      } else {
        alert("Failed to send code");
      }

    } catch(err){
      alert(err.message);
    }

  }


  startTimer(){

    clearInterval(this.interval);

    this.timeLeft = 60;

    const timer = document.getElementById(this.timerElement);

    timer.textContent = this.timeLeft;

    this.interval = setInterval(() => {

      this.timeLeft--;

      timer.textContent = this.timeLeft;

      if(this.timeLeft <= 0){

        clearInterval(this.interval);

        this.timerText.textContent = "Verification code expired";

        this.validateBtn.style.display = "none";

        if(!this.codeValidated && this.validationAttempts < this.maxAttempts){
          this.resendBtn.classList.remove("hidden");
        }

      }

    },1000);
  }


  async validateCode() {
  const email = this.emailInput.value;
  const code = this.codeInput.value;

  if (!code) {
    alert("Enter verification code");
    return;
  }

  try {
    const res = await fetch("/api/email/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Code is correct
      this.codeValidated = true;

      clearInterval(this.interval); // stop timer immediately

      this.afterCodeSection.classList.add("hidden");

      if (this.successSection) this.successSection.classList.remove("hidden");

      if (this.message) {
        this.message.textContent = "Verification successful";
        this.message.style.color = "green";
      }

    } else {
      // Code is invalid
      this.validationAttempts++;

      // Stop the timer immediately
      clearInterval(this.interval);

      if (this.validationAttempts >= this.maxAttempts) {
        this.message.textContent = "Maximum verification attempts reached";
        this.message.style.color = "red";
        this.timerText.textContent = "";
        
        this.validateBtn.style.display = "none";
        this.resendBtn.style.display = "none";

        return;
      }

      // Allow resending
      this.message.textContent = "Invalid verification code";
      this.message.style.color = "red";

      this.validateBtn.style.display = "none";
      this.resendBtn.classList.remove("hidden");

      // Hide the timer since validation failed
      this.timerText.textContent = "";
    }
  } catch (err) {
    alert(err.message);
  }
}


  async resendCode(){

    const email = this.emailInput.value;

    try{

      const res = await fetch("/api/email/send-code",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email})
      });

      const data = await res.json();

      if(res.ok && data.success){

        alert("New verification code sent");

        this.codeInput.value = "";

        this.validateBtn.style.display = "block";

        this.resendBtn.classList.add("hidden");

        this.timerText.innerHTML =
          `Code expires in <span id="${this.timerElement}">60</span>s`;

        this.startTimer();
      }

    } catch(err){
      alert(err.message);
    }

  }

}