const fs = require('fs');

// 입력 파일을 읽고 파싱하는 함수
function parseInput(file) {
    const data = fs.readFileSync(file, 'utf8');
    console.log("Input File Content:\n" + data);  // 입력 파일 내용 출력
    const lines = data.trim().split('\n');
    const gridObjects = lines.map(line => {
        const [char, x, y] = line.split(' ');
        return { char, x: parseInt(x), y: parseInt(y) };
    });
    return gridObjects;
}

// 파싱된 입력을 바탕으로 그리드를 만드는 함수
function buildGrid(gridObjects) {
    const grid = {};
    gridObjects.forEach(({ char, x, y }) => {
        if (!grid[y]) { // 행(y)를 먼저 초기화
            grid[y] = {};
        }
        grid[y][x] = char; // 열(x)를 초기화하고 문자 저장
    });
    return grid;
}

// 파이프 연결 정의
const pipeConnections = {
    '═': { 'left': [0, -1], 'right': [0, 1] }, 
    '║': { 'up': [-1, 0], 'down': [1, 0] },
    '╔': { 'right': [0, 1], 'down': [1, 0] },
    '╗': { 'left': [0, -1], 'down': [1, 0] },
    '╚': { 'right': [0, 1], 'up': [-1, 0] },
    '╝': { 'left': [0, -1], 'up': [-1, 0] },
    '╠': { 'up': [-1, 0], 'down': [1, 0], 'right': [0, 1] },
    '╣': { 'up': [-1, 0], 'down': [1, 0], 'left': [0, -1] },
    '╦': { 'down': [1, 0], 'left': [0, -1], 'right': [0, 1] },
    '╩': { 'up': [-1, 0], 'left': [0, -1], 'right': [0, 1] },
    '*': { 'up': [-1, 0], 'down': [1, 0], 'left': [0, -1], 'right': [0, 1] },
};

// 문자가 싱크인지 확인하는 함수
function isSink(char) {
    return /^[A-Z]$/.test(char);
}

// BFS를 사용하여 연결된 싱크를 찾는 함수
function findConnectedSinks(grid, sourceX, sourceY) {
    const queue = [[sourceX, sourceY]];
    const visited = new Set();
    const connectedSinks = new Set();

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        console.log(`큐에서 꺼낸 좌표: (${x}, ${y})`); // 큐에서 꺼낸 좌표를 출력
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);

        const char = grid[y][x];
        console.log(`셀 방문 중 (${x}, ${y}), 문자: ${char}`);
        if (isSink(char)) {
            connectedSinks.add(char);
        }

        const directions = pipeConnections[char];
        for (let direction in directions) {
            const [dx, dy] = directions[direction];
            const newX = x + dx;
            const newY = y + dy;
            if (grid[newY] && grid[newY][newX] && !visited.has(`${newX},${newY}`)) {
                const nextChar = grid[newY][newX];
                const oppositeDirection = {
                    'up': 'down',
                    'down': 'up',
                    'left': 'right',
                    'right': 'left'
                };
                const nextDirections = pipeConnections[nextChar];
                if (nextDirections && nextDirections[oppositeDirection[direction]]) {
                    queue.push([newX, newY]);
                    console.log(`큐에 추가 중 (${newX}, ${newY}), 문자: ${nextChar}`);
                }
            }
        }
    }

    return connectedSinks;
}

// 그리드를 시각적으로 출력하는 함수
function printGrid(grid) {
    const allY = Object.keys(grid).map(y => parseInt(y));
    const allX = Object.values(grid).flatMap(row => Object.keys(row).map(x => parseInt(x)));

    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);

    let output = '';
    for (let y = maxY; y >= minY; y--) { // y 좌표를 내림차순으로 순회
        let row = '';
        for (let x = minX; x <= maxX; x++) {
            if (grid[y] && grid[y][x]) {
                row += grid[y][x];
            } else {
                row += ' ';
            }
        }
        output += row + '\n';
    }
    return output;
}

// 그리드의 내부 구조를 출력하는 함수
function printGridStructure(grid) {
    console.log("그리드 구조:");
    const allY = Object.keys(grid).map(y => parseInt(y)).sort((a, b) => b - a); // y 좌표를 내림차순으로 정렬
    for (let y of allY) {
        console.log(`행 ${y}:`, grid[y]);
    }
}

// 프로그램을 실행하는 메인 함수
function main(inputFile, outputFile) {
    const gridObjects = parseInput(inputFile);
    const grid = buildGrid(gridObjects);

    // 디버깅을 위한 그리드 출력
    console.log('그리드:');
    const gridOutput = printGrid(grid);
    console.log(gridOutput);

    // 그리드 출력을 파일에 저장
    fs.writeFileSync(outputFile, gridOutput, 'utf8');

    // 그리드의 내부 구조 출력
    printGridStructure(grid);

    // 소스를 찾기
    let sourceX, sourceY;
    for (let y in grid) {
        for (let x in grid[y]) {
            if (grid[y][x] === '*') {
                sourceX = parseInt(x);
                sourceY = parseInt(y);
                break;
            }
        }
        if (sourceX !== undefined) break;
    }

    console.log(`소스를 찾았습니다: (${sourceX}, ${sourceY})`);
    const connectedSinks = findConnectedSinks(grid, sourceX, sourceY);
    console.log('연결된 싱크:', Array.from(connectedSinks).join(', '));
}

// 입력 파일과 출력 파일을 지정하여 메인 함수를 실행
main('coding_qual_input.txt', 'output.txt');
