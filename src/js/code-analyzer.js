import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';

export {parseCode,buildGraph};

let params = [] ;
let countStrLine ;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {range:true, loc:true});
};

function buildGraph (sourceCode, parseCode, args) {
    params = new Map();
    countStrLine = 1 ;
    let functionBody =parseCode.body[0].body ;
    let cfg = esgraph(functionBody);
    let graph = esgraph.dot(cfg, {counter:0, source: sourceCode});
    let line = graph.split('\n');
    let myGraphWithOutExp = removeExceptions(line);
    line = myGraphWithOutExp.split('\n');
    let myGraphShaped = shapedGraph(cfg[2], line);
    args = esprima.parseScript (args);
    paramsDec(parseCode.body[0].params, args);
    myGraphShaped = fillInColor(parseCode.body[0].body.body,cfg[2], myGraphShaped);
    return myGraphShaped ;
}


function removeExceptions(line){
    let newGraph = '';
    for (let i = 0; i <line.length ; i++) {
        if(line[i].includes('[color="red", label="exception"]')){
            line[i]='';
        }
        if (line[i].includes('label="let')){
            let splited = line[i].split('let');
            line[i] = splited.join(' ').replace(';', '');}
        if (line[i].includes('label="return'))
            line[i] = line[i].replace(';', '');
        newGraph += line[i] + '\n';
    }
    return newGraph ;
}


function shapedGraph (cfg, line){
    let newGraph = '';
    for (let i = 0 ; i < line.length ; i++){
        let splited = line[i].split(']');
        if (i < cfg.length && cfg[i].astNode!== undefined){
            if (cfg[i].astNode.type === 'BinaryExpression')
                line[i] = splited[0]+ ', shape="diamond" ]' ;
            else line[i] = splited[0]+ ', shape="rectangle" ]' ;}
        newGraph += line[i] +'\n' ;
    }
    return newGraph ;
}


/////////////////////////////////////// CALCULATE PARAMS //////////////////////////////////////

function paramsDec(funcParams, argumentsVal) {
    let k = 0 ;
    while (k < funcParams.length) {
        /*if (argumentsVal.body[0].expression.expressions[k].type === 'ArrayExpression'){
            rigth(argumentsVal.body[0].expression.expressions[k], funcParams[k].name, true) ;}
        else*/ params[funcParams[k].name] = rigth(argumentsVal.body[0].expression.expressions[k], funcParams[k].name, true) ;
        k++;
    }
}

function rigth (parseCode) {
    let state = parseCode.type;
    if (state == 'Literal') {     //number
        return parseCode.value;}
    else if (state == 'Identifier') {     //name
        return parseCode.name;}
    else /*if (state == 'BinaryExpression')*/ {
        return calculateBinary(escodegen.generate(parseCode));}
    //else return rigthCon(parseCode, nameArray, state); ////////, nameArray - params

}

/*function rigthCon (parseCode, nameArray, state){
    if (state === 'MemberExpression'){
        return parseCode.object.name + '[' + rigth(parseCode.property, parseCode.object.name ) + ']' ;}
    return entereArray(parseCode, nameArray);
}*/


function calculateBinary(parseCode) {
    let splitArray = new Array () ;
    splitArray = parseCode.split(' ');
    let str = '';
    for (let c = 0 ; c < splitArray.length ; c++){
        if (params.hasOwnProperty(splitArray[c]))
            splitArray[c] = '( ' + params[splitArray[c]] + ' )';
        str =  str + splitArray[c] + ' ' ;
    }
    return str ;
}


/*function entereArray(parseCode, arrayName){
    let splitArr = parseCode.elements;
    for (let c = 0 ; c <splitArr.length ; c ++){
        let name = arrayName + '['+ c + ']';
        params[name] = rigth(parseCode.elements[c], arrayName);
    }
}
*/


//////////////////////////////// COLOR/////////////////////////////

function fillInColor(parseCode, cfg, line){
    line = line.split('\n');
    let pointers = makePointer(line);
    let label = makeLabel (line);
    label = myParse(parseCode, 0, label);
    let connGraph =  connectedGraph(label, pointers);
    return makeStringGraph (connGraph);
}


function  makePointer(line) {
    let pointer = new Array();
    let k = 0 ;
    for (let i = 0 ; i < line.length ; i++){
        if (line[i].includes('->')) {
            pointer[k] = line[i];
            k++ ;
        }
    }
    return pointer ;
}


function makeLabel (line){
    let k = 0 ;
    let label = new Array();
    for (let i = 0 ; i < line.length ; i++){
        if (line[i].includes('label') && !line[i].includes('->')) {
            label[k] = line[i];
            k++ ;
        }
    }
    return label ;
}


function connectedGraph (label, pointer){
    let connectedGraph = new Array();
    let k = 0 ;
    for (let i = 0 ; i < label.length -1 ; i ++){
        connectedGraph[k] = label[i];
        k++ ;
    }
    let str = ''+ label.length-1 ;
    for (let i = 0 ; i < pointer.length ; i++){
        if (!(pointer[i].includes('n'+str))) {
            connectedGraph[k] = pointer[i];
            k++;
        }
    }
    return connectedGraph ;
}


function addColor(label, countStrLine) {
    let splited = label[countStrLine].split(']');
    splited[0] = splited[0] + 'style=filled, color=green ]';
    label[countStrLine] = splited[0];
    return label ;

}


function makeStringGraph(connGraph) {
    let str = '';
    for (let i = 0 ; i < connGraph.length ; i++){
        if (connGraph[i].includes('n0'))
            continue ;
        str = str + connGraph[i] + '\n' ;
    }

    return str ;
}


function myParse(parseCode,i ,label){
    for (i ; i < parseCode.length ; i++) {
        let statment =  parseCode[i].type;
        if (statment === 'VariableDeclaration'){
            label = variableDec (parseCode,i ,label);
            continue;}
        else if (statment === 'IfStatement') {
            label = ifState(parseCode[i], i, label);
            continue;}
        else if (statment === 'WhileStatement'){
            label = whileState (parseCode[i], i, label);
            continue;}
        else label = myParse2(parseCode,i ,label, statment);
    }
    return label;
}


function myParse2(parseCode,i ,label, statment){
    if (statment =='ReturnStatement'){
        if (countStrLine<label.length)
            label = returnState (parseCode, i, label);}
    else if (statment == 'ExpressionStatement'){
        label = expressState (parseCode, i, label);}
    else /*if (statment === 'BlockStatement')*/{
        myParse(parseCode[i].body, 0, label);}


    return label ;
}


function variableDec(parseCode,i ,label) {
    label = addColor(label, /*parseCode[countStrLine].loc.start.line-1*/ countStrLine);
    params[parseCode[i].declarations[0].id.name] = rigth(parseCode[i].declarations[0].init);
    countStrLine++ ;
    return label ;

}

function ifState(parseCode,i ,label) {
    label = addColor(label,countStrLine);
    countStrLine ++ ;
    if (conditionParseToEval(parseCode)){
        label = myParse(parseCode.consequent.body,0 ,label);
        // if (parseCode.alternate != null && !label[countStrLine].includes('return'))
        //countStrLine+= parseCode.alternate.loc.end - parseCode.alternate.loc.start ;
    }
    else {
        label = ifState2(parseCode, i, label);
    }
    return label ;
}


function ifState2 (parseCode,i ,label){
    countStrLine += (parseCode.consequent.loc.end.line - parseCode.consequent.loc.start.line);
    let returnCount = returnCeck (label);
    if (returnCount == 1)
        label = addColor(label,countStrLine);
    countStrLine++;
    if (parseCode.alternate != null) {
        label = elseState(parseCode.alternate, label);}

    return label ;
}


function elseState (parseCode, label){
    let a=[];
    if (parseCode.type ==='IfStatement'){    //'else if statement'
        label = addColor(label,countStrLine);
        countStrLine++ ;
        if (conditionParseToEval(parseCode)){ //if ELSE IF is green    //label = addColor(label,countStrLine);
            a.push(parseCode.consequent);
            label = myParse(a, 0, label);
            countStrLine += (parseCode.alternate.loc.end.line - parseCode.alternate.loc.start.line);
            return label ;/*countStrLine++ ;*/}
        else //IF RED
            countStrLine += (parseCode.consequent.loc.end.line - parseCode.consequent.loc.start.line) ;}
    else{                      //ELSE statement
        label = addColor(label,countStrLine);
        countStrLine++ ;
        a.push(parseCode);}
    if (parseCode.alternate != null){a.push(parseCode.alternate);}
    label = myParse(a, 0, label);
    return label;}


function whileState (parseCode, i, label){
    label = addColor(label,countStrLine);
    countStrLine ++ ;
    if (conditionParseToEval(parseCode)) {
        myParse(parseCode.body.body,0 ,label);
    }
    else {
        countStrLine += (parseCode.loc.end.line - parseCode.loc.start.line);}
    return label ;

}


function returnState (parseCode, i, label) {
    label = addColor(label, countStrLine);
    countStrLine++ ;
    return label ;
}


function expressState(parseCode, i, label) {
    label =addColor(label, countStrLine);
    if (parseCode[i].expression.type == 'AssignmentExpression')
        params[parseCode[i].expression.left.name] = rigth(parseCode[i].expression.right);
    /*else      //a++ / a-- / a+= / a-=
        updateVal(parseCode, parseCode[i].expression.argument.name);
    */countStrLine++ ;
    return label ;
}
function conditionParseToEval (parseCode) {
    let leftCon = parseCode.test.left;
    let rigthCon = parseCode.test.right;
    let operator = parseCode.test.operator;
    let conditionStr = getValue(leftCon) + operator + getValue(rigthCon);
    return eval(conditionStr) ;
}

function getValue (parseCode) {
    let state = parseCode.type;
    if (state === 'Identifier') {     //name
        return params[parseCode.name];
    }
    if (state === 'Literal') {     //number
        return parseCode.value;}
    else /*if (state === 'BinaryExpression')*/ {
        return '( ' + getValue(parseCode.left) + ' ' + parseCode.operator + ' ' + getValue(parseCode.right) + ' )';
    }
    // else return getValueCon(parseCode, state);
}


/*function getValueCon(parseCode, state) {
    if (state === 'MemberExpression') {
        let key = parseCode.object.name + '[' + getValue(parseCode.property) + ']';
        if (params.hasOwnProperty(key))
            return params[key];
        else return ('( ' + params[key] + ' )');
    }
}
*/

function returnCeck(label){
    let ans = 0 ;
    for (let i = 0 ; i < label.length ; i++){
        if (label[i].includes('return')){
            ans += 1;
        }
    }
    return ans ;
}


/*function updateVal(parseCode, name){
    if (parseCode.operator == '++'){
        params[name] = params[name] + ' + 1'; }
    else if (parseCode.operator == '--'){
        params[name] = params[name] + ' - 1'; }
}*/

