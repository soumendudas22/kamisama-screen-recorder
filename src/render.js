// Require packages
const { desktopCapturer, remote } = require("electron");
const { dialog, Menu } = remote;
const { writeFile } = require("fs");

// Buttons
const videoElement = document.querySelector("video");
const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const appSelectbtn = document.querySelector("#appSelectBtn");

// Variables
let mediaRecorder;
const recordedChunks = [];
let isStartBtnDisabled = true;
let isStopBtnDisabled = true;

appSelectbtn.onclick = getAppsOpen;

// Disable the buttons at start of app
startBtn.disabled = isStartBtnDisabled;
stopBtn.disabled = isStopBtnDisabled;

// Get all the applications running or open
async function getAppsOpen() {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  const appOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );

  appOptionsMenu.popup();
}

// Change the video source window to record
async function selectSource(source) {
  appSelectbtn.innerHTML = source.name;

  isStartBtnDisabled = false;
  isStopBtnDisabled = true;
  startBtn.disabled = isStartBtnDisabled;
  stopBtn.disabled = isStopBtnDisabled;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  // Create a stream of video
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Preview the source in the video element
  videoElement.srcObject = stream;
  videoElement.play();

  // Create the Media Recorder
  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

// Captures all recorded chunks
function handleDataAvailable(e) {
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: "video/mp4; codecs=vp9",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save video",
    defaultPath: `vid-${Date.now()}.mp4`,
  });

  if (filePath) {
    writeFile(filePath, buffer, () => console.log("video saved successfully!"));
  }
}

// On click of start button
startBtn.onclick = (e) => {
  if (!isStartBtnDisabled) {
    mediaRecorder.start();
    startBtn.innerHTML = `
            <section class="loader">
                <div class="loader-7">
                    <div class="line line1"></div>
                    <div class="line line2"></div>
                    <div class="line line3"></div>
                </div>
            </section>`;
    startBtn.classList.add("spin");
    isStopBtnDisabled = false;
    isStartBtnDisabled = true;
    startBtn.disabled = isStartBtnDisabled;
    stopBtn.disabled = isStopBtnDisabled;
    appSelectbtn.disabled = true;
  }
};

// On click of short button
stopBtn.onclick = (e) => {
  if (!isStopBtnDisabled) {
    mediaRecorder.stop();
    startBtn.classList.remove("spin");
    startBtn.innerHTML = "START";
    isStopBtnDisabled = true;
    isStartBtnDisabled = false;
    startBtn.disabled = isStartBtnDisabled;
    stopBtn.disabled = isStopBtnDisabled;
    appSelectbtn.disabled = false;
  }
};

// On opening devTools window gets resized, so on resize property close the devTools
window.onresize = () => {
  remote.getCurrentWindow().webContents.closeDevTools();
};

