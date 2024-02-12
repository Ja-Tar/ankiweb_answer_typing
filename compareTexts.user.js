// ==UserScript==
// @name        OK
// @namespace   OK
// @match       https://www.test.com/*
// @require     https://rawcdn.githack.com/google/diff-match-patch/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/diff_match_patch.js
// @grant       none
// @version     0.1
// @author      JaTar
// ==/UserScript==

function compareTexts(expected, provided) {
    function renderTokens(tokens) {
        return tokens.map(token => {
            let backgroundType;
            switch (token.kind) {
                case 'Good':
                    backgroundType = 'limegreen';
                    break;
                case 'Bad':
                    backgroundType = 'crimson';
                    break;
                case 'Missing':
                    backgroundType = 'gray';
                    break;
            }
            return `<span style="background:${backgroundType};">${token.text}</span>`;
        }).join('');
    }

    function DiffToken(kind, text) {
        this.kind = kind;
        this.text = text;
    }

    function DiffContext(expected, provided) {
        this.expected = expected;
        this.provided = provided;
    }

    DiffContext.prototype.toTokens = function() {
        let diffMatch = new diff_match_patch();
        let diffs = diffMatch.diff_main(this.provided, this.expected);
        diffMatch.diff_cleanupSemantic(diffs);

        let providedTokens = [];
        let expectedTokens = [];

        diffs.forEach(diff => {
            switch (diff[0]) {
                case 0: // EQUAL
                    providedTokens.push(new DiffToken('Good', diff[1]));
                    expectedTokens.push(new DiffToken('Good', diff[1]));
                    break;
                case -1: // DELETE
                    providedTokens.push(new DiffToken('Bad', diff[1]));
                    break;
                case 1: // INSERT
                    expectedTokens.push(new DiffToken('Missing', diff[1]));
                    break;
            }
        });

        return { provided: providedTokens, expected: expectedTokens };
    };

    DiffContext.prototype.toHtml = function() {
        let tokens = this.toTokens();
        let renderedProvided = renderTokens(tokens.provided);
        let renderedExpected = renderTokens(tokens.expected);

        if (this.provided === this.expected) {
            return `<div>${renderedProvided}</div>`;
        } else {
            return `<div>${renderedProvided}<br><span id="typearrow">&darr;</span><br>${renderedExpected}</div>`;
        }
    };

    let ctx = new DiffContext(expected, provided);
    return ctx.toHtml();
}
