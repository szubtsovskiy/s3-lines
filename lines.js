// ============================================================================================================================= //

/*
 * This file contains functions for game known as "Lines". 
 * Author: Sergey Zubtcovskii
 * Date: September - October, 2004
 */

// ============================================================================================================================= // 



// ~ Constants ============================================================================================================
var minRows = 5;
var maxRows = 15;
var minCols = 5;
var maxCols = 15;
var minBalls = 3;
var maxBalls = 8;

// balls in normal state
var images = new Array();

// balls in jumping state
var jImages = new Array();

// balls in small state
var sImages = new Array();

// spacer - picture used to show empty cell
var spacer = new Image();

// ball types
var NORMAL = 0;
var JUMP   = 1;
var SMALL  = 2;

// ~ Instance variables ===================================================================================================

// number of rows
var rows;

// number of columns
var cols;

// number of balls
var balls;

// game field
var gameField = new Array();

// total score
var score = 0;

// first ball for next turn
var nextBall1;

// second ball for next turn
var nextBall2;

// third ball for next turn
var nextBall3;

// ball that is currently captured
var cBall = null; 

// ~ Inner objects =============================================================================================================

/* 
 * Object that represents ball
 * cellX      - absciss of table cell where ball is located 
 * cellY      - ordinate of table cell where ball is located
 * colorIndex - index of ball's color
 */
function Ball(cellX, cellY, colorIndex) {
    this.cellX = cellX;
    this.cellY = cellY;
    this.colorIndex = colorIndex;
}

/* 
 * Object that represents game table cell
 * cellX      - absciss of cell 
 * cellY      - ordinate of cell
 */
function Cell(cellX, cellY) {
    this.x = cellX;
    this.y = cellY;
}

/* ######################################################################################################## */
/*                                                Common methods                                            */
/* ######################################################################################################## */

/*
 * Retrieves cell with specified ID
 * cellId - id of cell to retrive (must be in form imageXXYY, where XX - cell's abcsiss and YY - cell's ordinate)
 */
function retrieveCell(imageId) {
    var cellX = parseInt(imageId.substring(5, 7), 10);
    var cellY = parseInt(imageId.substring(7), 10);
    return new Cell(cellX, cellY);
}
 
/*
 * Retrieves ID of image located in specified cell
 * cell - cell where image is located
 */
function retrieveImageId(cell) {
    return "image" + LZ(cell.x) + LZ(cell.y);
}

/*
 * Retrieves source of image of specified type and color
 * colorIndex - index of ball's color
 * type - ball's type (0 - normal, 1 - jumping, 2 - small)
 */
function retrieveImageSrc(colorIndex, type) {
    var imageName;
    type = parseInt(type, 10);
    switch (type) {
        case 0 : {
            imageName = this.images[colorIndex - 1].src;
            break;
        }
        case 1 : {
            imageName = this.jImages[colorIndex - 1].src;
            break;
        }
        case 2: {
            imageName = this.sImages[colorIndex - 1].src;
            break;
        }
    }
    return imageName;
}

/*
 * Returns file name of picture used to show empty cell
 */
function retrieveSpacerSrc() {
    return this.spacer.src;;
}
 
/*
 * Adds zero from the left if X is one-digit number, else does nothing
 * x - input number
 */
function LZ(x) {
    return ( x>9 ? "" : "0" ) + x;
}

/*
 * Checks x to be in specified range
 * x          - variable to be checked
 * leftBound  - left bound of range
 * rightBound - right bound of range
 */
function checkRange(x, leftBound, rightBound) {
    if ( x == "" ) {
        alert("Value is required.");
        return false;
    }
    
    for ( var i = 0; i < x.length; i++ ) {
        if( x.charAt(i) < "0" || x.charAt(i) > "9" ) { 
            alert("Value must be an integer.");
            return false;
        }
    }
    if ( parseInt(x, 10) < leftBound || parseInt(x, 10) > rightBound ) {
        alert("Value must be between " + leftBound + " and " + rightBound + ".");
        return false;
    }
    return true;
}

/*
 * Generates random number in specified range. It returns number from [leftBound .. rightBound - 1]
 * leftBound  - left bound of range
 * rightBound - right bound of range
 */
function randomInRange(leftBound, rightBound) {
    if ( leftBound > rightBound ) {
        var tmp = leftBound;
        leftBound = rightBound;
        rightBound = tmp;
    }
    var r = Math.floor(leftBound + (rightBound - leftBound)*Math.random()); 
    
    // We have VERY low probability that r is equal to right bound. But we still have it. 
    // So, if we want to get number EXACTLY from range, we must give proper weigh of this small probability.
    if ( r == rightBound ) {
        r--;
    }
    return r;
}

/*
 * Selects a random member from specified set
 * set - array to select member from
 */
function randomInSet(set) {
    var index = randomInRange(0, set.length);
    return set[index];
}

/*
 * Copies matrix
 * matrix - matrix to copy
 */
function copyMatrix(matrix) {
    var wid = matrix.length;
    var len = matrix[0].length;
    var result = new Array();
    for ( var i = 0; i < wid; i++) {
        result[i] = new Array();
        for ( var j = 0; j < len; j++ ) {
            result[i][j] = matrix[i][j];
        }
    }
    return result;
}


/* ######################################################################################################## */
/*                                            Game field's methods                                          */
/* ######################################################################################################## */

/*
 * Returns number of empty cells game table has
 */
function getNumberOfEmptyCells() {
    var count = 0;
    for ( var i = 0; i < rows; i++ ) {
        for ( var j = 0; j < cols; j++ ) {
            if ( this.gameField[i][j] == 0 ) {
                count++;
            }
        }
    }
    return count;
}

/*
 * Returns true, if game table has at least one empty cell
 */
function hasEmptyCells() {
    return getNumberOfEmptyCells() != 0;
}

/*
 * Returns true, if column has at least one empty cell
 * colIndex - index of column to check
 */
function isColumnThin(colIndex) {
    for ( var i = 0; i < rows; i++ ) {
        if ( this.gameField[i][colIndex] == 0 ) {
            return true;
        }
    }
    return false;
}

/*
 * Returns true, if row has at least one empty cell
 * rowIndex - index of row to check
 */
function isRowThin(rowIndex) {
    for ( var j = 0; j < cols; j++ ) {
        if ( this.gameField[rowIndex][j] == 0 ) {
            return true;
        }
    }
    return false;
}

/*
 * Checks game field cell to be empty
 * cell      - cell to be checked
 */
function cellIsEmpty(cell) {
    var isEmpty = true;
    if ( cell.x == null || cell.y == null || this.gameField[cell.y][cell.x] != 0 ) {
        isEmpty = false;
    } 
    return isEmpty;
}


/* ######################################################################################################## */
/*                                            Path's methods                                                */
/* ######################################################################################################## */

/*
 * Finds mate of specified cell that contains specified flag
 * cell - cell to find mate for
 * flag - required flag
 * field - field to search in
 */
function findMateWithFlag(cell, flag, field) {
    var x = cell.x;
    var y = cell.y - 1;
    if ( y >= 0 ) {
        if ( field[y][x] == flag ) {
            return new Cell(x, y);
        }
    } 
    
    x = cell.x + 1;
    y = cell.y;
    if ( x < field[0].length ) {
        if ( field[y][x] == flag ) {
            return new Cell(x, y);
        }
    }

    x = cell.x;
    y = cell.y + 1;
    if ( y < field.length ) {
        if ( field[y][x] == flag ) {
            return new Cell(x, y);
        }
    }

    x = cell.x - 1;
    y = cell.y;
    if ( x >= 0 ) {
        if ( field[y][x] == flag ) {
            return new Cell(x, y);
        }
    }
    // It is for debugging purposes. Should never be reached
    alert('findMateWithFlag: not found! :(');
}

/*
 * Finds path from one cell to another. If path doesn't exist, returns null, else returns array of cells on path
 * fromCell - cell to search for path from
 * toCell - cell to search for path to
 */
function findPath(fromCell, toCell) {
    var path = new Array();
    var field = copyMatrix(this.gameField);
    var stX = fromCell.x;
    var stY = fromCell.y;
    var finX = toCell.x;
    var finY = toCell.y;
    
    // Search path using "search engine in width"
        
    // Start cell is marked by number that is greater than any number that can appear in matrix cell. 
    // Actually it must be greater than number of balls used in this game
    var flag = balls;
    var canMark = true;
    field[stY][stX] = flag + 1;
    var mates = new Array(fromCell);
    
    // cycle must be continued while there is at least on cell that can be marked and toCell has zero value
    while ( canMark && field[finY][finX] == 0 ) {
        flag++;
        var prevMates = mates;
        mates = new Array();
        canMark = false;
        var matesCount = 0;
        
        // Loop through all mates of each cell that was got on previous iteration
        for ( var k = 0; k < prevMates.length; k++ ) {
        
            // There are four mates for each cell. Check 'em all        
            var mateCell = prevMates[k];
            var m1X = mateCell.x;
            var m1Y = mateCell.y - 1;
            var m2X = mateCell.x + 1;
            var m2Y = mateCell.y;
            var m3X = mateCell.x;
            var m3Y = mateCell.y + 1;
            var m4X = mateCell.x - 1;
            var m4Y = mateCell.y;
            
            // If cell has flag value and its mate has zero value, set mate's value to flag + 1
            if ( field[mateCell.y][mateCell.x] == flag ) {
                if ( m1Y >= 0 ) {
                    if ( field[m1Y][m1X] == 0 ) {
                        field[m1Y][m1X] = flag + 1;
                        mates[matesCount++] = new Cell(m1X, m1Y);
                        canMark = true;
                    }
                }
                if ( m2X < cols ) {
                    if ( field[m2Y][m2X] == 0 ) {
                        field[m2Y][m2X] = flag + 1;
                        mates[matesCount++] = new Cell(m2X, m2Y);
                        canMark = true;
                    }
                }
                if ( m3Y < rows ) {
                    if ( field[m3Y][m3X] == 0 ) {
                        field[m3Y][m3X] = flag + 1;
                        mates[matesCount++] = new Cell(m3X, m3Y);
                        canMark = true;
                    }
                }
                if ( m4X >= 0 ) {
                    if ( field[m4Y][m4X] == 0 ) {
                        field[m4Y][m4X] = flag + 1;
                        mates[matesCount++] = new Cell(m4X, m4Y);
                        canMark = true;
                    }
                }
            }
        }
    }
    
    
    // If toCell still has zero value, it means that path was not found
    if ( field[finY][finX] == 0 ) {
        path = null;
    } else {
        // Else create array of cells in path
        path = new Array();
        path[0] = toCell;
        var mate = findMateWithFlag(toCell, flag, field);
        var pathLength = 1;
        while ( !(mate.x == stX && mate.y == stY ) && flag >= balls + 1 ) {
            path[pathLength++] = mate;
            mate = findMateWithFlag(mate, --flag, field)
        }
        path[pathLength] = fromCell;
        //debugArray(path);
        
        // Array must be reverted because fromCell must be the first cell in path. Now it is the last.
        path.reverse();
    }
    
    return path;
}

/* ######################################################################################################## */
/*                                                Lines' methods                                            */
/* ######################################################################################################## */

/*
 * Check's part of some line around specified cell. Creates array of cells which have balls with the same color
 * as ball in specified cell. It is guaranteed by calling methods, that specified cell is not empty.
 * cell    - cell to check line around
 * xChange - how to change abscess in order to get next cell for checking
 * yChange - how to change ordinate in order to get next cell for checking
 */
function checkLinePart(cell, xChange, yChange) {
    
    var x = cell.x;
    var y = cell.y;
    
    var colorIndex = this.gameField[y][x];
    
    var line = new Array();
    var cellColorIndex = colorIndex;
    var k = 0;
    do {
        line[k++] = new Cell(x, y);
        x += xChange;
        y += yChange;
        if ( x < 0 || x >= this.cols || y < 0 || y >= this.rows ) {
            break;
        } 
        cellColorIndex = this.gameField[y][x];
    } while ( cellColorIndex == colorIndex );
    
    return line;
}

/*
 * Removes line of balls
 * line - array of cells belong to line
 */
function removeLine(line) {
    for (var i = 0; i < line.length; i++ ) {
        var cell = line[i];
        var imageId = retrieveImageId(cell);
        var image = document.getElementById(imageId);
        image.src = retrieveSpacerSrc();
        this.gameField[cell.y][cell.x] = 0;
    }
}

/*
 * Removes all lines that contain five or more balls of one color.
 * cell - cell to look lines around 
 * Returns true if at least one line was removed and false otherwise.
 */
function removeCompletedLines(cell) {
    
    var result = false;
    var x = cell.x;
    var y = cell.y;
    
    // Prepare arrays where cells with balls with same colors will be put
    var line1 = new Array();
    var line2 = new Array();
    var line3 = new Array();
    var line4 = new Array();
    
    // First line
    line1 = checkLinePart(cell, 0, -1);
    line1 = line1.concat(checkLinePart(cell, 0, 1));
    
    // Second line
    line2 = checkLinePart(cell, 1, -1);
    line2 = line2.concat(checkLinePart(cell, -1, 1));
    
    // Third line
    line3 = checkLinePart(cell, 1, 0);
    line3 = line3.concat(checkLinePart(cell, -1, 0));
    
    // Fourth line
    line4 = checkLinePart(cell, 1, 1);
    line4 = line4.concat(checkLinePart(cell, -1, -1));
    
    // Remove all lines which length is greater than or equal to 5
    // Remember, that our lines contain two instances of cell, we were looking around. We must consider it.
    
    if ( line1.length > 5 ) {
        result = true;
        removeLine(line1);
        evalScore(line1.length - 1);
    }       
    
    if ( line2.length > 5 ) {
        result = true;
        removeLine(line2);
        evalScore(line2.length - 1);
    }       

    if ( line3.length > 5 ) {
        result = true;
        removeLine(line3);
        evalScore(line3.length - 1);
    }       

    if ( line4.length > 5 ) {
        result = true;
        removeLine(line4);
        evalScore(line4.length - 1);
    }       
    
    return result;
}

/* ######################################################################################################## */
/*                                                Balls' methods                                            */
/* ######################################################################################################## */

// Path to cell
var path;

// Color index of ball to move along the path
var colorIndex;

// Flag to indicate that some ball is on move in current moment - to prevent click on another ball while some is not on its place yet
var ballIsMoving = false;

/*
 * Performs move of ball from previous cell in path to cell specified by its position
 * pos - position of cell to move to
 */
function performMove(pos) {
    ballIsMoving = true;
    var imageId = retrieveImageId(this.path[pos - 1]);
    var image = document.getElementById(imageId);
    image.src = retrieveSpacerSrc();
    imageId = retrieveImageId(this.path[pos]);
    image = document.getElementById(imageId);
    image.src = retrieveImageSrc(this.colorIndex, NORMAL);
    if ( pos < this.path.length - 1 ) {
        setTimeout("performMove(" + ( parseInt(pos, 10) + 1 ) + ")", 50);
    } else {
        // Ball stopped moving
        ballIsMoving = false;
        // if there is at least one line with five or more balls of one color around last cell in path, remove it, otherwise do next turn
        var last = this.path.length - 1;
        if ( !removeCompletedLines(this.path[last]) ) {
            doTurn(); 
        }       
    }
}

/*
 * Moves ball from to specified cell along specified path. 
 * Internally calls performMove(pos) to perform move from one cell in path to another
 * ball - ball to move
 * cell - cell to move ball to
 * path - path to move along
 */
function moveBall(ball, cell, path) {
    this.gameField[ball.cellY][ball.cellX] = 0;
    this.gameField[cell.y][cell.x] = ball.colorIndex;
    this.path = path;
    this.colorIndex = ball.colorIndex;
    setTimeout("performMove(" + 1 + ")", 50);
}

/*
 * Puts ball with specified color into random empty cell
 * Returns true if game can be continued and false if there is no empty cell left
 * colorIndex - index of color of ball to put into cell
 */
function putBallIntoRandomCell(colorIndex) {
    var thinRows = new Array();
    var count = 0
    
    // get indexes of thin rows
    for ( var i = 0; i < rows; i++ ) {
        if ( isRowThin(i) ) {
            thinRows[count++] = i;
        }
    }
    
    // get random index of row from the set of thin rows
    var rowIndex = randomInSet(thinRows); 
    var ordinates = new Array();
    count = 0;
    
    // get ordinates of non-empty cells in selected row
    for ( var j = 0; j < cols; j++ ) {
        if ( this.gameField[rowIndex][j] == 0 ) {
            ordinates[count++] = j;
        }
    }
    
    // get random ordinate from the set of non-empty cells
    var colIndex = randomInSet(ordinates);
    
    // put color index in matrix on appropriate position
    this.gameField[rowIndex][colIndex] = colorIndex;
    
    // put image on game field
    var imageId = retrieveImageId(new Cell(colIndex, rowIndex));
    var image = document.getElementById(imageId);
    image.src = retrieveImageSrc(colorIndex, NORMAL); 
    
    // check if there are completed lines
    removeCompletedLines(new Cell(colIndex, rowIndex));
    if ( getNumberOfEmptyCells() == 0 ) {
        gameOver();
        return false;
    }
    return true;
}

/*
 * Prepares balls to be placed on game field next turn
 */
function prepareBalls() {
    this.nextBall1 = randomInRange(1, balls + 1);
    this.nextBall2 = randomInRange(1, balls + 1);
    this.nextBall3 = randomInRange(1, balls + 1);
    var nextBall = document.getElementById("nextBall1");
    nextBall.src = retrieveImageSrc(nextBall1, SMALL);
    nextBall = document.getElementById("nextBall2");
    nextBall.src = retrieveImageSrc(nextBall2, SMALL);
    nextBall = document.getElementById("nextBall3");
    nextBall.src = retrieveImageSrc(nextBall3, SMALL);
}


/*
 * Releases ball by setting corresponding cell's src to static image
 * ball - ball to release
 */
function releaseBall(ball) {
    var imageId = retrieveImageId(new Cell(ball.cellX, ball.cellY));
    var image = document.getElementById(imageId);
    image.src = retrieveImageSrc(ball.colorIndex, NORMAL);
}

/* ######################################################################################################## */
/*                                                Event handlers                                            */
/* ######################################################################################################## */

/*
 * Puts three balls to random empty cells on game field and prepares balls for next turn
 */
function doTurn() {
    // try to put the first ball on the field
    if ( putBallIntoRandomCell(this.nextBall1) ) {
        // success - let's try the second ball
        if ( putBallIntoRandomCell(this.nextBall2) ) {
            // and the third ball
            if ( putBallIntoRandomCell(this.nextBall3) ) {
                // three balls were succefully put on the field - prepare next ones
                prepareBalls();
            }
        }   
    } 
}

/*
 * Tries to move captured ball to specified cell. In case of success, checks completed lines, otherwise releases ball
 * cell - cell to move to
 */
function doPlay(cell) {
    // let's try to find path
    var ballLocation = new Cell(this.cBall.cellX, this.cBall.cellY);
    var path = findPath(ballLocation, cell);
    if ( path == null ) {
        // path doesn't exist
        alert("Alas, path doesn't exist!");
        releaseBall(this.cBall);
    } else {
        // path has been found
        // Move ball along the path
        moveBall(this.cBall, cell, path);
        
    }
    this.cBall = null;
}

/*
 * Captures ball localted in specified cell.
 * cell - cell to capture ball from
 */
 function captureBall(cell) {
    if ( this.cBall != null ) {
        releaseBall(this.cBall);
    }
    var colorIndex = this.gameField[cell.y][cell.x];
    this.cBall = new Ball(cell.x, cell.y, colorIndex);
    var imageId = retrieveImageId(cell);
    var image = document.getElementById(imageId);
    image.src = retrieveImageSrc(colorIndex, JUMP);
 }
 
/*
 * Processes click on some cell
 * cellId - cell to process click on
 */ 
function doClick(cellId) {
    
    // Prevent click on different balls in one game moment
    if ( this.ballIsMoving ) {
        return;
    }
    
    var cell = retrieveCell(cellId);
    
    if ( !cellIsEmpty(cell) ) {
        // there is a ball in specified cell, co capture it
        captureBall(cell);
    } else {
        if ( this.cBall == null ) {
            // cell is empty and there was no ball previously captured - just do nothing            
            return;
        } else {
            // cell is empty and there is captured ball - calling doPlay()
            doPlay(cell);
        }
    }
}

/* ######################################################################################################## */
/*                                            Game process-related methods                                  */
/* ######################################################################################################## */

/*
 * Initializes game. Fills array with images. They will be loaded one time and then cached in browser. 
 */
function init() {
    for ( var i = 1, k = 0; i <= 8; i++ ) {
        var image = new Image();
        image.src = "img/ball" + i + ".gif";
        this.images[k] = image;
        var jImage = new Image();
        jImage.src = "img/jball" + i + ".gif";
        this.jImages[k] = jImage;
        var sImage = new Image();
        sImage.src = "img/sball" + i + ".gif";
        this.sImages[k++] = sImage;
    } 
    this.spacer.src = "img/spacer.gif";
}

/*
 * Increases score by number depends on balls in completed line
 * ballsCount - number of balls in line
 */
function evalScore(ballsCount) {
    var sum = 5;
    for ( var i = 6; i <= ballsCount; i++ ) {
        sum += i;
    }
    this.score += sum;
    var count = document.getElementById("count");
    count.innerHTML = this.score;
}

/*
 * Starts new game and sets number of columns, rows and balls to specified.
 * Draws game field then.
 * cols  - number of columns 
 * rows  - number of rows 
 * balls - number of balls
 */
function startNewGame(cols, rows, balls) {
    
    // Guarantee that previous game was correctly finished
    if ( this.cBall != null ) {
        releaseBall(this.cBall);
        this.cBall = null;
    }
    
    // Guarantee that parameters are integers and not a strings
    cols = parseInt(cols, 10);
    rows = parseInt(rows, 10);
    balls = parseInt(balls, 10);
    
    // Guarantee that number of columns is in correct range
    if ( cols == null || cols < this.minCols) {
        cols = this.minCols;
    } else if ( cols > this.maxCols ) {
        cols = this.maxCols;
    }
    
    // Guarantee that number of rows is in correct range    
    if ( rows == null || rows < this.minRows ) {
        rows = this.minRows;
    } else if ( rows > this.maxRows ) {
        rows = this.maxRows;
    }
    
    // Guarantee that number of balls is in correct range   
    if ( balls == null || balls < this.minBalls ) {
        balls = this.minBalls;
    } else if ( balls > this.maxBalls ) {
        balls = this.maxBalls;
    }
    
    this.cols = parseInt(cols, 10);
    this.rows = parseInt(rows, 10);
    this.balls = parseInt(balls, 10);
    this.score = 0;
    
    // Cell settings
    var cellWidth = 50;
    var cellHeight = 50;
    var imageSize = 45; 
    
    // Calculate size of game field and table that contains game field and settings area
    var gameFieldWidth = cols * cellWidth;
    var gameFieldHeight = rows * cellHeight;
    var totalWidth = gameFieldWidth + 250;
    var totalHeight = gameFieldHeight + 50;
    
    var layout = document.getElementById("layout");
    layout.width = totalWidth;
    layout.height = totalHeight;    

    // Create game field
    
    var gameFieldContent = new String();
    gameFieldContent += "<table align=\"center\" width=\"" + gameFieldWidth + "\" height=\"" + gameFieldHeight + "\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n";

    // Create cells
    for ( var i = 0; i < rows; i++ ) {  
        gameFieldContent += "<tr>\n";
        this.gameField[i] = new Array();
        for ( var j = 0; j < cols; j++ ) {
            this.gameField[i][j] = 0;
            var imageId = retrieveImageId(new Cell(j, i));  
            var onclick = "doClick('" + imageId + "'); return false;";
            gameFieldContent += "<td width=\"10%\" align=\"center\" valign=\"middle\">\n";
            gameFieldContent += "<a href=\"javascript:void(0)\" onclick=\"" + onclick + "\">";
            gameFieldContent += "<image id=\"" + imageId + "\" name=\"" + imageId + "\" src=\"img\/spacer.gif\" width=\"" + imageSize + "\" height=\"" + imageSize + "\" border=\"0\"\/>";
            gameFieldContent += "<\/a>\n";
            gameFieldContent += "<\/td>\n";
        }
        gameFieldContent += "<\/tr>\n";
    }
    gameFieldContent += "<\/table>\n";
    
    var gameFieldElement = document.getElementById("gameField");
    gameFieldElement.innerHTML = gameFieldContent;
    
    prepareBalls();
    doTurn();
}


/*
 * Displays score and starts new game or closes browser window if user doesn't wish to play more
 */
function gameOver() {
    alert("Game over!\n Your score is: " + this.score);
    if ( window.confirm("Do you wish to exit now?") ) {
        window.close();
    } else {
        startNewGame(this.cols, this.rows, this.balls);
    }
}

// ============================================================================================================================= //



/* ######################################################################################################## */
/*                                               Debug functions                                            */
/* ######################################################################################################## */

/*
 * Prints matrix into special DIV element on the page
 * matrix - matrix to print
 */
function debugMatrix(matrix) {
    var p = "";
    for ( var i = 0; i < matrix.length; i++ ) {
        for ( var j = 0; j < matrix[0].length; j++ ) {
            p += LZ(matrix[i][j]) + "&nbsp;&nbsp;";
        }
        p += "<br />"
    }
    var debugDiv = document.getElementById('debug');
    debugDiv.innerHTML = p;
}

/*
 * Prints array into special DIV element on the page
 * a - array to print
 */
function debugArray(a) {
    var p = "";
    for ( var i = a.length - 1; i >= 0; i-- ) {
        p += "(" + a[i].x + ", " + a[i].y + "),&nbsp;&nbsp;";
    }
    var debugDiv = document.getElementById('debug');
    debugDiv.innerHTML = p;
}
