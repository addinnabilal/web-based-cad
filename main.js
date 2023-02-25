var current = {
    shapes : [],    // {vertex: [{x: 0, y: 0}, {x: 0, y: 0}], color: [#000000, #000000], theta: 250} (Length of vertex and color is according to the shape)
    isDrawing : false,   
    isCreating: false, 
    isDrawingPolygon : false,
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

main();

// Tools activation onclick
document.querySelectorAll("button").forEach(function(element) {
    element.addEventListener("click", function() {
        document.getElementById("canvas").style.cursor = "default";
        current.isCreating = false;
        if (!this.classList.contains("active")) {
            switch (this.id) {
                case "line-shape":
                case "square-shape":
                case "rectangle-shape":
                case "polygon-shape":
                    current.isCreating = true;
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
                case "delete-polygon-vertex-tool":
                    drawShapeVertex(current.selectedShapeId)
                    document.getElementById("canvas").style.cursor = "pointer";
                    break;
                case "add-polygon-vertex-tool":
                    drawShapeVertex(current.selectedShapeId)
                    document.getElementById("canvas").style.cursor = "crosshair";
                    break;
                default:
                    break;
            }
            disableAllButtons();
        }
        current.isDrawing = false;

        this.classList.toggle("active");

        if (!document.getElementById("move-tool").classList.contains("active")
                && !document.getElementById("delete-polygon-vertex-tool").classList.contains("active")
                && !document.getElementById("add-polygon-vertex-tool").classList.contains("active")) {
            document.getElementById("rotation_angle").disabled = true;
            document.getElementById("add-polygon-vertex-tool").disabled = true;
            document.getElementById("delete-polygon-vertex-tool").disabled = true;
            document.getElementById("animate-tool").disabled = true;
        }

        if (!document.getElementById("resize-tool").classList.contains("active")
                && !document.getElementById("color-tool").classList.contains("active")
                && !document.getElementById("delete-polygon-vertex-tool").classList.contains("active")
                && !document.getElementById("add-polygon-vertex-tool").classList.contains("active")
                && !document.getElementById("animate-tool").classList.contains("active")) {
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
        if (document.getElementById("polygon-shape").classList.contains("active")) {
            if (!current.isDrawingPolygon) {
                current.shapes.push({type: "polygon", vertex: [current.start, {x: e.offsetX, y: e.offsetY}], color: [document.getElementById("color").value, document.getElementById("color").value], theta: 0});
                current.isDrawingPolygon = true;
            } else {
                current.shapes[current.shapes.length-1].vertex.push({x: e.offsetX, y: e.offsetY})
                current.shapes[current.shapes.length-1].color.push(document.getElementById("color").value)
                drawPolygon(current.shapes[current.shapes.length-1])
            }
        } else {
            current.isDrawing = false;
            if (document.getElementById("line-shape").classList.contains("active")) {
                current.shapes.push({type: "line", vertex: [current.start, {x: e.offsetX, y: e.offsetY}], color: [document.getElementById("color").value, document.getElementById("color").value], theta: 0});
            } else if (document.getElementById("square-shape").classList.contains("active")) {
                const start = current.start;
                const end = {x: e.offsetX, y: e.offsetY};            
                current.shapes.push({
                    type: "square", 
                    vertex: calculateSquareVertices(start, end), 
                    color: [document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value],
                    theta: 0
                });
                current.isDrawing = false;
            } else if (document.getElementById("rectangle-shape").classList.contains("active")) {
                current.shapes.push({
                    type: "rectangle", 
                    vertex: [
                        current.start, 
                        {x: e.offsetX, y: current.start.y},
                        {x: e.offsetX, y: e.offsetY},
                        {x: current.start.x, y: e.offsetY}
                    ], 
                    color: [document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value],
                    theta: 0
                });
            } 
        }

    } else if (current.isCreating) {
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
                vertex: [current.start, current.start, current.start, current.start],
                color: [document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value],
            }
            drawRectangle(square);
        } else if (document.getElementById("rectangle-shape").classList.contains("active")) {
            current.isDrawing = true;
            const rectangle = {
                vertex: [current.start, current.start, current.start, current.start],
                color: [document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value],
            }
            drawRectangle(rectangle);
        } else if (document.getElementById("polygon-shape").classList.contains("active")) {
            current.isDrawing = true;
            current.isDrawingPolygon = true;
            const polygon = {
                type: "polygon",
                vertex: [current.start, current.start],
                color: [document.getElementById("color").value, document.getElementById("color").value],
                theta: 0
            }
            current.shapes.push(polygon)
            drawPolygon(polygon)
        }
    } else if (document.getElementById("color-tool").classList.contains("active")) {
        if (getVertexInsideMouse(e) !== undefined) {
            const selected = getVertexInsideMouse(e);
            current.shapes[selected.shapeId].color[selected.vertexId] = document.getElementById("color").value;
        }
        refreshCanvas();
        drawAllVertex(true);
    } else if (document.getElementById("delete-polygon-vertex-tool").classList.contains("active")) {
        if (getVertexInsideMouse(e) !== undefined) {
            const selected = getVertexInsideMouse(e);
            if ( current.shapes[selected.shapeId].vertex.length >3) {
                current.shapes[selected.shapeId].vertex.splice([selected.vertexId], 1)
            }
        } 
        refreshCanvas();
        drawShapeVertex(current.selectedShapeId);
    } else if (document.getElementById("add-polygon-vertex-tool").classList.contains("active")) {
        current.shapes[current.selectedShapeId].vertex.push({x: e.offsetX, y: e.offsetY})
        current.shapes[current.selectedShapeId].color.push(document.getElementById("color").value)
        drawPolygon(current.shapes[current.shapes.length-1])
        refreshCanvas();
        drawShapeVertex(current.selectedShapeId)
    // select shape
    } else {
        current.selectedShapeId = getShapeInsideMouse(e);
    }
});

document.getElementById("canvas").addEventListener("mousedown", function(e) {
    current.isDragging = true;
    if (document.getElementById("move-tool").classList.contains("active")) {
        current.selectedShapeId = getShapeInsideMouse(e);
        if (current.selectedShapeId !== null && current.selectedShapeId !== undefined) {
            document.getElementById("rotation_angle").disabled = false;
            document.getElementById("animate-tool").disabled = false;
            if (current.shapes[current.selectedShapeId].type === "polygon") {
                document.getElementById("add-polygon-vertex-tool").disabled = false;
                document.getElementById("delete-polygon-vertex-tool").disabled = false;
            }
        }
        else {
            document.getElementById("rotation_angle").disabled = true;
            document.getElementById("add-polygon-vertex-tool").disabled = true;
            document.getElementById("delete-polygon-vertex-tool").disabled = true;
            document.getElementById("animate-tool").disabled = true;

        }
        drawShapeVertex(current.selectedShapeId)
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
    if (document.getElementById("move-tool").classList.contains("active")) {
        drawShapeVertex(current.selectedShapeId)
    }
    current.isDragging = false;
});

document.getElementById("canvas").addEventListener("contextmenu", function(e) {
    e.preventDefault()
    if  (document.getElementById("polygon-shape").classList.contains("active")) {
        if (current.shapes[current.shapes.length-1].vertex.length <= 2) {
            current.shapes.pop();
        }
        current.isDrawingPolygon = false;
        drawPolygon(current.shapes[current.shapes.length-1])
        current.isDrawing = false
        refreshCanvas();
    }
})

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
            const start = current.start;
            const end = {x: e.offsetX, y: e.offsetY};
            const square = {
                vertex: calculateSquareVertices(start, end),
                color: [document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value]
            }
            drawRectangle(square);
        } else if (document.getElementById("rectangle-shape").classList.contains("active")) {
            refreshCanvas();
            const rectangle = {
                vertex: [
                    current.start, 
                    {x: e.offsetX, y: current.start.y},
                    {x: e.offsetX, y: e.offsetY},
                    {x: current.start.x, y: e.offsetY}
                ],
                color: [document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value, document.getElementById("color").value]
            }
            drawRectangle(rectangle);
        } else if (document.getElementById("polygon-shape").classList.contains("active") && current.isDrawingPolygon) {
            refreshCanvas();
            const currentShapeIndex = current.shapes.length-1
            var polygon = {
                vertex : current.shapes[currentShapeIndex].vertex,
                color: current.shapes[currentShapeIndex].color,
            }
            
            const polygonSize = polygon.vertex.length
            // const newVertex = {
            //     vertex: {x: e.offsetX, y: e.offsetY},
            //     color: document.getElementById("color").value
            // }
            polygon.vertex[polygonSize-1] = {x: e.offsetX, y: e.offsetY}
            polygon.color[polygonSize-1] = document.getElementById("color").value
            drawPolygon(polygon)
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
            drawShapeVertex(current.selectedShapeId)
        } else if (document.getElementById("resize-tool").classList.contains("active")) {
            if (current.selectedShapeId !== undefined && current.selectedVertexId !== undefined) {
                if (current.shapes[current.selectedShapeId].type === "square") {
                    const delta = Math.abs(e.movementX) > Math.abs(e.movementY) ? e.movementX : e.movementY;
                    if (current.selectedVertexId % 2 === 1) {
                        current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].x += delta;
                        current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].y -= delta;
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId+1)%4].x += delta;
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId-1+4)%4].y -= delta;
                    } else {
                        current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].x += delta;
                        current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].y += delta;
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId+1)%4].y += delta;
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId-1+4)%4].x += delta;
                    }
                } else if (current.shapes[current.selectedShapeId].type === "rectangle") {
                    // rotate back to the original position
                    const theta = current.shapes[current.selectedShapeId].theta;
                    const cx = current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId+2)%4].x
                    const cy = current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId+2)%4].y
                    const center = {x: cx, y: cy}
                    onChangeRotationAngle(current.selectedShapeId, 0);
                    current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].x += e.movementX;
                    current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].y += e.movementY;
                    // calculate the other vertex accounting for the rotation
                    // const theta = current.shapes[current.selectedShapeId].theta;
                    // const radian = theta * Math.PI / 180;
                    


                    if (current.selectedVertexId % 2 === 1) {
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId+1)%4].x += e.movementX;
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId-1+4)%4].y += e.movementY;
                    } else {
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId+1)%4].y += e.movementY;
                        current.shapes[current.selectedShapeId].vertex[(current.selectedVertexId-1+4)%4].x += e.movementX;
                    }

                    onChangeRotationAngle(current.selectedShapeId, theta);
                } else {
                    current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].x += e.movementX;
                    current.shapes[current.selectedShapeId].vertex[current.selectedVertexId].y += e.movementY;
                }
                refreshCanvas();
                drawAllVertex();
            }
        }
    }
});

document.getElementById("rotation_angle").addEventListener("mousemove", function(e) {
    if (current.selectedShapeId !== null && current.selectedShapeId !== undefined) {
        if (current.shapes[current.selectedShapeId].theta !== e.target.value) {
            onChangeRotationAngle(current.selectedShapeId, e.target.value)
            refreshCanvas();
        }
        drawShapeVertex(current.selectedShapeId)
    }
})


document.getElementById("save").addEventListener("click", function(e) {
    const data = JSON.stringify(current.shapes);
    const a = document.createElement("a");
    const file = new Blob([data], {type: "text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = "shapes.json";
    a.click();
});

document.getElementById("load").addEventListener("click", function(e) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = function() {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            current = {
                shapes : JSON.parse(e.target.result),
                isDrawing : false,
                isCreating: false,
                isDrawingPolygon : false,
                isDragging : false,
                selectedShapeId : null,
                selectedVertexId : null,
                start : {x: 0, y: 0}
            }
            refreshCanvas();
        }
        reader.readAsText(file);
    }
    input.click();
});

document.getElementById("animate-tool").addEventListener("click", function(e) {
    if (current.selectedShapeId !== null && current.selectedShapeId !== undefined) {
        animate(current.selectedShapeId)

    }
});
