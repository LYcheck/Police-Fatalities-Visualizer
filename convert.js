//simple script to convert the imported csv, semi-colon delimited, to json

const csvToJson = require("convert-csv-to-json");
const input = './policeFatalities.csv';
const output = './public/fatalityData.json';

csvToJson.fieldDelimiter(';').formatValueByType().generateJsonFileFromCsv(input, output);