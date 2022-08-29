const datasets = {
    videogames: {
      title: 'Video Game Sales',
      description: 'Top 100 Most Sold Video Games Grouped by Platform',
      file_path: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json" 
    },
    movies: {
      title: 'Movie Sales',
      description: 'Top 100 Highest Grossing Grouped by Genre',
      file_path: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
    },
    kickstarter: {
     title: 'Kickstarter Pledges',
      description: 'Top 100 Most Pledged Kickstarter Campaigns  Grouped by Category',
      file_path: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
  }
  };
  
  const defaultDataset = 'videogames';
  
  var urlParams = new URLSearchParams(window.location.search);
  
  const dataset = datasets[urlParams.get('data') || defaultDataset];
  
  const createTitles = () => {      
      document.getElementById('title').innerHTML = dataset.title;
      document.getElementById('description').innerHTML = dataset.description;
  };
  
  const createTooltip = () => {
    return d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip')
      .attr('class', 'd3-tip')
      .html( function (d) {
         return d;
       });
  };
  
  const createLegend = ( colorScale, categories ) => {
     
   /* categories = categories.filter(function (category, index, self){
      return self.indexOf(category) === index;
    });*/
    
    var legend = d3.selectAll('#legend');
    
    var legendWidth = +legend.attr('width');
    
    const legendOffset = 10,
          //legendCircleSize = 15,
          legendRectSize = 15,
          legendVSpacing = 10,
          legendHSpacing = 150,
          legendXText = 10,
          //legendYText = 5;        
          legendYText = -3;
    
    var legendRow = Math.floor(legendWidth / legendHSpacing);
    
    var legendItems = legend.append('g')
              .attr('transform','translate(80,' 
                     + legendOffset +')')
              .selectAll('g')
              .data(categories)
              .enter()
              .append('g')
              .attr('transform', function (d, i) {
          return (
            'translate(' +
            (i % legendRow) * legendHSpacing +
            ',' +
            (Math.floor(i / legendRow) * legendRectSize +
              legendVSpacing * Math.floor(i / legendRow)) +
            ')'
          );
              });  
    
    /*legendItems.append('circle')
                .attr('cx', legendCircleSize)
                .attr('cy', legendCircleSize)
                .attr('r', legendCircleSize/2)*/
    legendItems.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .attr('class', 'legend-item')
                .attr('fill', d => colorScale(d));
    
    legendItems.append('text')
              .attr('x', legendRectSize + legendXText)
              .attr('y', legendRectSize + legendYText)
              .text(d => d);
  };
  
  const drawTreeMap = (data) => {
    
    var colors = d3.schemePaired;
    var colorMore = [ "#CACFD2", "#808080", "#D81B60","#5E35B1","#FFC300", "#FFFF00", "#008080", "#000080"];
    colorMore.forEach(element => colors.push(element));
   colors= colors.reverse();
    
    const categories = data.children.map(d=>d.name); 
    
    const colorScale = d3.scaleOrdinal() // the scale function
          
                       .domain(categories) // the data
                       .range(colors);    // the way the data should be shown 
      
    var svgContainer = d3.selectAll('#tree-map'),
        width = +svgContainer.attr('width'),
        height = +svgContainer.attr('height');     
    
    //create a treemap
    var treemap = d3
            .treemap()
            .size([width, height])
            .paddingInner(1);
    
    //d3.hierarchy take data and add to it: depth, height, and parent
    const hierarchy = d3
           .hierarchy(data)
           .eachBefore(function (d) {
             d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name; 
           })
           .sum(d=>d.value)  //sum every child's values
           .sort(function (a,b) { return (b.height-a.height || b.value-a.value); }) // and sort them in descending order
    
    //pass data the treemap
    const root = treemap(hierarchy);
    //console.log(root.leaves());
    
    var cell = svgContainer
                .selectAll('g')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('class', 'group')
                .attr('transform', d => 'translate(' + d.x0 +', ' + d.y0 + ')');
    
    cell.append('rect')
      .attr('id', d => d.data.id)
      .attr('class', 'tile')    
      .attr("width",  d=>d.x1 - d.x0)
      .attr("height", d=>d.y1 - d.y0)
      .attr('data-name', d => d.data.name)
      .attr('data-category', d=> d.data.category)
      .attr('data-value', d => d.data.value)    
      .attr('fill', d => colorScale(d.data.category)
       )
      .on( 'mousemove', (e,d) => {
          var str = "Name: "+ d.data.name 
                + "<br>Category: "+ d.data.category 
                + "<br>Value: "+ d.data.value;
      
          d3.selectAll('#tooltip')
           .style('opacity', 0.9)
           .style('left', e.pageX + 10 + 'px')
           .style('top', e.pageY -28 + 'px')
           .html(str)
           .attr('data-value', d.data.value)
      })
      .on( 'mouseout', (e, d) => {
          d3.selectAll('#tooltip')
            .style('opacity', 0)
            .style('left', 0)
            .style('top', 0); 
      });  
    
    //add text in cell
    cell.append('text')
        .attr('class', 'tile-text')
        .selectAll('tspan')
        .data( d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append('tspan')
        .attr('x', 5)
        .attr('y', (d, i) => 10+i*10)
        .text(d => d);
    
    createLegend( colorScale, categories);
  };
  
  const createTreeMap = () => {
    createTitles();
    createTooltip();
    //get Data
    d3.json(dataset.file_path)
      .then((data) => {
         drawTreeMap(data);
       })
      .catch((err) => console.log(err));   
  };
  
  createTreeMap();