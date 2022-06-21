let tilts = document.getElementById('tilts');

function dir(dir) {
    console.log(dir);
    let tilt;
    switch (dir) {
        case "up": tilt = "w"; break;
        case "down": tilt = "s"; break;
        case "left": tilt = "a"; break;
        case "right": tilt = "d"; break;
    }

    let val = tilts.value;
    if (val.length < 12) {
        tilts.value = val + tilt;
        tilts.dispatchEvent(new Event('input'));
    }
}

document.body.onkeyup = function (e) {
    switch (e.which) {
        case 37: dir('left'); break;
        case 39: dir('right'); break;
        case 38: dir('up'); break;
        case 40: dir('down'); break;
    }
};

let arrows = document.getElementsByClassName('dpad');
for (var i = 0; i < arrows.length; i++) {
    arrows[i].addEventListener('click', function (e) {
        let input = e.target.id;
        dir(input);
    });
}