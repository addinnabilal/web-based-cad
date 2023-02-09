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


main();

// Initialize the GL context
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

// Functions
function convertToWebGLCoordinate(x,y) {
    const glX = (x / canvas.offsetWidth) * 2 - 1;
    const glY = 1 - (y / canvas.clientHeight) * 2;
    return {x: glX, y: glY};
}
function hexToRGBColor(hex) {
    var bigint = parseInt(hex.replace("#", ""), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return {r: r / 255, g: g / 255, b: b / 255};
}
function disableAllButtons() {
    document.querySelectorAll(".active").forEach(function(element) {
        element.classList.remove("active");
    });
}
function refreshCanvas() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    current.shapes.forEach(function(shape) {
        if (shape.type === "line") {
            drawLine(shape);
        } else if (shape.type === "square") {
            drawSquare(shape);
        } else if (shape.type === "rectangle") {
            drawRectangle(shape);
        }
    });
}
function getVertexInsideMouse(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    for (var i = 0; i < current.shapes.length; i++) {
        for (var j = 0; j < current.shapes[i].vertex.length; j++) {
            if (Math.abs(x - current.shapes[i].vertex[j].x) <= 5 &&
                Math.abs(y - current.shapes[i].vertex[j].y) <= 5) {
                return {shapeId: i, vertexId: j};
            }
        }
    }
}
function getShapeInsideMouse(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    current.start = {x: x, y: y};
    for (var i = 0; i < current.shapes.length; i++) {
        // check if the point is inside a line if the shape is a line
        if (current.shapes[i].vertex.length === 2) {
            const deltaX = current.shapes[i].vertex[1].x - current.shapes[i].vertex[0].x;
            const deltaY = current.shapes[i].vertex[1].y - current.shapes[i].vertex[0].y;
            const slope = deltaY / deltaX;
            const yIntercept = current.shapes[i].vertex[0].y - slope * current.shapes[i].vertex[0].x;
            const distance = Math.abs(y - slope * x - yIntercept) /
                            Math.sqrt(slope * slope + 1);
            if (distance <= 10) {
                return i;
            }
        }
    }
}
// Draw functions
function drawVertex(vertex, color = "#000000") {
    const RGB = hexToRGBColor(color);
    const glVertex = convertToWebGLCoordinate(vertex.x, vertex.y);
    const vertexArray = new Float32Array([glVertex.x, glVertex.y, 0, RGB.r, RGB.g, RGB.b]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        positionAttributeLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0);
    gl.uniform1f(pointSizeUniformLocation, 10.0);
    gl.vertexAttribPointer(
        colorAttribLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.POINTS, 0, 1);
}
function drawAllVertex(colored = false) {
    refreshCanvas();
    current.shapes.forEach(function(shape) {
        for (var i = 0; i < shape.vertex.length; i++) {
            if (colored) {
                drawVertex(shape.vertex[i], shape.color[i]);
            } else {
                drawVertex(shape.vertex[i]);
            }
        }
    });
}
function drawLine(line) {
    const start = convertToWebGLCoordinate(line.vertex[0].x, line.vertex[0].y);
    const end = convertToWebGLCoordinate(line.vertex[1].x, line.vertex[1].y);
    const color1 = hexToRGBColor(line.color[0]);
    const color2 = hexToRGBColor(line.color[1]);
    const vertices = new Float32Array([
        start.x, start.y, 0, color1.r, color1.g, color1.b,
        end.x, end.y, 0, color2.r, color2.g, color2.b
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(
        colorAttribLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.LINES, 0, 2);
}

function drawSquare(square) {
    const start = convertToWebGLCoordinate(square.vertex[0].x, square.vertex[0].y);
    const end = convertToWebGLCoordinate(square.vertex[1].x, square.vertex[1].y);
    const color1 = hexToRGBColor(square.color[0]);
    const color2 = hexToRGBColor(square.color[1]);
    // calculate symmetry
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    const new_end = {x: start.x + delta, y: start.y + delta};

    const vertices = new Float32Array([
        start.x, start.y, 0, color1.r, color1.g, color1.b,
        new_end.x, start.y, 0, color1.r, color1.g, color1.b,
        new_end.x, new_end.y, 0, color2.r, color2.g, color2.b,
        start.x, new_end.y, 0, color2.r, color2.g, color2.b,
        start.x, start.y, 0, color1.r, color1.g, color1.b
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(
        colorAttribLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.LINE_STRIP, 0, 5);
}

function drawRectangle(rectangle) {
    const start = convertToWebGLCoordinate(rectangle.vertex[0].x, rectangle.vertex[0].y);
    const end = convertToWebGLCoordinate(rectangle.vertex[1].x, rectangle.vertex[1].y);
    const color1 = hexToRGBColor(rectangle.color[0]);
    const color2 = hexToRGBColor(rectangle.color[1]);
    const vertices = new Float32Array([
        start.x, start.y, 0, color1.r, color1.g, color1.b,
        end.x, start.y, 0, color1.r, color1.g, color1.b,
        end.x, end.y, 0, color2.r, color2.g, color2.b,
        start.x, end.y, 0, color2.r, color2.g, color2.b,
        start.x, start.y, 0, color1.r, color1.g, color1.b
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(
        colorAttribLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.LINE_STRIP, 0, 5);
}

// Tools activation onclick
document.querySelectorAll("button").forEach(function(element) {
    element.addEventListener("click", function() {
        document.getElementById("canvas").style.cursor = "default";
        if (!this.classList.contains("active")) {
            switch (this.id) {
                case "line-shape":
                case "square-shape":
                case "rectangle-shape":
                case "polygon-shape":
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
document.getElementById("canvas-color").addEventListener("change", function() {
    document.getElementById("canvas").style.backgroundColor = this.value;
});
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
            current.shapes.push({type: "line", vertex: [current.start, {x: e.offsetX, y: e.offsetY}], color: [document.getElementById("color").value, document.getElementById("color").value]});
            current.isDrawing = false;
            return;
        } else if (document.getElementById("square-shape").classList.contains("active")) {
            current.shapes.push({type: "square", vertex: [current.start, {x: e.offsetX, y: e.offsetY}], color: [document.getElementById("color").value, document.getElementById("color").value]});
            current.isDrawing = false;
            return;
        } else if (document.getElementById("rectangle-shape").classList.contains("active")) {
            current.shapes.push({type: "rectangle", vertex: [current.start, {x: e.offsetX, y: e.offsetY}], color: [document.getElementById("color").value, document.getElementById("color").value]});
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
        } else if (document.getElementById("square-shape").classList.contains("active")) {
            current.isDrawing = true;
            const square = {
                vertex: [current.start, current.start],
                color: [document.getElementById("color").value, document.getElementById("color").value]
            }
            drawSquare(square);
        } else if (document.getElementById("rectangle-shape").classList.contains("active")) {
            current.isDrawing = true;
            const rectangle = {
                vertex: [current.start, current.start],
                color: [document.getElementById("color").value, document.getElementById("color").value]
            }
            drawRectangle(rectangle);
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
            refreshCanvas();
            const line = {
                vertex: [current.start, {x: e.offsetX, y: e.offsetY}],
                color: [document.getElementById("color").value, document.getElementById("color").value]
            }
            drawLine(line);
        } else if (document.getElementById("square-shape").classList.contains("active")) {
            refreshCanvas();
            const square = {
                vertex: [current.start, {x: e.offsetX, y: e.offsetY}],
                color: [document.getElementById("color").value, document.getElementById("color").value]
            }
            drawSquare(square);
        } else if (document.getElementById("rectangle-shape").classList.contains("active")) {
            refreshCanvas();
            const rectangle = {
                vertex: [current.start, {x: e.offsetX, y: e.offsetY}],
                color: [document.getElementById("color").value, document.getElementById("color").value]
            }
            drawRectangle(rectangle);
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