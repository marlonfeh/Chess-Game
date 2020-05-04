/* --------------------Global Variables-------------------- */

const newGame = document.getElementById('new-game');
const game = document.getElementById('game');
const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let activePlayer = 'white';
let waypoints = [];
let enemyWaypoints = [];
let deleteWaypoints = [];

let matePosition = false;
const initalPositions = [
  '1_a',
  '1_b',
  '1_c',
  '1_d',
  '1_e',
  '1_f',
  '1_g',
  '1_h',
  '2_a',
  '2_b',
  '2_c',
  '2_d',
  '2_e',
  '2_f',
  '2_g',
  '2_h',
  '7_a',
  '7_b',
  '7_c',
  '7_d',
  '7_e',
  '7_f',
  '7_g',
  '7_h',
  '8_a',
  '8_b',
  '8_c',
  '8_d',
  '8_e',
  '8_f',
  '8_g',
  '8_h',
];

/* --------------------Functions-------------------- */

function changePlayer() {
  //Check if Piece was really moved?
  if (activePlayer === 'white') {
    activePlayer = 'black';
  } else {
    activePlayer = 'white';
  }
}

function getPossibleMoves(element, elementClassList, player, Arr) {
  let figure = elementClassList[2];
  let initID = elementClassList[3];
  //console.log('getPossibleMoves Current Element', element);
  //console.log('getPossibleMoves Current Figure', figure);
  //console.log('getPossibleMoves Current Player', player);

  //Clean up old waypoints
  Arr.length = 0;
  //console.log('0 getMoves Waypoints', waypoints);
  //console.log('0 getMoves enemyWaypoints', enemyWaypoints);

  //Get relevant id and split it to row and column to be able to pass it to figure type specific function
  let id = element.parentNode.id;
  let id2 = id.split('_');
  let indexRow = rows.indexOf(id2[0]);
  let indexColumn = columns.indexOf(id2[1]);

  //compute every possible move based on figure
  if (figure === 'pawn') {
    pawnMoves(indexRow, indexColumn, id, initID, player, Arr);
    addPawnMarkings(Arr);
    pawnAttacks(indexRow, indexColumn, player);
  } else {
    switch (figure) {
      case 'king':
        kingMoves(indexRow, indexColumn, Arr);
        break;
      case 'queen':
        queenMoves(indexRow, indexColumn, Arr);
        break;
      case 'rock':
        rockMoves(indexRow, indexColumn, Arr);
        break;
      case 'knight':
        knightMoves(indexRow, indexColumn, Arr);
        break;
      case 'bishop':
        bishopMoves(indexRow, indexColumn, Arr);
        break;
      default:
        console.log('Something is wrong');
    }
    //add green dots on every possible move and red border on every enemy
    addMarkings(Arr);
  }
  //console.log(figure, elementClassList[1], Arr);
  //console.log('1 getMoves Waypoints', waypoints);
  //console.log('1 getMoves enemyWaypoints', enemyWaypoints);
}

function kingMoves(indexRow, indexColumn, Arr) {
  const possibleMoves = [
    [+1, 0],
    [+1, +1],
    [0, +1],
    [-1, +1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [+1, -1],
  ];
  //transform index

  possibleMoves.forEach((e) => {
    //Create new indices
    let row = e[0];
    let column = e[1];
    let indexRowNew = indexRow + row;
    let indexColumnNew = indexColumn + column;

    //Create new ID and push to waypoints
    let idNew = [rows[indexRowNew], columns[indexColumnNew]];
    let idNew2 = idNew.join('_');
    Arr.push([idNew2]);
  });
}

function checkProhibitedMoves(clickedElement) {
  let notActivePlayer = activePlayer === 'white' ? 'black' : 'white';
  let king = document.querySelector(`div.figure.${activePlayer}.king`);
  //console.log('checkMate enemyKing', enemyKing);

  //console.log('clickedElement', clickedElement, 'king', king);

  if (clickedElement === king) {
    console.log('clicked Element is King');
    let enemyPieces = document.querySelectorAll(
      `div.figure.${notActivePlayer}`
    );
    console.log('enemy Pieces', enemyPieces);

    removeMarkings();

    //------------Change to for of?!
    enemyPieces.forEach((element) => {
      getPossibleMoves(
        element,
        Array.from(element.classList),
        notActivePlayer,
        enemyWaypoints
      );
      console.log('Prohibited Moves Enemy Waypoints', element, enemyWaypoints);

      addMarkings(enemyWaypoints);

      let enemyGreenDots = Array.from(
        document.querySelectorAll('div.green-dot')
      );
      //let enemyActualWaypoints = enemyGreenDots[0].parentNode;

      let enemyActualWaypoints = [];

      enemyGreenDots.forEach((e) => {
        enemyActualWaypoints.push(e.parentNode);
      });

      //collect all greendots in new array

      console.log('enemyGreenDots', enemyGreenDots);
      console.log('enemyActualWaypoints', enemyActualWaypoints);

      waypoints.forEach((higherElement) => {
        higherElement.forEach((nestedElement) => {
          enemyActualWaypoints.forEach((enemyElement) => {
            if (nestedElement === enemyElement.id) {
              console.log(
                'same Element',
                'Waypoint',
                nestedElement,
                'EnemeyWaypoint',
                enemyElement.id
              );
              deleteWaypoints.push(nestedElement);
            }
          });
        });
      });

      removeMarkings();
    });

    if (deleteWaypoints.length) {
      deleteProhibitedWaypoints();
    }

    console.log('Empty deleteWaypoints', deleteWaypoints);
    console.log('filtered Waypoints', waypoints);

    addActive(king);
    addMarkings(waypoints);
  }
}

function deleteProhibitedWaypoints() {
  deleteWaypoints.forEach((e) => {
    waypoints.forEach((array) => {
      //item = item.filter((i) => i !== e);
      let index = array.indexOf(e);
      while (index > -1) {
        array.splice(index, 1);
        index = array.indexOf(e);
      }
    });
  });
  deleteWaypoints = [];
}

function queenMoves(indexRow, indexColumn, Arr) {
  rockMoves(indexRow, indexColumn, Arr);
  bishopMoves(indexRow, indexColumn, Arr);
}

function rockMoves(indexRow, indexColumn, Arr) {
  //------------Check castling option-----------------
  //checkCastling();
  let indexRow1, indexColumn1, indexRow2, indexColumn2;
  let nestedArr1 = [];
  let nestedArr2 = [];
  let nestedArr3 = [];
  let nestedArr4 = [];
  indexRow1 = indexRow2 = indexRow;
  indexColumn1 = indexColumn2 = indexColumn;

  //up moves
  while (indexRow1 <= 7) {
    indexRow1 += 1;
    createNewID(indexRow1, indexColumn, nestedArr1);
  }
  Arr.push(nestedArr1);

  //right moves
  while (indexColumn1 <= 7) {
    indexColumn1 += 1;
    createNewID(indexRow, indexColumn1, nestedArr2);
  }
  Arr.push(nestedArr2);

  //left moves
  while (indexColumn2 >= 0) {
    indexColumn2 -= 1;
    createNewID(indexRow, indexColumn2, nestedArr3);
  }
  Arr.push(nestedArr3);

  //down moves
  while (indexRow2 >= 0) {
    indexRow2 -= 1;
    createNewID(indexRow2, indexColumn, nestedArr4);
  }
  Arr.push(nestedArr4);
}

function knightMoves(indexRow, indexColumn, Arr) {
  const possibleMoves = [
    [+2, +1],
    [+1, +2],
    [-1, +2],
    [-2, +1],
    [-2, -1],
    [-1, -2],
    [+1, -2],
    [+2, -1],
  ];
  //transform index

  possibleMoves.forEach((e) => {
    //Create new indices
    let row = e[0];
    let column = e[1];
    let indexRowNew = indexRow + row;
    let indexColumnNew = indexColumn + column;
    let indexNew = [indexRowNew, indexColumnNew];

    //Create new ID and push to waypoints
    let idNew = [rows[indexRowNew], columns[indexColumnNew]];
    let idNew2 = idNew.join('_');
    Arr.push([idNew2]);
  });

  //---------Check castling option------------
  //checkCastling();
}

function bishopMoves(indexRow, indexColumn, Arr) {
  //console.log(indexRow);
  //console.log(indexColumn);
  let indexRow1,
    indexColumn1,
    indexRow2,
    indexColumn2,
    indexRow3,
    indexColumn3,
    indexRow4,
    indexColumn4;
  let nestedArr1 = [];
  let nestedArr2 = [];
  let nestedArr3 = [];
  let nestedArr4 = [];
  indexRow1 = indexRow2 = indexRow3 = indexRow4 = indexRow;
  indexColumn1 = indexColumn2 = indexColumn3 = indexColumn4 = indexColumn;

  //left up moves
  while (indexRow1 <= 7 && indexColumn1 >= 0) {
    indexRow1 += 1;
    indexColumn1 -= 1;
    createNewID(indexRow1, indexColumn1, nestedArr1);
  }
  Arr.push(nestedArr1);

  //right up moves
  while (indexRow2 <= 7 && indexColumn2 <= 7) {
    indexRow2 += 1;
    indexColumn2 += 1;
    createNewID(indexRow2, indexColumn2, nestedArr2);
  }
  Arr.push(nestedArr2);

  //left down moves
  while (indexRow3 >= 0 && indexColumn3 >= 0) {
    indexRow3 -= 1;
    indexColumn3 -= 1;
    createNewID(indexRow3, indexColumn3, nestedArr3);
  }
  Arr.push(nestedArr3);

  //right down moves
  while (indexRow4 >= 0 && indexColumn4 <= 7) {
    indexRow4 -= 1;
    indexColumn4 += 1;
    createNewID(indexRow4, indexColumn4, nestedArr4);
  }
  Arr.push(nestedArr4);
}

function pawnMoves(indexRow, indexColumn, id, initID, player, Arr) {
  let indexRowNew;
  //Inital Move
  if (player === 'white') {
    //Check for inital Position
    if (id === initID) {
      indexRowNew = indexRow + 2;
      //Create new ID and push to waypoints
      let idNew = [rows[indexRowNew], columns[indexColumn]];
      let idNew2 = idNew.join('_');
      Arr.push([idNew2]);
    }
    indexRowNew = indexRow + 1;
    let idNew = [rows[indexRowNew], columns[indexColumn]];
    let idNew2 = idNew.join('_');
    Arr.push([idNew2]);

    //Check left up and right up for enemies to attack
  } else {
    if (id === initID) {
      //Check for inital Position
      indexRowNew = indexRow - 2;
      //Create new ID and push to waypoints
      let idNew = [rows[indexRowNew], columns[indexColumn]];
      let idNew2 = idNew.join('_');
      Arr.push([idNew2]);
    }
    indexRowNew = indexRow - 1;
    let idNew = [rows[indexRowNew], columns[indexColumn]];
    let idNew2 = idNew.join('_');
    Arr.push([idNew2]);
  }
}

function pawnAttacks(indexRow, indexColumn, player) {
  let possibleAttacks;
  let attackFields = [];
  if (player === 'white') {
    possibleAttacks = [
      [+1, -1],
      [+1, +1],
    ];
  } else {
    possibleAttacks = [
      [-1, -1],
      [-1, +1],
    ];
  }

  possibleAttacks.forEach((e) => {
    //Create new indices
    let row = e[0];
    let column = e[1];
    let indexRowNew = indexRow + row;
    let indexColumnNew = indexColumn + column;

    //Create new ID and push to waypoints
    let idNew = [rows[indexRowNew], columns[indexColumnNew]];
    let idNew2 = idNew.join('_');
    attackFields.push([idNew2]);
  });

  //console.log(attackFields);

  attackFields.forEach((e) => {
    let element = document.getElementById(e);
    if (element !== null) {
      //console.log(element);
      //Check if child div exists
      if (element.childNodes.length) {
        //Check if child div is not a friendly piece
        if (element.children[0].classList[1] !== activePlayer) {
          element.insertAdjacentHTML(
            'afterbegin',
            '<div class="red-border"></div>'
          );
        }
      }
    }
  });
}

function addPawnMarkings(Arr) {
  for (const higherElement of Arr) {
    //console.log(e);
    for (const lowerElement of higherElement) {
      let element = document.getElementById(lowerElement);
      if (element.childNodes.length) {
      } else {
        //If waypoint is empty set a green-dot div on field
        element.insertAdjacentHTML(
          'afterbegin',
          '<div class="green-dot"></div>'
        );
      }
    }
  }
}

function createNewID(indexRow, indexColumn, Arr) {
  let idNew = [rows[indexRow], columns[indexColumn]];
  let idNew2 = idNew.join('_');
  return Arr.push(idNew2);
}

//--------------Currently under construction---------------//
function checkCastling(clickedElement) {
  let king = document.querySelector(`div.figure.${activePlayer}.king`);
  if (clickedElement === king) {
    let rock1, rock2, idB, idC, idD, idF, idG;
    if (activePlayer === 'white') {
      console.log('checkCastling King', king);
      rock1 = document.getElementById('1_a').childNodes[0];
      console.log('checkCastling Rock1', rock1);
      rock2 = document.getElementById('1_h').childNodes[0];
      console.log('checkCastling Rock2', rock2);
      idB = document.getElementById('1_b').childNodes.length;
      idC = document.getElementById('1_c').childNodes.length;
      idD = document.getElementById('1_d').childNodes.length;
      idF = document.getElementById('1_f').childNodes.length;
      idG = document.getElementById('1_g').childNodes.length;

      /*
      if (
        king.classList[3] === '1_e' &&
        rock1 !== undefined &&
        rock1.classList.contains('rock') &&
        rock1.classList[3] === '1_a' &&
        idB === 0 &&
        idC === 0 &&
        idD === 0
      ) {
        console.log('long castling');
        addUnderline(rock1);
      }

      if (
        king.classList[3] === '1_e' &&
        rock2 !== undefined &&
        rock2.classList.contains('rock') &&
        rock2.classList[3] === '1_h' &&
        idF === 0 &&
        idG === 0
      ) {
        console.log('short castling');
        addUnderline(rock2);
      }
      */
    } else {
      rock1 = document.getElementById('8_a').childNodes[0];
      rock2 = document.getElementById('8_h').childNodes[0];
      idB = document.getElementById('8_b').childNodes.length;
      idC = document.getElementById('8_c').childNodes.length;
      idD = document.getElementById('8_d').childNodes.length;
      idF = document.getElementById('8_f').childNodes.length;
      idG = document.getElementById('8_g').childNodes.length;

      if (
        king.classList[3] === '8_e' &&
        rock1 !== undefined &&
        rock1.classList.contains('rock') &&
        rock1.classList[3] === '8_a' &&
        idB === 0 &&
        idC === 0 &&
        idD === 0
      ) {
        console.log('long castling');
        addUnderline(rock1);
      }

      if (
        king.classList[3] === '8_e' &&
        rock2 !== undefined &&
        rock2.classList.contains('rock') &&
        rock2.classList[3] === '8_h' &&
        idF === 0 &&
        idG === 0
      ) {
        console.log('short castling');
        addUnderline(rock2);
      }
    }
  }
}

function movePieces(element, elementClassList) {
  let activeDiv = document.querySelectorAll('div.green-border');
  let activeFigure = activeDiv[0].parentNode.childNodes[1];
  let targetDiv = element.parentNode;

  console.log('activeDiv', activeDiv);
  console.log('activeFigure', activeFigure);
  console.log('targetDiv', targetDiv);

  function movePiecesSubsequent() {
    removeMarkings();
    checkEnemyMate();
    changePlayer();
  }

  if (activeFigure.classList[2] === 'king') {
    matePosition = false;
  }

  if (elementClassList[0] === 'red-border') {
    //remove attacked figure
    let enemyPiece = element.parentNode.childNodes[1];
    removeElement(enemyPiece);
    removeElement(activeFigure);
    targetDiv.appendChild(activeFigure);
    movePiecesSubsequent();
  } else if (
    targetDiv.classList.contains('cell') &&
    elementClassList[0] === 'green-dot'
  ) {
    removeElement(activeFigure);
    targetDiv.appendChild(activeFigure);
    movePiecesSubsequent();
  } else if (
    targetDiv.classList.contains('cell') &&
    targetDiv.childNodes[0].classList[0] === 'green-underline'
  ) {
    let rook = element.parentNode.childNodes[1];
    removeElement(rook);
    removeElement(activeFigure);
    targetDiv.appendChild(activeFigure);
    activeDiv[0].parentNode.appendChild(rook);
    movePiecesSubsequent();
  }

  //console.log('activeFigure 2', activeFigure);
  //console.log(activeFigure.classList.contains('king'));
}

function checkEnemyMate() {
  let notActivePlayer = activePlayer === 'white' ? 'black' : 'white';
  let enemyKing = document.querySelector(`div.figure.${notActivePlayer}.king`);
  //console.log('checkMate enemyKing', enemyKing);

  let pieces = document.querySelectorAll(`div.figure.${activePlayer}`);
  //console.log('checkMate friendlyPieces', pieces);

  for (const element of pieces) {
    getPossibleMoves(
      element,
      Array.from(element.classList),
      activePlayer,
      waypoints
    );

    if (
      enemyKing !== null &&
      enemyKing.parentNode.childNodes[0].classList.contains('red-border')
    ) {
      matePosition = true;
    }

    removeMarkings();

    if (matePosition) {
      //console.log(enemyKing.parentNode, 'Enemy King');
      addRedBorder(enemyKing);
      console.log(element);
      break;
    }
  }
  //console.log('CheckMate Waypoints', waypoints);
}

function setAllPieces() {
  initalPositions.forEach((id) => {
    let idSplitted = id.split('_');
    let Player = idSplitted[0] === '1' ? 'white' : 'black';
    let htmlPiece;

    if (idSplitted[0] === '2') {
      //add white pawn
      htmlPiece = '&#9817';
      addPiece('pawn', 'white', id, htmlPiece);
      //addInitalPos
      addInitalPos(id);
    } else if (idSplitted[0] === '7') {
      //add black pawn
      htmlPiece = '&#9823';
      addPiece('pawn', 'black', id, htmlPiece);
      addInitalPos(id);
    } else {
      switch (idSplitted[1]) {
        case 'a':
          htmlPiece = Player === 'white' ? '&#9814' : '&#9820';
          addPiece('rock', Player, id, htmlPiece);
          addInitalPos(id);
          break;
        case 'b':
          htmlPiece = Player === 'white' ? '&#9816' : '&#9822';
          addPiece('knight', Player, id, htmlPiece);
          break;
        case 'c':
          htmlPiece = Player === 'white' ? '&#9815' : '&#9821';
          addPiece('bishop', Player, id, htmlPiece);
          break;
        case 'd':
          htmlPiece = Player === 'white' ? '&#9813' : '&#9819';
          addPiece('queen', Player, id, htmlPiece);
          break;
        case 'e':
          htmlPiece = Player === 'white' ? '&#9812' : '&#9818';
          addPiece('king', Player, id, htmlPiece);
          addInitalPos(id);
          break;
        case 'f':
          htmlPiece = Player === 'white' ? '&#9815' : '&#9821';
          addPiece('bishop', Player, id, htmlPiece);
          break;
        case 'g':
          htmlPiece = Player === 'white' ? '&#9816' : '&#9822';
          addPiece('knight', Player, id, htmlPiece);
          break;
        case 'h':
          htmlPiece = Player === 'white' ? '&#9814' : '&#9820';
          addPiece('rock', Player, id, htmlPiece);
          addInitalPos(id);
          break;
        default:
          console.log('Something is wrong');
      }
    }
  });
}

function addPiece(type, Player, id, htmlPiece) {
  let field = document.getElementById(id);
  field.insertAdjacentHTML(
    'afterbegin',
    `<div class="figure ${Player} ${type}">${htmlPiece}</div>`
  );
}

function addInitalPos(id) {
  let field = document.getElementById(id).childNodes[0];
  field.classList.add(id);
}

function addActive(element) {
  element.parentNode.insertAdjacentHTML(
    'afterbegin',
    '<div class="green-border"></div>'
  );
}

function addRedBorder(element) {
  element.parentNode.insertAdjacentHTML(
    'afterbegin',
    '<div class="red-border"></div>'
  );
}

//Accepts only Nested Arrays!
function addMarkings(Arr) {
  for (const higherElement of Arr) {
    for (const lowerElement of higherElement) {
      let element = document.getElementById(lowerElement);
      if (element !== null) {
        //Check if child div exists
        //console.log('Element Childnodes', element.childNodes);
        if (element.childNodes.length) {
          //Check if child div is not a friendly piece
          if (element.children[0].classList[1] !== activePlayer) {
            element.insertAdjacentHTML(
              'afterbegin',
              '<div class="red-border"></div>'
            );
          }
          //Break inner loop because blocked by a piece and continue with higher loop
          break;
        } else {
          //If waypoint is empty set a green-dot div on field
          element.insertAdjacentHTML(
            'afterbegin',
            '<div class="green-dot"></div>'
          );
        }
      }
    }
  }
}

function addUnderline(rock) {
  rock.parentNode.insertAdjacentHTML(
    'afterbegin',
    '<div class="green-underline"></div>'
  );
}

function removeElement(element) {
  element.parentNode.removeChild(element);
}

function removeMarkings() {
  let greenDots = Array.from(document.querySelectorAll('div.green-dot'));
  let redBorders = Array.from(document.querySelectorAll('div.red-border'));
  let Active = Array.from(document.querySelectorAll('div.green-border'));
  let underline = Array.from(document.querySelectorAll('div.green-underline'));
  greenDots.forEach((e) => {
    removeElement(e);
  });
  redBorders.forEach((e) => {
    removeElement(e);
  });
  Active.forEach((e) => {
    removeElement(e);
  });
  underline.forEach((e) => {
    removeElement(e);
  });
}

function removeAllPieces() {
  let pieces = document.querySelectorAll('div.figure');
  pieces.forEach((e) => {
    removeElement(e);
  });
}

/* --------------------Event Listeners-------------------- */

// Listen to all clicks on div.game
game.addEventListener(
  'click',
  (e) => {
    let element = e.target;
    let elementClassList = Array.from(element.classList);

    console.log('element', element);
    //console.log('element Class List', elementClassList);
    //console.log(activePlayer);

    let activeDiv = document.querySelectorAll('div.green-border');
    let king = document.querySelector(`div.figure.${activePlayer}.king`);
    //console.log('Check for Mate position', king.parentNode);

    if (matePosition) {
      console.log('King in Mate');

      if (elementClassList.includes('green-border')) {
        removeMarkings();
        addRedBorder(king);
      } else if (activeDiv.length > 0) {
        movePieces(element, elementClassList);
      } else if (elementClassList.includes('red-border')) {
        element.classList.remove('red-border');
        element.classList.add('green-border');
        getPossibleMoves(king, king.classList, activePlayer, waypoints);
        checkProhibitedMoves(king);
      }
    } else {
      //Check if element is already active, then if there is already any other element, then if piece fits requirements
      if (elementClassList.includes('green-border')) {
        removeMarkings();
      } else if (activeDiv.length > 0) {
        //Move figure to clicked position
        movePieces(element, elementClassList);
      } else if (
        elementClassList.includes('figure') &&
        elementClassList.includes(activePlayer)
      ) {
        //Set State of Piece to active
        addActive(element);
        getPossibleMoves(element, elementClassList, activePlayer, waypoints);
        checkProhibitedMoves(element);
        checkCastling(element);
      }
    }
  },
  false
);

newGame.addEventListener('click', (e) => {
  console.log('new game');
  removeMarkings();
  removeAllPieces();
  setAllPieces();
  activePlayer = 'white';
  matePosition = false;
});
