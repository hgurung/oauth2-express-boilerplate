const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({
            data: req.body,
            error: {
                code: 422,
                message: "Bad Request",
                errors: errors.mapped()
            }
        });
    }
    return next();
};

module.exports = validate;
