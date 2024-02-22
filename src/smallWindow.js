const { ipcRenderer, remote } = require('electron')


const muteIcon = `<svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="red" class="mute">
<path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"/>
<path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
</svg>`
const mic = `<svg fill="#67ec88" width="800px" height="800px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M25 0C18.921875 0 14 4.785156 14 10.71875L14 11L21.5 11C22.050781 11 22.5 11.449219 22.5 12C22.5 12.550781 22.050781 13 21.5 13L14 13L14 15L21.5 15C22.050781 15 22.5 15.449219 22.5 16C22.5 16.550781 22.050781 17 21.5 17L14 17L14 19L21.5 19C22.050781 19 22.5 19.449219 22.5 20C22.5 20.550781 22.050781 21 21.5 21L14 21L14 23.28125C14 29.214844 18.921875 34 25 34C31.078125 34 36 29.214844 36 23.28125L36 21L28.5 21C27.945313 21 27.5 20.550781 27.5 20C27.5 19.449219 27.945313 19 28.5 19L36 19L36 17L28.5 17C27.945313 17 27.5 16.550781 27.5 16C27.5 15.449219 27.945313 15 28.5 15L36 15L36 13L28.5 13C27.945313 13 27.5 12.550781 27.5 12C27.5 11.449219 27.945313 11 28.5 11L36 11L36 10.71875C36 4.785156 31.078125 0 25 0 Z M 9.8125 17.125C9.402344 17.210938 9.113281 17.582031 9.125 18L9.125 23C9.125 30.714844 14.6875 37.183594 22 38.59375L22 44L28 44L28 38.59375C35.3125 37.183594 40.875 30.714844 40.875 23L40.875 18C40.875 17.515625 40.484375 17.125 40 17.125C39.515625 17.125 39.125 17.515625 39.125 18L39.125 23C39.125 30.800781 32.800781 37.125 25 37.125C17.199219 37.125 10.875 30.800781 10.875 23L10.875 18C10.878906 17.75 10.773438 17.511719 10.589844 17.34375C10.402344 17.175781 10.15625 17.09375 9.90625 17.125C9.875 17.125 9.84375 17.125 9.8125 17.125 Z M 15.5 46C13.585938 46 12.03125 47.5625 12.03125 49.46875L12 50L37.875 49.9375L37.90625 49.46875C37.90625 47.5625 36.351563 46 34.4375 46Z"/></svg>`
const pause = `<svg fill="#67ec88" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
viewBox="0 0 512 512" xml:space="preserve">
<path d="M256,0C114.617,0,0,114.615,0,256s114.617,256,256,256s256-114.615,256-256S397.383,0,256,0z M224,320
c0,8.836-7.164,16-16,16h-32c-8.836,0-16-7.164-16-16V192c0-8.836,7.164-16,16-16h32c8.836,0,16,7.164,16,16V320z M352,320
c0,8.836-7.164,16-16,16h-32c-8.836,0-16-7.164-16-16V192c0-8.836,7.164-16,16-16h32c8.836,0,16,7.164,16,16V320z"/>
</svg>`

const resume = `<svg width="800px" height="800px" viewBox="-0.5 0 7 7" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="Dribbble-Light-Preview" transform="translate(-347.000000, -3766.000000)" fill="#67ec88">
        <g id="icons" transform="translate(56.000000, 160.000000)">
            <path d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322" id="play-[#1003]"></path>
        </g>
    </g>
</g>
</svg>`


let muted = false;
let paused = false;


let $drag;
let $playPause;
let $mute;
let $close;
let $tiktok;


document.addEventListener('DOMContentLoaded', () => {
    $tiktok = document.querySelector("#tik-tok")

    $playPause = document.querySelector("#pauseButton")
    $playPause.addEventListener("click", () => {
        paused = !paused
        $playPause.innerHTML = paused ? resume : pause
        ipcRenderer.send('pauseState', paused)
    })

    $mute = document.querySelector("#muteButton")
    $mute.addEventListener("click", () => {
        muted = !muted
        $mute.innerHTML = muted ? muteIcon : mic
        ipcRenderer.send('mute', muted)
    })
    document.querySelector("#closeButton").addEventListener("click", () => {
        ipcRenderer.send('close-small', { type: "close" })
    })
    
    document.querySelector("#save").addEventListener("click", () => {
        ipcRenderer.send('save', { type: "close" })
    })
    
    // const customWindow = remote.getCurrentWindow();
    // document.querySelector("#dragArea").addEventListener('mousedown', (event) => {
    //     const initialMouseX = event.clientX;
    //     const initialMouseY = event.clientY;

    //     const windowPosition = customWindow.getPosition();

    //     const onMouseMove = (event) => {
    //         const deltaX = event.clientX - initialMouseX;
    //         const deltaY = event.clientY - initialMouseY;

    //         customWindow.setPosition(windowPosition[0] + deltaX, windowPosition[1] + deltaY);
    //     };

    //     const onMouseUp = () => {
    //         document.removeEventListener('mousemove', onMouseMove);
    //         document.removeEventListener('mouseup', onMouseUp);
    //     };

    //     document.addEventListener('mousemove', onMouseMove);
    //     document.addEventListener('mouseup', onMouseUp);
    // });
})

ipcRenderer.on('record-tik-tok', (event, data) => {
    // console.log(data);
    $tiktok.innerHTML = data?.time;
})