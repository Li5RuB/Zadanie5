var tool = 0;
var flag = true;
var canvas, points, line, countCanvas = 0, editableObjects = [];
const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("/board")
    .build();
var drawGame = {
    isDrawing: false,
    startX: 0,
    startY: 0
};
function GetHighestIndex() {
    var highest_index = 0;
    var elements = document.getElementsByTagName("*");
    for (var i = 0; i < elements.length - 1; i++) {
        if (parseInt(elements[i].style.zIndex) > highest_index && elements[i].id != "") {
            console.log(elements[i].id);
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


async function start() {

    await hubConnection.start();
    hubConnection.invoke("Init", null);
    
};

(function ($) {


    start();

    var $board = $('#board');


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
                    var id = parseInt($(this).attr('id'));
                    var objtext = [id,'Post']
                    hubConnection.invoke("RemoveElem", objtext);
                });
            }
            else {
                var z = GetHighestIndex();
                $(this).css('z-index', z + 2)
                var id = parseInt($(this).attr('id'));
                var x = $(this).position().left;
                var y = $(this).position().top;
                var z = $(this).css('z-index')
                var objtext = [id, x, y, z, 'Post']
                hubConnection.invoke("Move", objtext);
            }
        });
        $('#' + id + '').on('dragstart', function () {
            var z = GetHighestIndex();
            $(this).css('z-index', z + 2)
            var id = parseInt($(this).attr('id'));
            var x = $(this).position().left;
            var y = $(this).position().top;
            var z = $(this).css('z-index')
            var objtext = [id, x, y, z, 'Post']
            hubConnection.invoke("Move", objtext);
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
                $(this).css('z-index', z + 1)
                var id = parseInt($(this).attr('id'));
                var x = $(this).position().left;
                var y = $(this).position().top;
                var z = $(this).css('z-index')
                var objtext = [id, x, y, z, 'Text']
                hubConnection.invoke("Move", objtext);
            }
        });
        $('#' + id + '').on('dragstart', function () {
            var z = GetHighestIndex();
            $(this).css('z-index', z + 1)
            var id = parseInt($(this).attr('id'));
            var x = $(this).position().left;
            var y = $(this).position().top;
            var z = $(this).css('z-index')
            var objtext = [id, x, y, z, 'Text']
            hubConnection.invoke("Move", objtext);
        });
    }

    function mouseup(e) {
        
        if (tool == 3) {
            drawGame.isDrawing = false;
            ResizeCanvas(canvas.id, points.left - 1, points.top - 1, points.height + 2, points.width + 2);
            hubConnection.invoke("ResizeCanvas", canvas.id, points.left - 1, points.top - 1, points.height + 2, points.width + 2)
            canvas = null;
        }
        drawGame.isDrawing == false;
        console.log(drawGame.isDrawing)
    }

    function mousemove(e) {
        if (drawGame.isDrawing) {
            var mouseX = e.pageX - board.offsetLeft;
            var mouseY = e.pageY - board.offsetTop;
            if (!(mouseX == drawGame.startX &&
                mouseY == drawGame.startY)) {
                DrawLine(canvas, drawGame.startX, drawGame.startY, mouseX, mouseY, 2);
                hubConnection.invoke("SendLineValues", line, canvas.id).catch(function (err) {
                    return console.error(err.toString());
                });
                line.startX = drawGame.startX;
                line.startY = drawGame.startY;
                line.endX = mouseX;
                line.endY = mouseY;
                if (mouseX < points.left) {
                    points.width += points.left - mouseX;
                    points.left = mouseX;
                }

                if (mouseY < points.top) {
                    points.height += points.top - mouseY;
                    points.top = mouseY;
                }

                if (mouseX > points.left + points.width) points.width = mouseX - points.left;
                if (mouseY > points.top + points.height) points.height = mouseY - points.top;
                drawGame.startX = mouseX;
                drawGame.startY = mouseY;
            }
        }
    }

    function DrawLine(canvas, x1, y1, x2, y2) {
        var context = canvas.getContext('2d');
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineWidth = 2;
        context.strokeStyle = "black";
        context.stroke();
    }

    function CreateCanvas(id, height, width) {
        let canvas = document.createElement('canvas');
        canvas.style.position = "absolute";
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.zIndex = "5";
        canvas.id = `${id}`;
        canvas.style.background = 'transparent';
        canvas.height = height;
        canvas.width = width;
        return canvas;
    }

    function ResizeCanvas(id, left, top, height, width) {
        var canvas = document.getElementById(id), context = canvas.getContext('2d');
        var imageData = context.getImageData(left, top, width, height);
        canvas.height = height;
        canvas.width = width;
        context.putImageData(imageData, 0, 0);
        canvas.style.left = `${left}px`;
        canvas.style.top = `${top}px`;
    }

    function Chose() {
        $('#0').attr('fill', 'currentColor')
        $('#1').attr('fill', 'currentColor')
        $('#2').attr('fill', 'currentColor')
        $('#3').attr('fill', 'currentColor')
        $('#4').attr('fill', 'currentColor')
    }
    $('#btn-hand').click(function () {
        
        tool = 0;
        Chose();
        $('#0').attr('fill', 'red')
        console.log(tool);
    });
    $('#btn-addNote').click(function () {
        tool = 1;
        Chose();
        $('#1').attr('fill', 'red')
        console.log(tool);
    });
    $('#btn-text').click(function () {
        tool = 2;
        Chose();
        $('#2').attr('fill', 'red')
        console.log(tool);
    });    
    $('#btn-pen').click(function () {
        tool = 3;
        Chose();
        $('#3').attr('fill', 'red')
        console.log(tool);
    });
    $('#btn-remove').click(function () {
        tool = 4;
        Chose();
        $('#4').attr('fill', 'red')
        console.log(tool);
    });


    $('#board').on('mousedown', function (b) {
        let mouseX = b.pageX - this.offsetLeft;
        let mouseY = b.pageY - this.offsetTop;
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
                    line = {
                        startX: 0,
                        startY: 0,
                        endX: 0,
                        endY: 0
                    }

                    drawGame.startX = mouseX;
                    drawGame.startY = mouseY;

                    points = {
                        left: drawGame.startX,
                        top: drawGame.startY,
                        height: 1,
                        width: 1
                    }

                    drawGame.isDrawing = true;
                    var id = getId()
                    CreateFuleCanvas(id);
                    hubConnection.invoke("SendSignalCreateCanvas", id).catch(function (err) {
                        return console.error(err.toString());
                    });
                    break;
            }
        }
    });

    function CreateFuleCanvas(id) {
        canvas = CreateCanvas(id, board.offsetHeight, board.offsetWidth);
        canvas.addEventListener("mousemove", mousemove, false);
        canvas.addEventListener("mouseup", mouseup, false);
        canvas.addEventListener("click", EraseObject, false);
        $(canvas).draggable({
            drag: function () {
                if (tool==3) {
                    return false;
                }
            },
            stop: function () {
                var id = parseInt($(this).attr('id'));
                var x = $(this).position().left;
                var y = $(this).position().top;
                var z = $(this).css('z-index')
                var objtext = [id, x, y, z, 'Canvas']
                hubConnection.invoke("Move", objtext);
            },
        });
        $(canvas).on('dragstart', function () {
            var z = GetHighestIndex();
            $(this).css('z-index', z + 2)
            var id = parseInt($(this).attr('id'));
            var x = $(this).position().left;
            var y = $(this).position().top;
            var z = $(this).css('z-index')
            var objtext = [id, x, y, z, 'Canvas']
            hubConnection.invoke("Move", objtext);
        });

        board.appendChild(canvas);
    }

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

    hubConnection.on("ReceiveLine", function (line, id) {
        DrawLine(document.getElementById(`${id}`), line.startX, line.startY, line.endX, line.endY);
    });

    hubConnection.on("ReceiveSignalCreateCanvas", function (id) {
        CreateFuleCanvas(id)
    });

    hubConnection.on("ReceiveResizeCanvas", function (id,l,t,h,w) {
        ResizeCanvas(id,l,t,h,w)
    });

    function EraseObject(e) {
        if (tool == 4) {
            this.remove();
            var id = this.id;
            var objtext = [id, 'Canvas']
            hubConnection.invoke("RemoveElem", objtext);
        } else {
            var z = GetHighestIndex();
            $(this).css('z-index', z + 1)
            var id = parseInt($(this).attr('id'));
            var x = $(this).position().left;
            var y = $(this).position().top;
            var z = $(this).css('z-index')
            var objtext = [id, x, y, z, 'Canvas']
            hubConnection.invoke("Move", objtext);
        }
    }
})(jQuery);
