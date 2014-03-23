jQuery(function($){
    var socket = io.connect();
    var messageForm = $('#send-message');
    var nameBox = $('#name');
    var valueBox = $('#value');
//    var checkBox = $('#checkBox');
    var chat = $('#chat');
    var room = $('#room').val();

    socket.on('connect', function () {
        socket.emit('room', room);
        socket.emit('get inits');
    });

    messageForm.submit(function(e){
        e.preventDefault();
        var name = nameBox.val();
        var value = valueBox.val();
        var data = {isPersistent: true, name: name, value: value};
        socket.emit('set variable', data);
        nameBox.val('');
        valueBox.val('');
    });

    socket.on('set variable', function(data){
        chat.append(JSON.stringify(data) + "<br/>");
    });
    socket.on('get inits', function(data){
        chat.append('Initialised data: ' + JSON.stringify(data) + "<br/>");
    });
});