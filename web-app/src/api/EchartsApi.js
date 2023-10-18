import * as Constants from '../api/Constants';

const DEFAULT_COLOR_PALETTE = [
  "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", 
  "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", 
  "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", 
  "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"
];

const VINTAGE_COLOR_PALETTE = ['#d87c7c','#919e8b', '#d7ab82', '#6e7074', 
  '#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'
];

const ROMA_COLOR_PALETTE = ['#E01F54','#001852','#f5e8c8','#b8d2c7','#c6b38e',
  '#a4d8c2','#f3d999','#d3758f','#dcc392','#2e4783',
  '#82b6e9','#ff6347','#a092f1','#0a915d','#eaf889',
  '#6699FF','#ff6666','#3cb371','#d5b158','#38b6b6'
];


const MACARONS_COLOR_PALETTE = [
  '#2ec7c9','#b6a2de','#5ab1ef','#ffb980','#d87a80',
  '#8d98b3','#e5cf0d','#97b552','#95706d','#dc69aa',
  '#07a2a4','#9a7fd1','#588dd5','#f5994e','#c05050',
  '#59678c','#c9ab00','#7eb00a','#6f5553','#c14089'
];

const SHINE_COLOR_PALETTE = [
  '#c12e34','#e6b600','#0098d9','#2b821d',
  '#005eaa','#339ca8','#cda819','#32a487'
];

export const keyValueToLegendSeries = (key, value, data) => {
  const legendData = [];
  const seriesData = [];
  if (key !== undefined && value !== undefined) {
    for (let i = 0; i < data?.length; i++) {
      const row = data[i];
      legendData.push(row[key]);
      seriesData.push({
        name: row[key],
        value: row[value]
      });
    }
  }
  return {
    legendData,
    seriesData
  }
}

export const getColorPlatte = (name) => {
  if (name === Constants.VINTAGE) {
    return VINTAGE_COLOR_PALETTE;
  } else if (name === Constants.ROMA) {
    return ROMA_COLOR_PALETTE;
  } else if (name === Constants.MACARONS) {
    return MACARONS_COLOR_PALETTE;
  } else if (name === Constants.SHINE) {
    return SHINE_COLOR_PALETTE
  }
  return DEFAULT_COLOR_PALETTE;
}


export const dataListToGrid = (dataList = [], xAxis, yAxis, legend, defaultValue = 0) => {
  const legendData = new Set();
  const xAxisData = new Set();

  for (let i = 0; i < dataList.length; i++) {
    const row = dataList[i];
    const xAxisVal = row[xAxis];
    const legendVal = row[legend];
    xAxisData.add(xAxisVal);
    legendData.add(legendVal);
  }

  const legendList = Array.from(legendData);
  const xAxisList = Array.from(xAxisData);

  // Row: legend, Column: xAxis
  const grid = new Array(legendList.length);
  for (let i = 0; i < grid.length; i++) { 
    grid[i] = new Array(xAxisList.length); 
    grid[i].fill(defaultValue);
  } 

  // Empty element in the grid is undefined.
  for (let i = 0; i < dataList.length; i++) {
    const row = dataList[i];
    const x = legendList.findIndex(val => val === row[legend]);
    const y = xAxisList.findIndex(val => val === row[xAxis]);
    grid[x][y] = row[yAxis];
  }

  return {
    legendList,
    xAxisList,
    grid
  };
}

export const parseLegendData = (legendData) => {
  if (legendData !== null) {
    const list = legendData || [];
    const dataList = list.map(val => String(val)); 
    return {
      data: dataList
    }
  } else {
    return {};
  }
}