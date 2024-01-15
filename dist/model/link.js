"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Link {
    constructor(rel, href, title) {
        this.rel = rel;
        this.href = href;
        this.title = title;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromObject(object) {
        return new Link(object.rel, object.href, object.title);
    }
}
exports.default = Link;
//# sourceMappingURL=link.js.map