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
                document.getElementById("rotation_angle").value = current.shapes[i].theta
                return i;
            }
        } else { // check if the point is inside a polygon
            // var j = current.shapes[i].vertex.length - 1;
            // var inside = false;
            // for (var k = 0; k < current.shapes[i].vertex.length; k++) {
            //     if (current.shapes[i].vertex[k].y < y && current.shapes[i].vertex[j].y >= y ||
            //         current.shapes[i].vertex[j].y < y && current.shapes[i].vertex[k].y >= y) {
            //         if (current.shapes[i].vertex[k].x + (y - current.shapes[i].vertex[k].y) /
            //             (current.shapes[i].vertex[j].y - current.shapes[i].vertex[k].y) *
            //             (current.shapes[i].vertex[j].x - current.shapes[i].vertex[k].x) < x) {
            //             inside = !inside;
            //         }
            //     }
            //     j = k;
            // }
            // if (inside) {
            //     document.getElementById("rotation_angle").value = current.shapes[i].theta
            //     return i;
            // }
            const shape = current.shapes[i]
            var inside = false;
            var k = 0, j = shape.vertex.length - 1;
            for (k, j; k < shape.vertex.length; j = k++) {
                if ( (shape.vertex[k].y > y) != (shape.vertex[j].y > y) &&
                        x < (shape.vertex[j].x - shape.vertex[k].x) * (y - shape.vertex[k].y) / (shape.vertex[j].y - shape.vertex[k].y) + shape.vertex[k].x ) {
                    inside = !inside;
                }
            }
            if (inside) {
                document.getElementById("rotation_angle").value = current.shapes[i].theta
                return i;
            }
        }
    }
}
function calculateSquareVertices(start, end) {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    let newEnd = end;

    const absDeltaX = deltaX < 0 ? -1*deltaX : deltaX;
    const absDeltaY = deltaY < 0 ? -1*deltaY : deltaY;
    if (absDeltaX > absDeltaY) {
        newEnd.y = deltaY > 0 ? start.y + absDeltaX : start.y - absDeltaX;
    } else {
        newEnd.x = deltaX > 0 ? start.x + absDeltaY : start.x - absDeltaY;
    }
    return ([
        start,
        {x: newEnd.x, y: start.y},
        newEnd,
        {x: start.x, y: newEnd.y}
    ]);
}

function onChangeRotationAngle(shapeId, newTheta) {
    center = getCenter(shapeId)
    let shape = current.shapes[shapeId]
    let diffTheta = newTheta - shape.theta
    let radian = (Math.PI / 180) * diffTheta
    let cx = center.x
    let cy = center.y
    let cos = Math.cos(radian)
    let sin = Math.sin(radian)

    for (let i=0; i< shape.vertex.length ; i++) {
        x = shape.vertex[i].x - cx
        y = shape.vertex[i].y - cy
        current.shapes[shapeId].vertex[i].x = (cos * x) - (sin * y) + cx
        current.shapes[shapeId].vertex[i].y = (cos * y) + (sin * x) + cy;
    }
    current.shapes[shapeId].theta = newTheta

}

function getCenter(shapeId) {
    shape = current.shapes[shapeId]
    type = shape.type

    if (type == "line" ) {
        x0 = shape.vertex[0].x
        x1 = shape.vertex[1].x
        y0 = shape.vertex[0].y
        y1 = shape.vertex[1].y
        x = (x0 + x1)/2 
        y = (y0 + y1)/2
    } else if (type == "square" || type == "rectangle") {
        minX = shape.vertex[0].x
        maxX = shape.vertex[0].x
        minY = shape.vertex[0].y
        maxY = shape.vertex[0].y
        for (let vertex of shape.vertex) {
            minX = Math.min(minX, vertex.x)
            minY = Math.min(minY, vertex.y)
            maxX = Math.max(maxX, vertex.x)
            maxY = Math.max(maxY, vertex.y)
        }
        x = (minX + maxX) / 2
        y = (minY + maxY) / 2
        
    } else {
        sumX = 0
        sumY = 0
        
        for (let vertex of shape.vertex) {
            sumX += vertex.x
            sumY += vertex.y
        }
        x = sumX / shape.vertex.length
        y = sumY / shape.vertex.length
    }

    return {x: x, y: y}
}

function animate(shapeId) {
    let oldTheta = current.shapes[shapeId].theta;
    let newTheta = oldTheta
    let intervalId = setInterval(function() {

        newTheta += 5;

        if (newTheta >= 360) {
            newTheta -= 360;
        }
        onChangeRotationAngle(shapeId, newTheta);
        refreshCanvas();

        if (newTheta === oldTheta) {
            clearInterval(intervalId);
        }
    }, 20); // run every 0.02 seconds (20 milliseconds)
}