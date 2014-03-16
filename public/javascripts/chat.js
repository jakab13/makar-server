jQuery(function($){
    var socket = io.connect();
    var messageForm = $('#send-message');
    var messageBox = $('#message');
    var checkBox = $('#checkBox');
    var chat = $('#chat');
    var room = $('#room').val();

    socket.on('connect', function () {
        socket.emit('room', room);
        socket.emit('get inits');
    });

    messageForm.submit(function(e){
        e.preventDefault();
//        var isPersistent = checkBox.val();
        var msg = messageBox.val();
        var data = {isPersistent: true, msg: msg};
        socket.emit('send message', data);
        messageBox.val('');
    });

    socket.on('new message', function(data){
        chat.append(data + "<br/>");
    });
    socket.on('inits', function(data){
        chat.append('Initialised data: ' + data + "<br/>");
    });
});