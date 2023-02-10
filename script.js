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
    let start = {x: square.vertex[0].x, y: square.vertex[0].y};
    let end = {x: square.vertex[1].x, y: square.vertex[1].y};

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    const absDeltaX = deltaX < 0 ? -1*deltaX : deltaX;
    const absDeltaY = deltaY < 0 ? -1*deltaY : deltaY;
    if (absDeltaX > absDeltaY) {
        end.y = deltaY > 0 ? start.y + absDeltaX : start.y - absDeltaX;
    } else {
        end.x = deltaX > 0 ? start.x + absDeltaY : start.x - absDeltaY;
    }

    start = convertToWebGLCoordinate(start.x, start.y);
    end = convertToWebGLCoordinate(end.x, end.y);
    
    const color1 = hexToRGBColor(square.color[0]);
    const color2 = hexToRGBColor(square.color[1]);
    
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

function drawPolygon(oldPolygon, newVertex) {
    var vertices = [];
    var size = oldPolygon.vertex.length

    for (var i=0; i<size;i++) {
        convertedVertex = convertToWebGLCoordinate(oldPolygon.vertex[i].x, oldPolygon.vertex[i].y)
        const color = hexToRGBColor(oldPolygon.color[i]);
        vertices.push(convertedVertex.x, convertedVertex.y, 0, color.r, color.g, color.b)
    }
    if (newVertex) {
        convertedVertex = convertToWebGLCoordinate(newVertex.vertex.x, newVertex.vertex.y)
        const color = hexToRGBColor(newVertex.color)
        vertices.push(convertedVertex.x, convertedVertex.y, 0, color.r, color.g, color.b)
        size++;
    }

    console.log(size);
    console.log(vertices)
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(
        colorAttribLocation, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, size);
}