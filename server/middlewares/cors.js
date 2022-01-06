module.exports = () => (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization,  Content-Type, Access-Token, Content-Checksum, File-Id, Content-Range, Size, Organization-Id, Location-Id, License-Id, Compute-Id, Version-Id, File-Name"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    return next();
};
