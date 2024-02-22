const { ipcRenderer, remote } = require('electron')

let localStream
let microAudioStream
let recordedChunks = []
let numRecordedChunks = 0
let recorder
let interval;
let saved = false;
let paused = false;

let $body;
let $tiktok;
let recordingTime = 0;
let $audioCheckbox;
// let includeSysAudio = false

document.addEventListener('DOMContentLoaded', () => {
    $body = document.querySelector("body")
    $tiktok = document.querySelector("#tik-tok")
    $audioCheckbox = document.querySelector("#f-microphone")

    document.querySelector('#start-recording').addEventListener('click', recordDesktop)
    document.querySelector('#stop-recording').addEventListener('click', stopRecording)
    document.querySelector('#f-microphone-label').addEventListener('click', microAudioCheck)

    document.querySelector('#start-new').addEventListener('click', startNew)

    // document.querySelector('#play-video').addEventListener('click', playVideo)
    // document.querySelector('#play-button').addEventListener('click', play)
    document.querySelector('#download-button').addEventListener('click', download)
})

const playVideo = () => {
    remote.dialog.showOpenDialog({ properties: ['openFile'] }, (filename) => {
        // console.log(filename)
        let video = document.querySelector('video')
        video.muted = false
        video.src = filename
    })
}

const microAudioCheck = () => {
    var video = document.querySelector('video')
    video.muted = true
    setTimeout(() => {
        if ($audioCheckbox.checked) {
            navigator.webkitGetUserMedia({ audio: true, video: false }, getMicroAudio, getUserMediaError)
        }
    }, 10);
}
const startNew = () => {
    $body.classList.remove("b-recording")
    $body.classList.remove("b-recorded")
    $body.classList.add("b-pre-record")
    $tiktok.innerHTML = "00:00:00"
    cleanRecord()
}
const cleanRecord = () => {
    let video = document.querySelector('video');
    video.controls = false;
    recordedChunks = []
    numRecordedChunks = 0
}

ipcRenderer.on('source-id-selected', (event, sourceId) => {
    if (!sourceId) return
    // console.log(sourceId)
    onAccessApproved(sourceId)
})
ipcRenderer.on('save', (event) => {
    if(!saved){
        stopRecording()
    }
})
ipcRenderer.on('mute', (event, isMuted) => {
    $audioCheckbox.checked = isMuted
    if(localStream){
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
            audioTracks[0].enabled = !isMuted;
        }
    }
    // microAudioCheck()
})
ipcRenderer.on('pauseState', (event, isPaused) => {
    paused = isPaused
    if(isPaused){
        recorder.pause()
    }else {
        recorder.resume();
    }
})


const recordDesktop = () => {
    cleanRecord()
    ipcRenderer.send('show-picker', { types: ['screen'] })
}

const recorderOnDataAvailable = (event) => {
    if(paused){
        return;
    }
    if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data)
        numRecordedChunks += event.data.byteLength
    }
}

const stopRecording = () => {
    recorder.stop()
    localStream.getVideoTracks()[0].stop()

    $body.classList.remove("b-pre-record")
    $body.classList.remove("b-recording")
    $body.classList.add("b-recorded")
    saved = true
    clearInterval(interval)
    setTimeout(() => {
        play()
    }, 100);

    ipcRenderer.send('save', {main: true})
}

const play = () => {
    // Unmute video.
    let video = document.querySelector('video')
    video.controls = true;
    video.muted = false
    let blob = new Blob(recordedChunks, { type: 'video/mp4' })
    video.src = window.URL.createObjectURL(blob)
}

const download = () => {
    let blob = new Blob(recordedChunks, { type: 'video/mp4' })
    let url = URL.createObjectURL(blob)
    let a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'
    a.href = url
    a.download = 'screen-recorder.mp4'
    a.click()
    setTimeout(function () {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }, 100)
}

const getMediaStream = (stream) => {
    let video = document.querySelector('video')
    saved = false
    // video.src = stream
    localStream = stream
    // stream.onended = () => { console.log('Media stream ended.') }

    let videoTracks = localStream.getVideoTracks()

    if ($audioCheckbox.checked) {
        // console.log('Adding audio track.')
        let audioTracks = microAudioStream.getAudioTracks()
        localStream.addTrack(audioTracks[0])
    }
    try {
        // console.log('Start recording the stream.')
        recorder = new MediaRecorder(stream)
    } catch (e) {
        console.assert(false, 'Exception while creating MediaRecorder: ' + e)
        return
    }
    recorder.ondataavailable = recorderOnDataAvailable
    // recorder.onstop = () => { console.log('recorderOnStop fired') }
    recorder.start()
    // console.log('Recorder is started.')

    // disableButtons()
    $body.classList.remove("b-pre-record")
    $body.classList.add("b-recording")

    recordingTime = 0
    clearInterval(interval)
    interval = setInterval(() => {
        if(!saved && !paused){
            recordingTime += 1
            const fmt = formatTime(recordingTime)
            $tiktok.innerHTML = fmt
            // send to small window
            ipcRenderer.send('record-tik-tok', { time: fmt })
        }
    }, 1000);


    // close window 
    ipcRenderer.send('recording', { type: "close" })

}


function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    remainingSeconds = String(remainingSeconds).padStart(2, '0');
    return `${hours}:${minutes}:${remainingSeconds}`;
}

const getMicroAudio = (stream) => {
    // console.log('Received audio stream.')
    microAudioStream = stream
    // stream.onended = () => { console.log('Micro audio ended.') }
}

const getUserMediaError = () => {
    // console.log('getUserMedia() failed.')
}

const onAccessApproved = (id) => {
    if (!id) {
        // console.log('Access rejected.')
        return
    }
    // console.log('Window ID: ', id)
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop', chromeMediaSourceId: id,
                maxWidth: window.screen.width, maxHeight: window.screen.height
            }
        }
    }, getMediaStream, getUserMediaError)
}
