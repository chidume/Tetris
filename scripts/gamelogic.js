  const COL = 10;

  const ROWS = 20;

  const BLOCK_LENGTH = 25;

  const BLOCK_MARGIN = 1;

  const BLOCKS = [
    { name: 'I', 
        color: '#30d5c8',
        position: [ [[0,0], [1,0], [2,0], [3,0]],
                    [[2,-1], [2,0], [2,1], [2,2]],
                    [[0,2], [1,2], [2,2], [3,2]],
                    [[1,-1], [1,0], [1,1], [1,2]], ]
    },
    { name: 'J', 
        color: '#FF971C',
        position: [ [[2,0], [0,1], [1,1], [2,1]],
                    [[1,0], [1,1], [1,2], [2,2]],
                    [[0,1], [0,2], [1,1], [2,1]],
                    [[0,0], [1,0], [1,1], [1,2]], ]
    },
    { name: 'L', 
        color: '#0341AE',
        position: [ [[0,0], [0,1], [1,1], [2,1]],
                    [[1,0], [1,1], [1,2], [2,0]],
                    [[0,1], [1,1], [2,1], [2,2]],
                    [[0,2], [1,0], [1,1], [1,2]], ]
    },
    { name: 'O',
      color: '#FFD500',
      position: [ [[1,0], [2,0], [1,1], [2,1]],]
    },
    { name: 'S',
      color: '#72CB3B',
      position: [ [[1,0], [2,0], [0,1], [1,1]],
                  [[1,0], [1,1], [2,1], [2,2]],
                  [[0,2], [1,1], [1,2], [2,1]],
                  [[0,0], [0,1], [1,1], [1,2]], ]
    },
    { name: 'T',
      color: 'purple',
      position: [ [[1,0], [0,1], [1,1], [2,1]],
                  [[1,0], [1,1], [1,2], [2,1]],
                  [[0,1], [1,1], [1,2], [2,1]],
                  [[0,1], [1,0], [1,1], [1,2]], ]
    },
    { name: 'Z',
      color: '#FF3213',
      position: [ [[0,0], [1,0], [1,1], [2,1]],
                  [[2,0], [1,1], [2,1], [1,2]],
                  [[0,1], [1,1], [1,2], [2,2]],
                  [[1,0], [0,1], [1,1], [0,2]], ]
    },
  ];
  const LINES_CLEARED_PER_LEVEL = 10;

  const GAMESTATE = {};

  const EMPTY_SPACE = 0;

  const NON_MOVING_BLOCK = 1;

  const MOVING_BLOCK = 2;

  const NEXTQUEUE = 'next';

  const GAMEBOARD = 'gameboard';

  const BUTTON_NAMES = ['PAUSE (P)', 'MUSIC OFF (M)', 'QUIT (Q)', 'KEYS (K)'];

  let backgroundMusic = loadBackgroundMusic();

  /**********************************************************/

  function initializeGamestate() {
    GAMESTATE.reqId;

    GAMESTATE.level = 1;

    GAMESTATE.score = 0;

    GAMESTATE.rowsCleared = 0;

    GAMESTATE.tetrisboard = [];

    GAMESTATE.blockInterval = 750;

    GAMESTATE.pausedMusic = true;

    GAMESTATE.pausedGame = false;

    for(let i = 0; i < ROWS; i++){ 
      let temp = new Array(COL).fill(0);

      GAMESTATE.tetrisboard.push(temp);
    }

    GAMESTATE.blockCollection = [];

    for(let i = 0; i < ROWS; i++) {
      GAMESTATE.blockCollection.push([]);
    }

    document.addEventListener('keydown', gameKeys);
  }

  function getRowCol(block) {
    let row = parseInt(block.style.top) / BLOCK_LENGTH;
    
    let col = parseInt(block.style.left) / BLOCK_LENGTH;

    return [row, col];
  }

  function updateBlockstate(value) {
    for (block of GAMESTATE.newBlock.blocks) {
      let [row, col] = getRowCol(block);

      GAMESTATE.tetrisboard[row][col] = value;
    }  

    if(value != NON_MOVING_BLOCK) return;

    updateBlockCollection();

    let numOfClearedRows = clearRows();

    updateScoreboard(numOfClearedRows);
  }

  function updateBlockCollection() {
    GAMESTATE.newBlock.blocks.forEach(block => {
      let [row, col] = getRowCol(block);

      GAMESTATE.blockCollection[row].push(block);
    });
  }

  function updateScoreboard(numOfClearedRows) { 
    switch(numOfClearedRows) {
      case 4:
        GAMESTATE.score += 1200;
        break;
      case 3:
        GAMESTATE.score += 300;
        break;
      case 2:
        GAMESTATE.score += 100;
        break;
      case 1:
        GAMESTATE.score += 40;
        break;
    }

    GAMESTATE.rowsCleared += numOfClearedRows;

    document.querySelector('#score').innerHTML = GAMESTATE.score;

    document.querySelector('#rows').innerHTML = GAMESTATE.rowsCleared;

    updateLevel();
  }

  function resetScoreboard () {
    document.querySelector('#rows').innerHTML = 0;

    document.querySelector('#score').innerHTML = 0;

    document.querySelector('#levelcount').innerHTML = 1;
  }

  function updateLevel() {
    let currentLevel = Math.floor( GAMESTATE.rowsCleared / LINES_CLEARED_PER_LEVEL ) + 1;
    
    if(currentLevel == GAMESTATE.level + 1) {
      GAMESTATE.level = currentLevel;

      document.querySelector('#levelcount').innerHTML = currentLevel;

      GAMESTATE.blockInterval -= 20;
    }
  }

  function clearRows() {
    let numOfClearedRows = 0;

    for(let i = ROWS - 1; i > -1; i--) {
      if(GAMESTATE.blockCollection[i].length != 10) continue;

      deleteRow(i);
        
      GAMESTATE.rowsCompleted++;
        
      collapseRows(i++);

      numOfClearedRows++;
    }

    return numOfClearedRows;
  }

  function collapseRows(r) {
    for(let i = r; i > 0; i--) {
      GAMESTATE.blockCollection[i] = GAMESTATE.blockCollection[i - 1];

      GAMESTATE.blockCollection[i].forEach(block => {
        let [row, col] = getRowCol(block);

        GAMESTATE.tetrisboard[row][col] = EMPTY_SPACE;

        block.style.top = parseInt(block.style.top) + BLOCK_LENGTH + 'px';

        GAMESTATE.tetrisboard[row + 1][col] = NON_MOVING_BLOCK;
      });
    }

    GAMESTATE.blockCollection[0] = [];
  }

  function deleteRow(r) {
    GAMESTATE.blockCollection[r].forEach ( block => {
      let [row, col] = getRowCol(block);

      GAMESTATE.tetrisboard[row][col] = EMPTY_SPACE;

      block.remove();
    });
  }

  /**********************************************************/

  function createBlock(blockConfig) {
    let randomBlock = BLOCKS[blockConfig.index];

    let randomBlockPosition = randomBlock.position[0];

    let newBlockInfo = randomBlockPosition.map(function(coords) {
      let block = document.createElement('div');

      block.style.position = 'absolute'; 

      block.style.backgroundColor = randomBlock.color;

      block.style.left = (coords[0] + blockConfig.left) * BLOCK_LENGTH + 'px';

      block.style.top = (coords[1]+ blockConfig.top) * BLOCK_LENGTH + 'px';

      block.style.width = BLOCK_LENGTH - BLOCK_MARGIN + 'px'; 

      block.style.height = BLOCK_LENGTH - BLOCK_MARGIN + 'px';

      block.style.borderRadius = '4px';

      return block;
    });

    return { blockName: randomBlock.name,  
             blocks: newBlockInfo,
             dx: blockConfig.left,
             dy: 0, 
             currPos: 0,
             positions: randomBlock.position };
  }

  function spawnBlockOn(location) {
    const blockConfig = {};

    blockConfig.index = Math.floor(Math.random() * BLOCKS.length);

    if(location == GAMEBOARD) {
      blockConfig.top = 0;
      blockConfig.left = Math.floor(Math.random() * 7);
    }

    if(location == NEXTQUEUE) {
      blockConfig.top = 2;
      blockConfig.left = 1;
    }

    if (location == GAMEBOARD && GAMESTATE.nextBlock) {
      for(let i = 0; i < BLOCKS.length; i++) {
        if(BLOCKS[i].name == GAMESTATE.nextBlock.blockName) blockConfig.index= i;  
      }
    }

    let loc = document.getElementById(location);

    let tempBlock = createBlock(blockConfig);

    tempBlock.blocks.forEach(block => loc.append(block));

    if(location == GAMEBOARD) GAMESTATE.newBlock = tempBlock;

    if(location == NEXTQUEUE) GAMESTATE.nextBlock = tempBlock;
  }

  function gameOver() {
    for(let block of GAMESTATE.newBlock.blocks) {
      let [row, col] = getRowCol(block);

      if(GAMESTATE.tetrisboard[row][col] == NON_MOVING_BLOCK) {
        document.removeEventListener('keydown', gameKeys);
        return true;
      }
    }

    return false;
  }

  /**********************************************************/

  function gameKeys(event) {
    if(event.code == 'ArrowUp') rotateClockwise();

    if(event.code == 'ArrowLeft') move(event);

    if(event.code == 'ArrowRight') move(event);

    if(event.code == 'ArrowDown') move(event);
  }

  function validRotation() {
    let index = (GAMESTATE.newBlock.currPos + 1) % 4;

    let nextPosition = GAMESTATE.newBlock.positions[index];

     for(let i = 0; i < nextPosition.length; i++) {
       let x = GAMESTATE.newBlock.dx + nextPosition[i][0];

       let y = GAMESTATE.newBlock.dy + nextPosition[i][1];

       if(x < 0 || x > 9) return false;

       if(y < 0 || y > 19) return false;

       if(GAMESTATE.tetrisboard[y][x] == NON_MOVING_BLOCK) return false;
    }

    GAMESTATE.newBlock.currPos = index;

    return true;
  }

  function rotateClockwise() {
    if(GAMESTATE.newBlock.blockName == 'O') return;

    if(!validRotation()) return; 

    updateBlockstate(EMPTY_SPACE);

    let index = GAMESTATE.newBlock.currPos;

    let position = GAMESTATE.newBlock.positions[index]

    for(let i = 0; i < position.length; i++) {
      let x = GAMESTATE.newBlock.dx + position[i][0];
      
      let y = GAMESTATE.newBlock.dy + position[i][1];

      let block = GAMESTATE.newBlock.blocks[i];

      block.style.left = x * BLOCK_LENGTH + 'px';

      block.style.top = y * BLOCK_LENGTH + 'px';
    } 

    updateBlockstate(MOVING_BLOCK);
  }

  /**********************************************************/

  function invalidMove(event) {
    for(let block of GAMESTATE.newBlock.blocks) {
      let [row, col] = getRowCol(block);

      switch(event.code) {
        case 'ArrowLeft':
          if(col - 1 < 0) return true;
          if(GAMESTATE.tetrisboard[row][col - 1] == NON_MOVING_BLOCK) return true;
          break;
        case 'ArrowRight':
          if(col + 1 > 9) return true;
          if(GAMESTATE.tetrisboard[row][col + 1] == NON_MOVING_BLOCK) return true;
          break;
        case 'ArrowDown':
          if((row + 1) > 19) return true;
          if(GAMESTATE.tetrisboard[row + 1][col] == NON_MOVING_BLOCK) return true;
          break;
      }
    }

    return false;
  }

  function move(event) {
    let evt = event || {code: 'ArrowDown'};

    if(invalidMove(evt)) {
      if(event === undefined) updateBlockstate(NON_MOVING_BLOCK);
      return false;
    }

    updateBlockstate(EMPTY_SPACE);

    for(let block of GAMESTATE.newBlock.blocks) {
      switch(evt.code) {
        case 'ArrowLeft':
          block.style.left = parseInt(block.style.left) - BLOCK_LENGTH + 'px';
          break;
        case 'ArrowRight':
          block.style.left = parseInt(block.style.left) + BLOCK_LENGTH + 'px';
          break;
        case 'ArrowDown':
          block.style.top = parseInt(block.style.top) + BLOCK_LENGTH + 'px';
          break;
      }
    }

    if(evt.code == 'ArrowLeft') GAMESTATE.newBlock.dx--;

    if(evt.code == 'ArrowRight') GAMESTATE.newBlock.dx++;

    if(evt.code == 'ArrowDown') GAMESTATE.newBlock.dy++;

    updateBlockstate(MOVING_BLOCK);

    return true;
  }

  /**********************************************************/

  function play() {
    if(!GAMESTATE.newBlock) {
      spawnBlockOn(GAMEBOARD);

      spawnBlockOn(NEXTQUEUE);

      if(gameOver()) return;

      updateBlockstate(MOVING_BLOCK);
    }

    let startTime = performance.now();
      
    GAMESTATE.reqId = requestAnimationFrame( function moveBlock(currentTime) {
      let timeElapsed = currentTime - startTime;

      if(timeElapsed > GAMESTATE.blockInterval) {
        startTime = currentTime;

        if(!move()) {
          GAMESTATE.nextBlock.blocks.forEach(block => block.remove());
          GAMESTATE.newBlock = null;
          play();
          return;
        }
      }

      GAMESTATE.reqId = requestAnimationFrame(moveBlock);
    });
  }

  function pauseGame() {
    if(GAMESTATE.pausedGame) {
      removeOpaqueScreen();
      document.addEventListener('keydown', gameKeys);
      document.querySelector('#pause').innerHTML = 'PAUSE (P)';
      GAMESTATE.pausedGame = !GAMESTATE.pausedGame;
      play();
    }else {
      addOpaqueScreen(0.6);
      document.removeEventListener('keydown', gameKeys);
      document.querySelector('#pause').innerHTML = 'PLAY (P)';
      GAMESTATE.pausedGame = !GAMESTATE.pausedGame;
      window.cancelAnimationFrame(GAMESTATE.reqId);
    }
  }

  function quitGame() {
    if(GAMESTATE.pausedGame) removeOpaqueScreen();

    window.cancelAnimationFrame(GAMESTATE.reqId);

    if(GAMESTATE.newBlock) GAMESTATE.newBlock.blocks.forEach(block => block.remove());

    GAMESTATE.newBlock = null;

    if(GAMESTATE.nextBlock) GAMESTATE.nextBlock.blocks.forEach(block => block.remove());

    for(let row of GAMESTATE.blockCollection) {
      for(let block of row) block.remove();
    }

    removeEventListeners();

    document.querySelector('.settings').remove();

    resetScoreboard();

    if(!GAMESTATE.pausedMusic) backgroundMusic.pause();

    document.querySelector('.menu').style.display = 'block';

    document.querySelector('.game').style.backgroundColor = '';
  }

  function removeEventListeners() {
    document.removeEventListener('keydown', gameKeys);

    document.documentElement.removeEventListener('keydown', setKeyBinds);

    document.querySelector('.settings').removeEventListener('click', setMenuButtonListeners);
  }

  function addOpaqueScreen(opacity) {
    let opaqueScreen = document.createElement('div');
    opaqueScreen.classList.add('screen');
    if(opacity) opaqueScreen.style.opacity = '0.6';
    document.querySelector('#gameboard').append(opaqueScreen);
  }

  function removeOpaqueScreen() {
    let opaqueScreen = document.querySelector('.screen');

    if(opaqueScreen) document.querySelector('.screen').remove();
  }

  function loadSettingsMenu() {
    let settingsElem = document.createElement('div');
    settingsElem.classList.add('settings');

    BUTTON_NAMES.forEach( buttonName => {
      let buttonElement = document.createElement('button');
      buttonElement.classList.add('button');
      buttonElement.id = buttonName.split(" ")[0].toLowerCase();
      buttonElement.innerHTML = buttonName;
      settingsElem.append(buttonElement);
    });

    document.querySelector('.right').append(settingsElem);

    document.documentElement.addEventListener('keydown', setKeyBinds);

    document.querySelector('.settings').addEventListener('click', setMenuButtonListeners);
  }

  function loadBackgroundMusic() {
    let soundtrack = "sounds/West Bad - Jeremy Black.mp3";

    let backgroundMusic = new Audio(soundtrack);

    backgroundMusic.loop = true;

    return backgroundMusic;
  }

  function playMusic() {
    let bgm = document.querySelector('#music');

    if (GAMESTATE.pausedMusic) {
      backgroundMusic.play();
      GAMESTATE.pausedMusic = !GAMESTATE.pausedMusic;
      bgm.innerHTML = "MUSIC OFF (M)";
    }else {
      backgroundMusic.pause();
      GAMESTATE.pausedMusic = !GAMESTATE.pausedMusic;
      bgm.innerHTML = "MUSIC ON (M)";
    }
  }

  function setKeyBinds(event) {
    if(event.key == 'm') playMusic();

    if(event.key == 'p') pauseGame();

    if(event.key == 'q') quitGame();
  }

  function setMenuButtonListeners(event) {
    if(event.target.id == 'music') playMusic();

    if(event.target.id == 'pause') pauseGame();

    if(event.target.id == 'quit') quitGame();
  }

  function gameStart(event){
    document.querySelector('.menu').style.display = 'none';

    document.querySelector('.game').style.backgroundColor = '#2C2F33';

    initializeGamestate();

    loadSettingsMenu();

    backgroundMusic.currentTime = 0;

    playMusic();

    play();
  }

  document.querySelector('#play').addEventListener('click', gameStart);