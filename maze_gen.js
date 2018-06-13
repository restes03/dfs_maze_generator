/** JavaScript DFS maze-generator
 * @author	Russell Estes
 * @date	06-10-2018
 * This software is produced as open-source
 * and released under the Mozilla Public License (2.0).
*/


// TODO:

// 1. 	write method to solve maze
// 2. 	maze map should store bitwise value to indicate open doors
// 2a.	Pass word (4-letter?) as seed value to shuffle so mazes can be regenerated
// 2b. 	After maze is generated, load maze_index[][] into JSON
// 3b. 	Write method to generate maze by feeding JSON
// 5. 	Add objects to maze
// 6. 	Add animation and effects to maze




 
 
/** Global Variables **/

// Index of cell ID's
// Made two-dimensional in init()
var maze_index = [];

// Stores bitwise values for each cell indicating open doors
// Made two-dimensional in init()
var maze_map = [];

// Used by carve_maze and solve_maze to track visited cells
var visited_list = ["0x0"];

// Using an enum simplifies the process of randomizing/shuffling
// directions to traverse.

var DIRECTION = Object.freeze({
    "N": 0,
    "S": 1,
    "E": 2,
    "W": 3
});



/** Function init() 
 * Gets user input, initializes maze_index[][], and calls gen_maze()
 */					
function init() {

    // get inputs
    var rows = document.getElementById("input_height").value;
    var cols = document.getElementById("input_width").value;

    // initialize maze map
    for (var i = 0; i < rows; i++) {
        maze_index.push(new Array(cols));
        maze_map.push(new Array(cols));
        for (var j = 0; j < cols; j++) {
            maze_index[i][j] = 0;
            maze_map[i][j] = 0;
        }
    }

    // Generate grid
    gen_maze(rows, cols);

	// Carve maze through grid
	carve_maze("0x0");

}


/** Function gen_maze(rows, cols)
 * Generates a grid of cells which form the fundamental
 * structure of a maze.
 * 
 * @param	rows	Number of rows to include in the grid.
 * @param	cols	Number of columns to include in the grid.
 * 
 * 
 */

function gen_maze(rows, cols) {
    // cells are 30px each having left and right borders
    // of 1px each. Total maze width is then:
    maze_width = cols * 32;

    // create fill area to insert cells,
    // then set id & class
    var maze_container = document.createElement('div');
    maze_container.setAttribute("id", "maze_container");
    document.body.appendChild(maze_container);
    document.body.replaceChild(maze_container, maze_container);
    maze_container.style.width = maze_width + "px";

    // generate grid having rows x cols
    for (var i = 0; i < rows; i++) {
        // Create first row...
        var row = document.createElement('div');
        row.setAttribute("class", "row");
        maze_container.appendChild(row);
        row.style.width = maze_width + "px";

        // Fill row with cells...
        for (var j = 0; j < cols; j++) {
            var temp = document.createElement('span');

            // We want to be able to identify individual cells,
            // so assign each an ID having form "row# col#"
            var id_string = i + "x" + j;
            temp.setAttribute("id", id_string);
            temp.setAttribute("class", "cell");
            row.appendChild(temp);

            // Map the maze
            maze_index[i][j] = id_string;
        }
    }
} // end gen_maze()



/** Function carve_maze(current_cell_index)
 * Carves a path from starting cell at 0x0 to a 
 * random endpoint.
 * 
 * @param	current_cell_index	The index of the current cell
 * 					having form '1x4' where 1 is the row
 * 					number and 4 is the column number. 
 */
function carve_maze(current_cell_index) {

    /** Depth-first traversal
	*
	* Steps:
	*
	*	1)	Choose a starting point in the field.
	*	2)	Randomly choose a wall at that point and carve
	*		a passage through to the adjacent cell, but only
	* 		if the adjacent cell has not been visited yet.
	* 		This becomes the new current cell.
	* 	3)	If all adjacent cells have been visited, back up
	* 		to the last cell that has uncarved walls and repeat.
	* 	4)	The algorithm ends when the process has backed all
	* 		the way up to the starting point.
    *	
    * Source:
    * 	http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking
    **/

	// randomize a list of four directions 
	// TODO: At most, only three directions are possible.
    var directions = shuffle([DIRECTION.N, DIRECTION.S, DIRECTION.E, DIRECTION.W]);
    
		for (var i = 0; i < directions.length; i++) {
	        var new_cell_index = getNeighbor(current_cell_index, directions[i]);
	        if (new_cell_index != "-1x-1") {
	            // remove borders between cells...
	            open(current_cell_index, new_cell_index, directions[i]);
	            carve_maze(new_cell_index);
	        }
	        else {	// neighboring cell is invalid. Try next.
				continue;
			}
	    }
} // end carve_maze




/** Function getNeighbor(current_cell_index, direction)
 * Returns maze_index[][] index of current_cell_index's <direction> neighbor,
 * 
 * @param          current_cell_index	maze_index[][] index of current cell
 * @param          direction		Direction to look for neighbor.  
 * @return         new_cell_index	maze_index index of neighboring cell
 * 					value is of form "row col" where 'row' and
 * 					'col' are integers.
 */

function getNeighbor(current_cell_index, direction) {

    var new_cell_index;
    var temp = current_cell_index.split("x");
    var row = Number(temp[0]);
    var col = Number(temp[1]);
   
    switch (direction) {
        case DIRECTION.N: // North
            {
				if ((row-1) >= 0 && (row-1) < maze_index.length) {
					if (col >= 0 && col < maze_index[0].length) {
		                if (!visited_list.includes(maze_index[row-1][col])) {
		                    new_cell_index = maze_index[row-1][col];
		                    visited_list.push(new_cell_index);
		                    return new_cell_index;
						} 
						else {
							new_cell_index = "-1x-1";
						}
					} 
					else {
						new_cell_index = "-1x-1";
					}
                } 
                else { 
                    new_cell_index = "-1x-1";
                }
                return new_cell_index;
                break;
            }
        case DIRECTION.S: // South
            {
				if ((row+1) >= 0 && (row+1) < maze_index.length) {
					if (col >= 0 && col < maze_index[0].length) {
		                if (!(visited_list.includes(maze_index[row+1][col]))) {
		                    new_cell_index = maze_index[row+1][col];
							visited_list.push(new_cell_index);
		                    return new_cell_index;
						} 
						else {
							new_cell_index = "-1x-1";
						}visited_list
					} 
					else {
						new_cell_index = "-1x-1";
					}
                } 
                else { 
                    new_cell_index = "-1x-1";
                }
                return new_cell_index;
                break;
            }
        case DIRECTION.E: // East
            {
				if (row >= 0 && row < maze_index.length) {
					if ((col+1) >= 0 && (col+1) < maze_index[0].length) {
		                if (!visited_list.includes(maze_index[row][col+1])) {
		                    new_cell_index = maze_index[row][col+1];
		                    visited_list.push(new_cell_index);
		                    return new_cell_index;
						} 
						else {
							new_cell_index = "-1x-1";
						}
					} 
					else {
						new_cell_index = "-1x-1";
					}
                } 
                else { 
                    new_cell_index = "-1x-1";
                }
                return new_cell_index;
                break;
            }
        case DIRECTION.W: // West
            {
				if (row >= 0 && row < maze_index.length) {
					if ((col-1) >= 0 && (col-1) < maze_index[0].length) {
		                if (!visited_list.includes(maze_index[row][col-1])) {
		                    new_cell_index = maze_index[row][col-1];
		                    visited_list.push(new_cell_index);
		                    return new_cell_index;
						} 
						else {
							new_cell_index = "-1x-1";
						}
					} 
					else {
						new_cell_index = "-1x-1";
					}
                } 
                else { 
                    new_cell_index = "-1x-1";
                }
                return new_cell_index;                
                break;
            }
        default: // Invalid input
            {
                new_cell_index = "-1x-1";
            }
            return new_cell_index;
    }

}


/** Function open(current_cell_index, new_cell_index, direction)
 * This function performs two things: 
 * 	1) Opens walls standing between two cells. 
 * 	2) Cells are mapped using a bitwise value (maze_map[][]);
 * 
 *
 * @param	current_cell_index	index of starting cell
 * @param	new_cell_index		index of ending cell
 * @param	direction		direction from current cell to open
 *
 */

function open(current_cell_index, new_cell_index, direction) {
	

	
	var current_cell = document.getElementById(current_cell_index);
	var new_cell = document.getElementById(new_cell_index);
	
	var temp = current_cell_index.split("x");
    var cc_row = Number(temp[0]);
    var cc_col = Number(temp[1]);
	
	temp = new_cell_index.split("x");
	var nc_row = Number(temp[0]);
    var nc_col = Number(temp[1]);



	switch (direction) {
		case DIRECTION.N:
		{
			// open wall between cells
			current_cell.className += " openNorth";
			new_cell.className += " openSouth";
			
			// add cell doors to map
			maze_map[cc_row][cc_col] += 1;	// +1 for North
			maze_map[nc_row][nc_col] += 2;	// +2 for South
			break;
		}
		case DIRECTION.S:
		{
			current_cell.className += " openSouth";
			new_cell.className += " openNorth";
			
			maze_map[cc_row][cc_col] += 2;	// +2 for South
			maze_map[nc_row][nc_col] += 1;	// +1 for North
			break;
		}
		case DIRECTION.E:
		{
			current_cell.className += " openEast";
			new_cell.className += " openWest";
						
			maze_map[cc_row][cc_col] += 4;	// +4 for East
			maze_map[nc_row][nc_col] += 8;	// +8 for West
			break;
		}
		case DIRECTION.W:
		{
			current_cell.className += " openWest";
			new_cell.className += " openEast";
			
			maze_map[cc_row][cc_col] += 8;	// +8 for West
			maze_map[nc_row][nc_col] += 4;	// +4 for East
			break;
		}
	}

    
    
}	// end open()


function solve_maze() {

	// color current cell since its part of path
	document.getElementById(current_cell_index).style.backgroundColor = "hotpink"
			
	var temp = current_cell_index.split("x");
    var cc_row = Number(temp[0]);
    var cc_col = Number(temp[1]);
	
    
/** solve maze algorithm (pseudo-code) 

function solve_maze() {
	// where to declare solved?
	if (solved) {
		return;
	}
	else if (current_cell_index == "ROWSxCOLS") {
		solved = true;
		return;
	}

	else {
		switch(condition) {
			case 1:	//	north open
		
				solve_maze(getNeighbor(current_cell_index, north);
		
			case 2:	//	south open
			
				solve_maze(getNeighbor(current_cell_index, south);
			
			case 3:	//	east open
			
				solve_maze(getNeighbor(current_cell_index, east);
			
			case 4:	//	west open
			
				solve_maze(getNeighbor(current_cell_index, west);
		}
	}
}
 
**/

}	// end solve_maze()



// *********************
/** Helper functions **/
// *********************



/** Function shuffle(directions)
 * Shuffles an array of 4 integers
 *
 * @param	directions		Contains 4 integers representing
 * 					four possible directions on a grid
 *					in no particular order: N, S, E, and W.
 * @return	directions_randomized	An array of shuffled integer values.
 * 
 */

function shuffle(directions) {

var directions_randomized = [];
var max = Math.max(...directions);
var min = Math.min(...directions);	// what about negative values??

	for (var i = 0; i < directions.length; i++) {
		var random_int = Math.floor(Math.random() * (max - min + 1) ) + min;
		if (directions_randomized.includes(random_int)) {
			i--;
		} 
		else {
			directions_randomized.push(random_int);
		}
	}
	return directions_randomized;
}


