import $ from 'jquery';
import {parseCode,buildGraph} from './code-analyzer';
import * as viz from 'viz.js';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let argValue = $('#argValue').val();
        let parsedCode = parseCode(codeToParse);
        let graph = buildGraph (codeToParse ,parsedCode, argValue);
        let v = viz('digraph{'+ graph + '}');
        $('#show').html(v);
    });

});


