// Speech synthesis variables
let synthesis;
let utterance;
const voicesDropdown = document.querySelector("#Voice");
const speedInput = document.querySelector("#speed");
const pitchInput = document.querySelector("#pitch");
const textInput = document.querySelector("#Text");
const audioElement = document.getElementById("audio");
const playButton = document.querySelector("#play-button");
const pauseButton = document.querySelector("#pause-button");
const resumeButton = document.querySelector("#resume-button");
const downloadButton = document.querySelector("#download-button");

let mediaRecorder;
let isRecording = false;
let recordedChunks = [];

// Set a default voice option
const defaultVoice = "Default Voice"; // Replace with the name of the default voice you want to use

// Function to populate the voices dropdown
function populateVoices() {
  const voices = window.speechSynthesis.getVoices();
  voicesDropdown.innerHTML = voices
    .map(voice => `<option value="${voice.name}">${voice.name}</option>`)
    .join("");

  // Set the default voice option
  voicesDropdown.value = defaultVoice;
}

// Fetch available voices when the page loads
window.addEventListener("DOMContentLoaded", () => {
  populateVoices();
  // Wait for voices to be loaded, then enable the play button
  window.speechSynthesis.onvoiceschanged = () => {
    populateVoices();
    playButton.disabled = false;
  };
});

function clearPlaceholder() {
  const textarea = document.getElementById("Text");
  textarea.placeholder = "";
}

function playTextToSpeech(event) {
  event.preventDefault();

  synthesis = window.speechSynthesis;
  if (synthesis.speaking) {
    synthesis.cancel();
  }

  utterance = new SpeechSynthesisUtterance();
  utterance.text = textInput.value;
  utterance.voice = synthesis.getVoices().find(
    voice => voice.name === voicesDropdown.value
  );
  utterance.rate = parseFloat(speedInput.value);
  utterance.pitch = parseFloat(pitchInput.value);

  synthesis.speak(utterance);
  audioElement.src = "";
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  downloadButton.disabled = true;
  downloadButton.removeEventListener("click", downloadAudio);
  downloadButton.addEventListener("click", downloadAudio);

  utterance.addEventListener("end", () => {
    pauseButton.disabled = true;
    resumeButton.disabled = true;
    downloadButton.disabled = false;
    stopRecording();
  });

  startRecording();
}

function pauseTextToSpeech() {
  synthesis.pause();
  pauseButton.disabled = true;
  resumeButton.disabled = false;
}

function resumeTextToSpeech() {
  synthesis.resume();
  pauseButton.disabled = false;
  resumeButton.disabled = true;
}

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorder.start();
    isRecording = true;
  });
}

function stopRecording() {
  if (isRecording) {
    mediaRecorder.stop();
    isRecording = false;
  }
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

function downloadAudio() {
  if (recordedChunks.length > 0) {
    const blob = new Blob(recordedChunks, { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    audioElement.src = url;

    const link = document.createElement("a");
    link.href = url;
    link.download = "speech.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

audioElement.addEventListener("ended", () => {
  pauseButton.disabled = true;
  resumeButton.disabled = true;
  downloadButton.disabled = false;
});
