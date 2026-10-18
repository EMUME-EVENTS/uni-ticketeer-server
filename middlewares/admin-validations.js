const Joi = require('joi').extend(require('@joi/date'));

function createAdminValidation(req, res, next){
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        fullname: Joi.string().required(),
        admintype: Joi.string().allow(["superadmin", "admin", "supervisor"]).required(),
        roles: Joi.array().required(),
        status: Joi.string().allow(["active", "disables"]).required()
    })

    const result = schema.validate(req.body)

    if(result.error){
        return validationErrorResponse(res, result)
    }

    next()
}

function adminLoginValidation(req, res, next){
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const result = schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result);
    }

    next();
}

function validationErrorResponse(res, result){
    return res.status(400).json({message: "Validation Error ", data: result.error.details})
}

module.exports = {
    adminLoginValidation,
    createAdminValidation
}