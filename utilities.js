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
        } else if (shape.type === "polygon") {
            drawPolygon(shape, null);
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
        } else { // check if the point is inside a polygon
            var j = current.shapes[i].vertex.length - 1;
            var inside = false;
            for (var k = 0; k < current.shapes[i].vertex.length; k++) {
                if (current.shapes[i].vertex[k].y < y && current.shapes[i].vertex[j].y >= y ||
                    current.shapes[i].vertex[j].y < y && current.shapes[i].vertex[k].y >= y) {
                    if (current.shapes[i].vertex[k].x + (y - current.shapes[i].vertex[k].y) /
                        (current.shapes[i].vertex[j].y - current.shapes[i].vertex[k].y) *
                        (current.shapes[i].vertex[j].x - current.shapes[i].vertex[k].x) < x) {
                        inside = !inside;
                    }
                }
                j = k;
            }
            if (inside) {
                return i;
            }
        }
    }
}