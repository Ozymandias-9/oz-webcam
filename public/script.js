const socket = io('/');
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
});

const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then((stream) => {
    addVideoStream(myVideo, stream);

    peer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
            console.log('Llamada...')
            addVideoStream(video, userVideoStream);
        })
        videoGrid.append(video);
    })
    socket.on('user-connected', userId => {
        // user is joining
        setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
        }, 1000)
    })
})

socket.on('user-disconnected', (userId) => {
    if(peers[userId]) peers[userId].close();
})

peer.on('open', (id) => {
    socket.emit('join-room', ROOM_ID, id);
})

socket.on('user-connected', (userId) => {
    console.log('User connected: '+ userId);
})

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const connectToNewUser = (userId, stream) => {
    console.log(userId);
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call;
}