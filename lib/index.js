var _ = require('lodash');
var Parser = require('htmlparser2').Parser;

var ATTRIBUTE_MAPPING = {
    'for': 'htmlFor',
    'class': 'className'
};

var ELEMENT_ATTRIBUTE_MAPPING = {
    'input': {
        'checked': 'defaultChecked',
        'value': 'defaultValue'
    }
};

function ItemList(parent) {
    this.parent = parent;
    this.content = '';
    this.spacer = '';
    this.indent = parent ? parent.indent : '';
    this.isFirstItem = true;
}

ItemList.prototype.addSpace = function (space) {
    this.spacer += space;

    if (space.indexOf("\n") !== -1) {
        // reset indent when there are new lines
        this.indent = /[^\n]*$/.exec(space)[0];
    } else {
        // otherwise keep appending to current indent
        this.indent += space;
    }
}

ItemList.prototype.add = function (data, ignoreComma) {
    if (!ignoreComma) {
        if (!this.isFirstItem) {
            this.content += this.spacer.length ? ',' : ', ';
        }

        this.isFirstItem = false;
    }

    this.content += this.spacer;
    this.spacer = '';

    this.content += data;
}

function html2jsx(html, cb) {
    var currentItemList = new ItemList(null);
    var elementStack = [];

    var parser = new Parser({
        onopentag: function (name, attribs) {
            currentItemList = new ItemList(currentItemList);
            elementStack.unshift([ name, attribs ]);
        },
        ontext: function (text) {
            currentItemList.add(JSON.stringify(text));
        },
        onclosetag: function (tagname) {
            var element = elementStack.shift();
            var elementContent = currentItemList.content + currentItemList.spacer;
            var elementTag = element[0];
            var elementAttribs = element[1];

            currentItemList = currentItemList.parent;
            var indent = currentItemList.indent;

            // Generate list of attributes with correct keys
            var attribs = _.chain(elementAttribs)
                .map(function(value, key) {
                    key = ATTRIBUTE_MAPPING[key] || key;
                    if (ELEMENT_ATTRIBUTE_MAPPING[elementTag]) key = ELEMENT_ATTRIBUTE_MAPPING[elementTag][key] || key;

                    return JSON.stringify(key) + ': ' + JSON.stringify(value);
                })
                .compact()
                .value();

            var item = 'React.createElement(' + JSON.stringify(elementTag) + (
                attribs.length
                    ? ", { " + attribs.join(",\n" + indent + '    ') + " }"
                    : ', null'
            ) + (
                elementContent.length
                    ? ', [' + (elementContent[0] === "\n" ? '' : ' ') + elementContent + (elementContent.match(/\s$/) ? '' : ' ') + ']'
                    : ', null'
            ) + ')';

            currentItemList.add(item);
        },
        oncomment: function (text) {
            currentItemList.add('/*' + text + '*/', false);
        },
        onend: function () {
            cb(null, currentItemList.content);
        }
    }, {
        decodeEntities: true
    });

    parser.write(html);
    parser.end();
}


module.exports = html2jsx;
