import assert from 'assert';
import {parseCode, buildGraph} from '../src/js/code-analyzer';

let func1 = 'function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = 2 + y;\n' +
    '   let c = z;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n';
let ans1 = '"n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
    'n2 [label="  b = 2 + y", shape="rectangle" style=filled, color=green ]\n' +
    'n3 [label="  c = z", shape="rectangle" style=filled, color=green ]\n' +
    'n4 [label="a < z", shape="diamond" style=filled, color=green ]\n' +
    'n5 [label="c = a + b", shape="rectangle" style=filled, color=green ]\n' +
    'n6 [label="z = c * 2", shape="rectangle" style=filled, color=green ]\n' +
    'n7 [label="a++", shape="rectangle" style=filled, color=green ]\n' +
    'n8 [label="return z", shape="rectangle" style=filled, color=green ]\n' +
    'n1 -> n2 []\n' +
    'n2 -> n3 []\n' +
    'n3 -> n4 []\n' +
    'n4 -> n5 [label="true"]\n' +
    'n4 -> n8 [label="false"]\n' +
    'n5 -> n6 []\n' +
    'n6 -> n7 []\n' +
    'n7 -> n4 []\n' +
    '"';

describe('The javascript parser', () => {

    it('is parsing an empty function correctly', () => {
        let func1 = 'function foo(x, y){\n' +
            '   let a = x + 1;\n' +
            '}\n';

        let p = parseCode(func1);
        let length = buildGraph(func1, p, '1, 2');
        let ans1 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n';

        assert.equal(length,ans1);
    });


    it('is parsing an empty function correctly', () => {
        let func2 = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = a + 2;}\n' +
            '   else if (b < z * 3) {\n' +
            '        c = c + y + 1;}\n' +
            '     else {\n' +
            '        c = c + x + 2;}\n' +
            ' \n' +
            '    return c;\n' +
            '}\n';
        let p = parseCode(func2);
        let length = buildGraph(func2, p, '1, 2, 4');
        let ans2 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = a + y", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="  c = 0", shape="rectangle" style=filled, color=green ]\n' +
            'n4 [label="b < z", shape="diamond" style=filled, color=green ]\n' +
            'n5 [label="c = a + 2", shape="rectangle" ]\n' +
            'n6 [label="return c", shape="rectangle" style=filled, color=green ]\n' +
            'n7 [label="b < z * 3", shape="diamond" style=filled, color=green ]\n' +
            'n8 [label="c = c + y + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n9 [label="c = c + x + 2", shape="rectangle" ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n7 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n9 [label="false"]\n' +
            'n8 -> n6 []\n' +
            'n9 -> n6 []\n' +
            '';

        assert.equal(length,ans2);
    });



    it('test 3 - else', () => {
        let func3 = 'function foo(x, y, z){\n' +
            '    let a = 3 - x;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = a + 2;}\n' +
            '   else if (b < z * 3) {\n' +
            '        c = c + y + 1;}\n' +
            '     else {\n' +
            '        c = c + x + 2;}\n' +
            ' \n' +
            '    return c;\n' +
            '}';
        let p = parseCode(func3);
        let length = buildGraph(func3, p, '1, 2, 0');
        let ans3 = 'n1 [label="  a = 3 - x", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = a + y", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="  c = 0", shape="rectangle" style=filled, color=green ]\n' +
            'n4 [label="b < z", shape="diamond" style=filled, color=green ]\n' +
            'n5 [label="c = a + 2", shape="rectangle" ]\n' +
            'n6 [label="return c", shape="rectangle" style=filled, color=green ]\n' +
            'n7 [label="b < z * 3", shape="diamond" style=filled, color=green ]\n' +
            'n8 [label="c = c + y + 1", shape="rectangle" ]\n' +
            'n9 [label="c = c + x + 2", shape="rectangle" style=filled, color=green ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n7 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n9 [label="false"]\n' +
            'n8 -> n6 []\n' +
            'n9 -> n6 []\n' +
            '';
        assert.equal(length,ans3);
    });


    it('test 4 - while', () => {
        let func4 = 'function foo(x, y, z){\n' +
            '   let a = x + 1;\n' +
            '   let b = a + y;\n' +
            '   \n' +
            '   while (a < z) {\n' +
            '       b = b + 2 ; \n' +
            '       a++;\n' +
            '   }\n' +
            '   \n' +
            '   return z;\n' +
            '}\n';
        let p = parseCode(func4);
        let length = buildGraph(func4, p, '1, 2, 4');
        let ans4 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = a + y", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="a < z", shape="diamond" style=filled, color=green ]\n' +
            'n4 [label="b = b + 2", shape="rectangle" style=filled, color=green ]\n' +
            'n5 [label="a++", shape="rectangle" style=filled, color=green ]\n' +
            'n6 [label="return z", shape="rectangle" style=filled, color=green ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n5 []\n' +
            'n5 -> n3 []\n' +
            '';
        assert.equal(length,ans4);
    });

    it('test 5 - while - not go inside', () => {
        let func5 = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = y + x ;\n' +
            '\n' +
            '    while (a < z) {\n' +
            '        b = b + 2 ;\n' +
            '        a++;}\n' +
            '\n' +
            '    return z;}';
        let p = parseCode(func5);
        let length = buildGraph(func5, p, '1, 2, 0');
        let ans5 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = y + x ", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="a < z", shape="diamond" style=filled, color=green ]\n' +
            'n4 [label="b = b + 2", shape="rectangle" ]\n' +
            'n5 [label="a++", shape="rectangle" ]\n' +
            'n6 [label="return z", shape="rectangle" style=filled, color=green ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n5 []\n' +
            'n5 -> n3 []\n' +
            '';
        assert.equal(length,ans5);
    });


    it('test 6 - else', () => {
        let func6 = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = x + y ; \n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        a = 1;}\n' +
            '     else {\n' +
            '       a = 2;}\n' +
            '    \n' +
            '    return a;\n' +
            '}\n';
        let p = parseCode(func6);
        let length = buildGraph(func6, p, '1, 2, 0');
        let ans6 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = x + y ", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="b < z", shape="diamond" style=filled, color=green ]\n' +
            'n4 [label="a = 1", shape="rectangle" ]\n' +
            'n5 [label="return a", shape="rectangle" style=filled, color=green ]\n' +
            'n6 [label="a = 2", shape="rectangle" style=filled, color=green ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n5 []\n' +
            'n6 -> n5 []\n' +
            '';
        assert.equal(length,ans6);
    });


    it('test 7 - if', () => {
        let func7 = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = x + y ; \n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        a = 1;}\n' +
            '     else {\n' +
            '       a = 2;}\n' +
            '    \n' +
            '    return a;\n' +
            '}\n';
        let p = parseCode(func7);
        let length = buildGraph(func7, p, '1, 2, 7');
        let ans7 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = x + y ", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="b < z", shape="diamond" style=filled, color=green ]\n' +
            'n4 [label="a = 1", shape="rectangle" style=filled, color=green ]\n' +
            'n5 [label="return a", shape="rectangle" style=filled, color=green ]\n' +
            'n6 [label="a = 2", shape="rectangle" ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n5 []\n' +
            'n6 -> n5 []\n' +
            '';
        assert.equal(length,ans7);
    });


    it('test 8 - if', () => {
        let func8 = '    function foo(x, y, z){\n' +
            '        let a = x + 1;\n' +
            '        let b = x + y ;\n' +
            '\n' +
            '        if (b < z) {\n' +
            '            a = b;}\n' +
            '        else {\n' +
            '            a = z;}\n' +
            '\n' +
            '        return a;\n' +
            '    }\n';
        let p = parseCode(func8);
        let length = buildGraph(func8, p, '1, 2, 7');
        let ans8 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = x + y ", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="b < z", shape="diamond" style=filled, color=green ]\n' +
            'n4 [label="a = b", shape="rectangle" style=filled, color=green ]\n' +
            'n5 [label="return a", shape="rectangle" style=filled, color=green ]\n' +
            'n6 [label="a = z", shape="rectangle" ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n5 []\n' +
            'n6 -> n5 []\n' +
            '';
        assert.equal(length,ans8);
    });


    it('test 9 - if', () => {
        let func9 = 'function foo(x, y, z){\n' +
            '        let a = x + 1;\n' +
            '        let b = x + y ;\n' +
            '\n' +
            '        while (y<z){\n' +
            '            y++ ;\n' +
            '            b ++ ;\n' +
            '        }\n' +
            '\n' +
            '        if (b < z) {\n' +
            '            a = b;}\n' +
            '        else {\n' +
            '            a = z;}\n' +
            '\n' +
            '        return a;\n' +
            '    }';
        let p = parseCode(func9);
        let length = buildGraph(func9, p, '1, 2, 7');
        let ans9 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = x + y ", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="y<z", shape="diamond" style=filled, color=green ]\n' +
            'n4 [label="y++", shape="rectangle" style=filled, color=green ]\n' +
            'n5 [label="b ++", shape="rectangle" style=filled, color=green ]\n' +
            'n6 [label="b < z", shape="diamond" style=filled, color=green ]\n' +
            'n7 [label="a = b", shape="rectangle" style=filled, color=green ]\n' +
            'n8 [label="return a", shape="rectangle" style=filled, color=green ]\n' +
            'n9 [label="a = z", shape="rectangle" ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n5 []\n' +
            'n5 -> n3 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n9 [label="false"]\n' +
            'n7 -> n8 []\n' +
            'n9 -> n8 []\n' +
            '';
        assert.equal(length,ans9);
    });


    it('test 10 - if', () => {
        let func10 = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = x + y ; \n' +
            '    \n' +
            'while (y<z){\n' +
            'y++ ; \n' +
            'b ++ ; }\n' +
            '\n' +
            '    if (b < z) {\n' +
            '        a = b;}\n' +
            '     else {\n' +
            '       a = z;}\n' +
            '    \n' +
            '    return a;\n' +
            '}\n';
        let p = parseCode(func10);
        let length = buildGraph(func10, p, '1, 2, 1');
        let ans10 = 'n1 [label="  a = x + 1", shape="rectangle" style=filled, color=green ]\n' +
            'n2 [label="  b = x + y ", shape="rectangle" style=filled, color=green ]\n' +
            'n3 [label="y<z", shape="diamond" style=filled, color=green ]\n' +
            'n4 [label="y++", shape="rectangle" ]\n' +
            'n5 [label="b ++", shape="rectangle" ]\n' +
            'n6 [label="b < z", shape="diamond" style=filled, color=green ]\n' +
            'n7 [label="a = b", shape="rectangle" ]\n' +
            'n8 [label="return a", shape="rectangle" style=filled, color=green ]\n' +
            'n9 [label="a = z", shape="rectangle" style=filled, color=green ]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n5 []\n' +
            'n5 -> n3 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n9 [label="false"]\n' +
            'n7 -> n8 []\n' +
            'n9 -> n8 []\n' +
            '';
        assert.equal(length,ans10);
    });








});








