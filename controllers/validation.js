/** @format */

// Validate and sanitize user data on account creation or update

const ev = require("express-validator");
const controller = require("./userController");

const checks = [
    // first name
    ev.check("first_name")
        .optional()
        .trim()
        .isLength({ max:255 }),
    // last name
    ev.check("last_name")
        .optional()
        .trim()
        .isLength({ max:255 }),
	// email must be an email
    ev.check("email", "Invalid email.")
        .exists({checkFalsy: true, checkNull: true})
        .isEmail()
        .normalizeEmail()
        // Make sure it isn't already in use
        /*.custom(async (value) => {
            try {
                // Find the username in the db, and if found return error
                const userExists = await controller.findEmail(value);
                if (userExists) {
                    return Promise.reject('Email already in use');
                }
                return userExists;
            } catch (error) {
                console.error(error);
            }
        })*/,
    // username
    ev.check("username", "Invalid username.")
        .exists({checkFalsy: true, checkNull: true})
        .isLength({ min:4, max:16 })
        .withMessage('Username must be between 4 and 16 characters in length.')
        // Allow only printable ASCII characters
        .matches(/^[ -~]+$/)
        .withMessage('Username may contain printable ASCII characters only.')
        // Make sure it isn't already in use
        /*.custom(async (value) => {
            try {
                // Find the username in the db, and if found return error
                const userExists = await controller.findUsername(value);
                if (userExists) {
                    return Promise.reject('Username already in use');
                }
            } catch (error) {
                console.error(error);
            }
        })*/,
	// password must be at least 8 chars long, but no longer than 16
    ev.check("password", 'Invalid password.')
        .exists({checkFalsy: true, checkNull: true})
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters in length.')
        .matches(/^[ -~]+$/)
        .withMessage('Password may contain printable ASCII characters only.')
        .matches(/\d/)
        .withMessage('Password must contain at least one number.')
        .matches(/[a-zA-Z]/)
        .withMessage('Password must contain at least one letter.'),
    ev.check("passwordConfirmation", "Passwords do not match.")
        // Make sure password confirmation matches password
        .custom((value, {req}) => (value === req.body.password))
];

const handleValidationErrors = (req, res, next) => {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = ev.validationResult(req);
	if (!errors.isEmpty()) {
		// There are errors. Render form again with error messages.
        return res.status(422).render("sign-up", { errors: errors.array() });
	} else {
        // Data from form is valid, continue
        next();
    }
}

//Sample error object
const errorExample = {
	errors: [
		{
			location: "body",
			msg: "Invalid value",
			param: "username",
		},
	],
};

module.exports = {  checks, handleValidationErrors }