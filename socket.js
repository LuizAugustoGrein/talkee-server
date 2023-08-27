const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
    IO = new Server(httpServer);

    IO.use((socket, next) => {
        if (socket.handshake.query) {
            let callerId = socket.handshake.query.callerId;
            console.log('handshake: ' + callerId);
            socket.user = callerId;
            next();
        }
    });

    IO.on("connection", (socket) => {
        socket.join(socket.user);

        socket.on("call", (data) => {
            console.log('oncall: ' + JSON.stringify(data));
            let calleeId = data.calleeId;
            let rtcMessage = data.rtcMessage;

            socket.to(calleeId).emit("newCall", {
                callerId: socket.user,
                rtcMessage: rtcMessage,
            });
        });

        socket.on("answerCall", (data) => {
            console.log('onanswerCall: ' + JSON.stringify(data));
            let callerId = data.callerId;
            rtcMessage = data.rtcMessage;

            socket.to(callerId).emit("callAnswered", {
                callee: socket.user,
                rtcMessage: rtcMessage,
            });
        });

        socket.on("ICEcandidate", (data) => {
            console.log('onICEcandidate: ' + JSON.stringify(data));
            let calleeId = data.calleeId;
            let rtcMessage = data.rtcMessage;

            socket.to(calleeId).emit("ICEcandidate", {
                sender: socket.user,
                rtcMessage: rtcMessage,
            });
        });

        socket.on("hangup", (data) => {
            console.log('hangup: ' + JSON.stringify(data));
            let calleeId = data.calleeId;

            socket.to(calleeId).emit("hangupCall", {
                callerId: socket.user
            });
        });

        socket.on("cameraOff", (data) => {
            console.log('cameraOff');
            let calleeId = data.calleeId;

            socket.to(calleeId).emit("turnCameraOff", {
                callerId: socket.user
            });
        });

        socket.on("cameraOn", (data) => {
            console.log('cameraOn');

            let calleeId = data.calleeId;

            socket.to(calleeId).emit("turnCameraOn", {
                callerId: socket.user
            });
        });
    });
};

module.exports.getIO = () => {
    if (!IO) {
        throw Error("IO not initilized.");
    } else {
        return IO;
    }
};
