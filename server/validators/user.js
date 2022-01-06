const { checkSchema } = require("express-validator");

const UserService = require("../services/userService");
const userService = new UserService();

// Bulk add Validation
const userAddValidation = checkSchema({
    role: {
        isLength: {
            errorMessage: "Party code number must be between 2 to 20",
            options: {
                min: 2,
                max: 20
            }
        },
        custom: {
            options: value => {
                const re = /^[a-zA-Z0-9_]*$/;
                if (re.test(String(value))) {
                    return true;
                }
                throw new Error("Must only contain alphabets, number and underscore.");
            }
        }
    },
    fullname: {
        custom: {
            options: value => {
                if (/\d/.test(value)) {
                    throw new Error("Name shouldn't contain numbers.");
                } else {
                    return true;
                }
            }
        }
    },
    username: {
        isLength: {
            errorMessage: "Username / email is required",
            options: {
                min: 3
            }
        },
        custom: {
            options: (value) => {

                const re = /^[a-zA-Z0-9.@+]*$/;
                if (!re.test(String(value))) {
                    throw new Error("Invalid username.");
                }
                return true;
            }
        }
    }
});



const updateUserValidation = checkSchema({
  username: {
    isLength: {
      errorMessage: "Username / email is required",
      options: {
        min: 3,
      },
    },
    custom: {
      options: (value) => {
        const re = /^[a-zA-Z0-9.@+]*$/;
        if (!re.test(String(value))) {
          throw new Error("Invalid username.");
        }
        return true;
      }
    },
  },
});

const updatePasswordValidation = checkSchema({
    username: {
        isLength: {
            errorMessage: "Username / email is required",
            options: {
                min: 3
            }
        },
        custom: {
            options: (value) => {

                const re = /^[a-zA-Z0-9.@+]*$/;
                if (!re.test(String(value))) {
                    throw new Error("Invalid username.");
                }
                return true;
            }
        }
    }
});

const resetPasswordValidation = checkSchema({
    token: {
        isLength: {
            errorMessage: "Token is required",
            options: {
                min: 1
            }
        }
    },
    password: {
        isLength: {
            errorMessage: "New password is required",
            options: {
                min: 1
            }
        }
    },
    "confirm-password": {
        isLength: {
            errorMessage: "Confirm password is required",
            options: { min: 1, max: 50 }
        },
        custom: {
            options: (value, { req }) => {
                if (value === req.body.password) {
                    return true;
                }
                throw new Error("Confirm password does not match");
            }
        }
    }
});

const forgotPasswordValidation = checkSchema({
    username: {
        isLength: {
            errorMessage: "Username / email is required",
            options: {
                min: 3
            }
        },
        custom: {
            options: (value) => {
                return userService.getUserByUsername(value).then(user => {
                    if (!user) {
                        throw new Error("Invalid username.");
                    }
                    return true;
                });
            }
        }
    }
});


const changePasswordValidation = checkSchema({
    username: {
        isLength: {
            errorMessage: "Username / email is required",
            options: {
                min: 3
            }
        },
        custom: {
            options: (value, { req }) => {
                const domainCode = req.body.domain_code;
                return userService.getUserByUsername(value).then(user => {
                    if (!user) {
                        throw new Error("Invalid username.");
                    }
                    return true;
                });
            }
        }
    }
});

const changePasswordLoginValidation = checkSchema({
    oldPassword: {
        isLength: {
            errorMessage: "Old password is required",
            options: {
                min: 1
            }
        }
    },
    password: {
        isLength: {
            errorMessage: "New password is required",
            options: {
                min: 1
            }
        }
    },
    confirmPassword: {
        isLength: {
            errorMessage: "Confirm password is required",
            options: { min: 1, max: 50 }
        },
        custom: {
            options: (value, { req }) => {
                if (value === req.body.password) {
                    return true;
                }
                throw new Error("Confirm password does not match");
            }
        }
    }
});

module.exports = {
    userAddValidation,
    updatePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateUserValidation,
    changePasswordValidation,
    changePasswordLoginValidation,
};
