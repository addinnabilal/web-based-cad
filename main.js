
const current = {
    shapes : [],    // {vertex: [{x: 0, y: 0}, {x: 0, y: 0}], color: [#000000, #000000]} (Length of vertex and color is according to the shape)
    isDrawing : false,
    isDragging : false,
    selectedShapeId : null,
    selectedVertexId : null,
    start : {x: 0, y: 0},
};
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const program = gl.createProgram();
var positionAttributeLocation = null
var colorAttribLocation = null
var pointSizeUniformLocation = null


function main() {
    if (gl === null) {
        alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.shaderSource(vertexShader, `
        attribute vec3 position;
        attribute vec3 color;
        uniform float pointSize;
        varying vec3 vColor;
        void main() {
            vColor = color;
            gl_Position = vec4(position, 1.0);
            gl_PointSize = pointSize;
        }
    `);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    positionAttributeLocation = gl.getAttribLocation(program, "position");
    colorAttribLocation = gl.getAttribLocation(program, "color");
    pointSizeUniformLocation = gl.getUniformLocation(program, "pointSize");
}

main()


// Tools activation onclick
document.querySelectorAll("button").forEach(function(element) {
    element.addEventListener("click", function() {
        document.getElementById("canvas").style.cursor = "default";
        if (!this.classList.contains("active")) {
            switch (this.id) {
                case "line-shape":
                    document.getElementById("canvas").style.cursor = "crosshair";
                    break;
                case "move-tool":
                    document.getElementById("canvas").style.cursor = "move";
                    break;
                case "resize-tool":
                    drawAllVertex();
                    document.getElementById("canvas").style.cursor = "se-resize";
                    break;
                case "color-tool":
                    drawAllVertex(true);
                    document.getElementById("canvas").style.cursor = "pointer";
                    break;
                default:
                    break;
            }
            disableAllButtons();
        }
        current.isDrawing = false;
        this.classList.toggle("active");
        if (!document.getElementById("resize-tool").classList.contains("active") && !document.getElementById("color-tool").classList.contains("active")) {
            refreshCanvas();
        }
    })
});

// change canvas background color
document.getElementById("canvas-color").addEventListener("change", function() {
    document.getElementById("canvas").style.backgroundColor = this.value;
});

// clear canvas
document.getElementById("clear").addEventListener("click", function() {
    disableAllButtons();
    current.shapes = [];
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
});


// Canvas click event based on active tools
document.getElementById("canvas").addEventListener("click", function(e) {
    if (current.isDrawing) {
        if (document.getElementById("line-shape").classList.contains("active")) {
            current.shapes.push({vertex: [current.start, {x: e.offsetX, y: e.offsetY}], color: [document.getElementById("color").value, document.getElementById("color").value]});
            current.isDrawing = false;
            return;
        }
    } else {
        current.start = {x: e.offsetX, y: e.offsetY}
        if (document.getElementById("line-shape").classList.contains("active")) {
            current.isDrawing = true;
            const line = {
                vertex: [current.start, current.start],
                color: [document.getElementById("color").value, document.getElementById("color").value]
            }
            drawLine(line);
        } else if (document.getElementById("color-tool").classList.contains("active")) {
            const selected = getVertexInsideMouse(e);
            if (selected !== undefined) {
                current.shapes[selected.shapeId].color[selected.vertexId] = document.getElementById("color").value;
                refreshCanvas();
            } else {
                // warnain dalem shape
            }
            drawAllVertex(true);
        }
    }
});


// listen to mouse movements
document.getElementById("canvas").addEventListener("mousedown", function(e) {
    current.isDragging = true;
    if (document.getElementById("move-tool").classList.contains("active")) {
        current.selectedShapeId = getShapeInsideMouse(e);
    } else if (document.getElementById("resize-tool").classList.contains("active")) {
        const dragged = getVertexInsideMouse(e);
        if (dragged === undefined) {
            return;
        }
        current.selectedShapeId = dragged.shapeId;
        current.selectedVertexId = dragged.vertexId;
    }
});


document.getElementById("canvas").addEventListener("mouseup", function(e) {
    current.isDragging = false;
});

document.getElementById("canvas").addEventListener("mousemove", function(e) {
    if (current.isDrawing) {
        if (document.getElementById("line-shape").classList.contains("active")) {
            if (document.getElementById("line-shape").classList.contains("active")) {
                refreshCanvas();
                const line = {
                    vertex: [current.start, {x: e.offsetX, y: e.offsetY}],
                    color: [document.getElementById("color").value, document.getElementById("color").value]
                }
                drawLine(line);
            }
        }
    } else if (current.isDragging) {
        if (document.getElementById("move-tool").classList.contains("active")) {
            if (current.selectedShapeId !== undefined) {
                current.shapes[current.selectedShapeId].vertex.forEach(function(vertex) {
                    vertex.x += e.movementX;
                    vertex.y += e.movementY;
                });
            }
            refreshCanvas();
        } else if (document.getElementById("resize-tool").classList.contains("active")) {
            if (current.selectedShapeId !== undefined && current.selectedVertexId !== undefined) {
                current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].x += e.movementX;
                current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].y += e.movementY;
            }
            refreshCanvas();
            drawAllVertex();
        }
    }
});