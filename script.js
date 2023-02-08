const current = {
    canvas : document.getElementById("canvas"),
    gl : document.getElementById("canvas").getContext("2d"),
    shapes : {
        line: [],
        square: [],
        rectangle: [],
        polygon: [],
    },
    isDrawing : false,
    start : {x: 0, y: 0},
}
main();

// Initialize the GL context
function main() {
    // Only continue if WebGL is available and working
    if (current.gl === null) {
        alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function disableAllButtons() {
    document.querySelectorAll(".active").forEach(function(element) {
        element.classList.remove("active");
    });
}

function refreshCanvas() {
    current.gl.clearRect(0, 0, current.canvas.width, current.canvas.height);
    current.shapes.line.forEach(function(line) {
        drawLine(line);
    });
}

function drawLine(line) {
    current.gl.beginPath();
    current.gl.moveTo(line.start.x, line.start.y);
    current.gl.lineTo(line.end.x, line.end.y);
    current.gl.strokeStyle = line.color;
    current.gl.stroke();
}

// Tools activation onclick
document.getElementById("line-shape").addEventListener("click", function() {
    if (!this.classList.contains("active")) {
        disableAllButtons();
    }
    current.isDrawing = false;
    this.classList.toggle("active");
});

document.getElementById("clear").addEventListener("click", function() {
    disableAllButtons();
    current.shapes = {
        line: [],
        square: [],
        rectangle: [],
        polygon: [],
    },
    current.gl.clearRect(0, 0, current.canvas.width, current.canvas.height);
});


// Canvas click event based on active tools
document.getElementById("canvas").addEventListener("click", function(e) {
    if (current.isDrawing) {
        current.shapes.line.push({start: current.start, end: {x: e.offsetX, y: e.offsetY}, color: document.getElementById("color").value});
        current.isDrawing = false;
        return;
    }
    current.isDrawing = true;
    current.start = {x: e.offsetX, y: e.offsetY}
    if (document.getElementById("line-shape").classList.contains("active")) {
        const line = {
            start: current.start,
            end: current.start,
            color: document.getElementById("color").value
        }
        drawLine(line);
    }
});

document.getElementById("canvas").addEventListener("mousemove", function(e) {
    if (!current.isDrawing) return;
    if (document.getElementById("line-shape").classList.contains("active")) {
        if (document.getElementById("line-shape").classList.contains("active")) {
            refreshCanvas();
            const line = {
                start: current.start,
                end: {x: e.offsetX, y: e.offsetY},
                color: document.getElementById("color").value
            }
            drawLine(line);
        }
    }
});