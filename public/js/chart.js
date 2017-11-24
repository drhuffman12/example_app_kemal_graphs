// See "http://c3js.org/examples.html"

var chart_list = {};
var default_width = 570;
var default_height = 300;
var default_x_steps = 1000;
var color_correct = '#007700';
var color_delta = '#ff0000';
var default_x_steps = 1000;
var x_axis_tick_step_width = 100;
var x_axis_tick_step_qty = default_x_steps / x_axis_tick_step_width + 1;
var x_axis_ticks = Array.apply(null, Array(x_axis_tick_step_qty)).map(function (_, i) { return i * x_axis_tick_step_width; });
var x_axis_grid = Array.apply(null, Array(x_axis_tick_step_qty)).map(function (_, i) { return {value: i * x_axis_tick_step_width}; });
var y_axis_tick_step_width = 0.1;
var y_axis_tick_step_qty = 10
var y_axis_grid = Array.apply(null, Array(y_axis_tick_step_qty)).map(function (_, i) { return {value: i * y_axis_tick_step_width}; });

function add_chart(id, title, comment, height, width) { // , corrects, deltas
  console.log({method: 'add_chart', id: id, id_prefixed: 'chart_' + id, title: title, comment: comment, height: height, width: width});

  var chart_wrapper = '<span class="chart_wrapper" id="chart_wrapper_' + id + '"><div class="title">' + title + '</div><div class="chart" id="chart_' + id + '"></div><div class="comment">' + comment + '</div></span>';
  $('#chart_list_area').prepend(chart_wrapper);

  chart_list[id] = c3.generate({
    bindto: '#chart_' + id,
    size: {
      height: height || default_height,
      width: width || default_width
    },
    subchart: {
        show: true
    },
    padding: {
        top: 1,
        right: 25,
        bottom: 1,
        left: 25,
    },
    grid: {
      x: {
        lines:  x_axis_grid
      },
      y: {
        lines: y_axis_grid
      }
    },
    data: {
      type: 'spline',
      x: 'x',
      columns: [],
      axes: {
        x: 'x',
        correct: 'correct',
        delta: 'delta',
      },
      colors: {
        correct: color_correct,
        delta: color_delta
      },
    },
    axis: {
      x: { tick: { values: x_axis_ticks } },
      correct: {
        show: true,
      },
      delta: {
        show: true,
      },
    },
    tooltip: {
      format: {
        title: function (d) { return 'Data ' + d; },
        value: d3.format("0.6f") // apply this format to all
      }
    },
  });

  chart_list[id].axis.range({min: {x: 0}, max: {x: default_x_steps}});
}

function load_chart_data(id, xes, corrects, deltas) {
  console.log({method: 'load_chart_data', id: id, id_prefixed: 'chart_' + id, xes: xes, corrects: corrects, deltas: deltas});
  chart_list[id].load({
    columns: [
      ['x'].concat(xes),
      ['correct'].concat(corrects),
      ['delta'].concat(deltas)
    ]
  });
}

function update_chart(id, title, comment, height, width, xes, corrects, deltas) {
  if(!chart_list.hasOwnProperty(id)){
    add_chart(id, title, comment, height, width);
  }
  load_chart_data(id, xes, corrects, deltas);
  note_updated_area('#chart_wrapper_' + id);
}

function update_chart_example_foo() {
  var id = 'foo';
  var title = 'Foo Chart'
  var comment = 'This is <br/> some comment ... <br/> some comment ... <br/> some comment ... <br/> some comment ...';
  var width = default_width;
  var height = default_height;
  var xes = [10, 20, 30, 40, 50];
  var corrects = [0.1, 0.2, 0.4, 0.3, 0.5];
  var deltas = [0.5, 0.4, 0.3, 0.2, 0.1];
  update_chart(id, title, comment, height, width, xes, corrects, deltas);
}

function update_chart_example_widget() {
  var id = 'widget';
  var title = 'Widget Chart'
  var comment = 'This is <br/> some comment ... <br/> some comment ... <br/> some comment ...';
  var width = default_width;
  var height = default_height;
  var xes = [20, 40, 60, 80, 100];
  var corrects = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
  var deltas = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
  update_chart(id, title, comment, height, width, xes, corrects, deltas);
}

function update_chart_given(json_data) {
  console.log({method: update_chart_given, json_data: json_data});
  var id = json_data["id"].toString();
  var title = json_data["title"].toString();
  var comment = json_data["comment"].toString();
  var width = default_width;
  var height = default_height;
  var xes = json_data["xes"];
  var corrects = json_data["corrects"];
  var deltas = json_data["deltas"];
  update_chart(id, title, comment, height, width, xes, corrects, deltas);
}
