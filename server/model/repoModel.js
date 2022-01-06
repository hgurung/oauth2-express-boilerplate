module.exports = class RepoModel {
    transform(src, dest) {
        const result = {};
        Object.keys(dest).forEach(k => {
            if (k in src) {
                result[dest[k]] = src[k];
            }
        });
        return result;
    }

    transformer(src, dest) {
        if (!src) {return null;}
        if (!dest) {
            throw Error("Required destination schema");
        }
        return src instanceof Array ? src.map(s => this.transform(s, dest)) : this.transform(src, dest);
    }
};
