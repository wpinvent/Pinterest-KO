// 
// Author: Paden Portillo
// Purpose: Learn ko.js, implement a MVVM design pattern,
//          and create a plugin to recreate pinterest.
//

//
// VM: titleViewModel
// Purpose: create a tile and keep track of it's position
//


function tileViewModel(name, width, height, left, top)
{
	var self      =  this;
	var tday      =  new Date();
	self.name     =  ko.observable('http://www.cornify.com/getacorn.php?r=' + tday.getTime() + '&url='+document.location.href);
	self.width    =  ko.observable(width);
	self.height   =  ko.observable(height);
	self.left     =  ko.observable(left);
	self.top      =  ko.observable(top);
	self.getStyle =  ko.computed(function()
	{	
		return {"left"  : self.left()   + 'px', 
				"top"   : self.top()    + 'px', 
				"width" : self.width()  + 'px', 
				"height": self.height() + 'px'};
	});
}

//
// VM: PinterestViewModel
// Purpose: Tile manager. Update/add tiles
//
function PinterestViewModel()
{
	var self          =  this;	
		self.tiles    =  ko.observableArray();
		self.winWidth =  ko.observable(window.innerWidth);

	var rowWidths     =  [],
		columnHeights =  [],
		rowIndex      =  0,
		colIndex      =  0,
		defWidth      =  200,
		defPadding    =  15 + 40, //padding = 15 * 2(left and right) + 15 for margin 
		defOuterWidth =  defWidth + defPadding;

	//recalculate tiles when window is done resizing
	window.onResizeEnd(function()
	{
		self.winWidth(window.innerWidth);

		refreshTilePlacement();
	});

	function refreshTilePlacement()
	{
		rowWidths     =  [];
		columnHeights =  [];
		rowIndex      =  0;
		colIndex      =  0; 

		//adjust tiles that need to be moved by calling the addTile method
		for(var i = 0, tiles = self.tiles(), tile; tile = tiles[i++];)
		{
			self.positionTile(tile);
		}
	} 

	//add a tile into document function
	self.addTile   =  function()
	{
		var	height =  100 + 100 * (Math.floor((Math.random()*20)+1) / 20),
			name   =  'I am ' + self.tiles().length,
			tile   =  new tileViewModel(name, defWidth, height, -defWidth, -height);

		self.positionTile(tile);
		self.tiles.push(tile);
	};
	self.removeTile =  function(tile)
	{
		var indexOfRemove       =  self.tiles.indexOf(tile),
			tileHeightToReplace =  tile.height(),
			found               =  false;

		for(var tiles = self.tiles(), i = tiles.length, ntile; ntile = tiles[--i];)
		{
			if(i == indexOfRemove) { continue; }

			if(ntile.height() <= tileHeightToReplace)
			{
				self.tiles.remove(ntile);
				ntile.height(tileHeightToReplace);
				self.tiles.splice(indexOfRemove, 1, ntile);
				
				found =  true; break;
			}
		}

		if(!found)
		{
			self.tiles.remove(tile);
		}

		refreshTilePlacement();
	}
	self.positionTile   =  function(tile)
	{
		if(typeof rowWidths[rowIndex] === 'undefined')
		{
			//start new row with width of window
			//converge to zero when width used by tiles
			rowWidths[rowIndex] =  self.winWidth();
		}
		else if(rowWidths[rowIndex] - defOuterWidth <= 0) 
		{	//when space for next tile cannot fit
			rowIndex++;     //next row 
			colIndex = 0;   //column zero
							//recurse to start new row
			return self.positionTile(tile); 
		}

		if(typeof columnHeights[colIndex] === 'undefined')
		{	//New column, keep track of column height
			columnHeights[colIndex] =  defPadding;
		}

		tile.left(colIndex * defOuterWidth);
		tile.top(columnHeights[colIndex]);

		//iterate for next tile
		columnHeights[colIndex] += tile.height() + defPadding;
		rowWidths[rowIndex]     -= tile.width()  + defPadding; 
		colIndex++;  
	};
}
 
$(document).ready(function()
{
	//bind VMs
	var pinterestVM =  new PinterestViewModel();

	ko.applyBindings(pinterestVM);

	for(var i = 0; i <= 50; i++)
	{
		pinterestVM.addTile(); //one for the money!
	}
});