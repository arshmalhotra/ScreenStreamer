const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

let mediaRecorder;
let hostIdStr;
const phoneticAlpha = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliet',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
  'Uniform',
  'Victor',
  'Whiskey',
  'X-ray',
  'Yankee',
  'Zulu'
]

// Elements
const hostBtn = document.getElementById('hostBtn');
const attendeeBtn = document.getElementById('attendeeBtn');
const sourceSelectBtn = document.getElementById('sourceSelectBtn');
const videoDiv = document.getElementById('attendeeVideo');
const hostId = document.getElementById('hostId');
const attendeeId = document.getElementById('attendeeId');

sourceSelectBtn.onclick = getVideoSources;
hostBtn.onclick = setupHost;


// Setup host
function setupHost() {
  if (hostBtn.innerText == 'Host') {
    hostBtn.classList.add('is-danger');
    hostBtn.innerText = 'Stop Hosting';
    generateHostId();
    hostId.innerText = hostIdStr;

    mediaRecorder.start();
  } else {
    hostBtn.classList.remove('is-danger');
    hostBtn.innerText = 'Host';
    hostId.innerText = '';

    mediaRecorder.stop();
  }
}

// Generate host ID
function generateHostId() {
  const idLength = 4
  var hostIdBuilder = []

  for (var i=0; i<idLength; i++) {
     var random = Math.floor(Math.random() * phoneticAlpha.length);
     hostIdBuilder.push(phoneticAlpha[random]);
  }

  hostIdStr = hostIdBuilder.join(" ");
}

// Get available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectVideoSource(source)
      };
    })
  );
  videoOptionsMenu.popup();
}

// Select video source for streaming
async function selectVideoSource(source) {
  videoDiv.innerHTML = '<video></video>';
  const videoElement = document.querySelector('video');
  videoElement.innerText = source.name;
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  // Stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  console.log(stream);
  videoElement.srcObject = stream;
  videoElement.play();
  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

// Send stream data to database
function handleDataAvailable(e) {
  console.log(e.data);
  firebase.database().ref(hostIdStr).set({
    data: e.data
  });
}

function handleStop(e) {
  // firebase.database().ref(hostIdStr).remove();
}
