var tool = 0;
var flag = true;
function GetHighestIndex() {
    var highest_index = 0;
    var elements = document.getElementsByTagName("*");
    for (var i = 0; i < elements.length - 1; i++) {
        if (parseInt(elements[i].style.zIndex) > highest_index) {
            highest_index = parseInt(elements[i].style.zIndex);
        }
    }
    return highest_index;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getId() {
    var id = getRandomInt(100000000);
    if ($('*').is('#' + id + '')) {
        return getId();
    } else {
        return id
    }
}

(function ($) {

    const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("/board")
        .build();
    hubConnection.start();
    //Variables Declaration
    var $board = $('#board');

    //Create postick
    function Createpost(x, y, z, id,text,width,heigth) {
        if (text==null) {
            text=''
        }
        console.log(heigth)
        $board.append('<div class="postick" id="' + id + '" style="left:' + x + 'px;top:' + y + 'px; z-index:' + z + '"><div class="toolbar"></div><div id="t_' + id + '" contenteditable class="editable">' + text +'</div></div>');            
        $('#t_' + id + '').width(width).height(heigth);
        $('#' + id + '').draggable({
            cancel: '.editable',
            stop: function () {
                var id = parseInt($(this).attr('id'));
                var x = $(this).position().left;
                var y = $(this).position().top;
                var z = $(this).css('z-index')
                var objtext = [id, x, y, z,'Post']
                hubConnection.invoke("Move", objtext);
            },
        });
        $('#' + id + '').on("mouseup", function () {
            var width = $('#t_' + id + '').width();
            var height = $('#t_' + id + '').height();
            var objtext = [id, width, height]
            hubConnection.invoke("ResizePost", objtext);
        });
        $('#t_' + id + '').on("blur",function () {
            console.log('edit');
            var objtext = [id, $('#t_' + id + '').html()];
            hubConnection.invoke("ChangePost", objtext);
        });
        $('#' + id + '').on("click", function () {
 
            if (tool == 4) {
                var $this = $(this);
                $this.closest('.postick').fadeOut('slow', function () {
                    $(this).remove();
                    var objtext = [id,'Post']
                    hubConnection.invoke("RemoveElem", objtext);
                });
            }
            else {
                var z = GetHighestIndex();
                $(this).css('z-index', z+2)
            }
        });
        $('#' + id + '').on('dragstart', function () {
            var z = GetHighestIndex();
            $(this).css('z-index', z + 2)
        });
    };
    
    function Createtext(x, y,text,z,id) {
        $board.append('<div class="nonedittext" id="' + id + '" style="left:' + x + 'px;top:' + y + 'px;z-index:' + z + '" >' + text + '</div>');        
        $('#' + id + '').draggable({
            stop: function () {
                var id = parseInt($(this).attr('id'));
                var x = $(this).position().left;
                var y = $(this).position().top;
                var z = $(this).css('z-index')
                var objtext = [id, x, y, z,'Text']
                hubConnection.invoke("Move", objtext);
            },
        });
        $('#' + id + '').on("click", function () {
            if (tool == 4) {
                var $this = $(this);
                $this.closest('.nonedittext').fadeOut('slow', function () {
                    var id = $(this).attr('id');
                    $(this).remove();
                    var objtext = [id,'Text']
                    hubConnection.invoke("RemoveElem", objtext);
                });
            }
            else if (tool == 2) {
                var text = $(this).html();
                var buf = prompt('Enter your text', text);
                text = buf == null ? text : buf;
                var id = $(this).attr('id');
                var z = GetHighestIndex()+1;
                var objtext = [parseInt(id), text,z];
                hubConnection.invoke("ChangeText", objtext);
            }
            else {
                var z = GetHighestIndex();
                $(this).css('z-index', z+1)
            }
        });
        $('#' + id + '').on('dragstart', function () {
            var z = GetHighestIndex();
            $(this).css('z-index', z + 1)
        });
    }


    $('#btn-hand').click(function () {
        
        tool = 0;
        console.log(tool);
    });
    $('#btn-addNote').click(function () {
        tool = 1;
        console.log(tool);
    });
    $('#btn-text').click(function () {
        tool = 2;
        console.log(tool);
    });    
    $('#btn-pen').click(function () {
        tool = 3;
        console.log(tool);
    });
    $('#btn-remove').click(function () {
        tool = 4;
        console.log(tool);
    });

    $('#board').on('click', function (b) {
        if (flag) {
            hubConnection.invoke("Init", null);
            flag = false;
        }
        console.log(b.target.id);
        if (b.target.id == "board") {
            switch (tool) {
                case 1: 
                    var z = GetHighestIndex();
                    var id = getId();
                    var post =
                    {
                        El: id,
                        X: b.pageX,
                        Y: b.pageY,
                        Z: z,
                        CurrentText: "",
                    }
                    hubConnection.invoke("CreatePost", post);
                    break;
                case 2:
                    var text = '';
                    text = prompt('Enter your text', text);
                    if (text == null) {
                        return;
                    }
                    var z = GetHighestIndex();
                    var id = getId();
                    var objtext =
                    {
                        El: id,
                        X: b.pageX,
                        Y: b.pageY,
                        Z: z,
                        CurrentText: text,
                    }
                    hubConnection.invoke("CreateText", objtext);
                    break;
                case 3:
                    break;
            }
        }
    });

    hubConnection.on("Move", function (data) {
        $('#' + data[0] + '').css('left', data[1]);
        $('#' + data[0] + '').css('top', data[2]);
        $('#' + data[0] + '').css('z-index', data[3]);
        console.log(data);
    });

    hubConnection.on("CreateText", function (data) {
        console.log(data);
        Createtext(data.x, data.y, data.currentText, data.z, data.el)
    });

    hubConnection.on("ChangeText", function (data) {
        $('#' + data[0] + '').html(data[1]);
        $('#' + data[0] + '').css('z-index', data[2]);
    });

    hubConnection.on("ChangePost", function (data) {
        console.log(data);
        $('#t_' + data[0] + '').html(data[1]);
    });

    hubConnection.on("CreatePost", function (data) {
        console.log(data);
        Createpost(data.x, data.y, data.z, data.el,data.currentText,data.width,data.height)
    });

    hubConnection.on("ResizePost", function (data) {
        console.log(data);
        $('#t_' + data[0] + '').width(data[1]).height(data[2]);
    });

    hubConnection.on("RemoveElem", function (data) {
        console.log('Remove'+data);
        $('#' + data[0] + '').remove();
    });
})(jQuery);
