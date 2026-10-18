const Joi = require('joi').extend(require('@joi/date'));

function loginValidation(req, res, next){
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    });

    const result = schema.validate(req.body);

    if(result.error){
        return res.status(400).json({ message: 'Validation Error', data: result.error.details });
    }

    next();
}

function userRegValidation(req, res, next){

    const schema = Joi.object({
        firstname: Joi.string().min(3).max(20),
        lastname: Joi.string().min(3).max(20),
        username: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        phone_number: Joi.string().max(10),
        dob: Joi.date(),
        password: Joi.string().min(8).required(),
        confirm_password: Joi.ref('password'),
        gender: Joi.string().valid('male', 'female'),
        usertype: Joi.string().valid('basic', 'organiser').required(),
        tac: Joi.boolean().required(),
        location: Joi.string().required()
    });

    const result = schema.validate(req.body);

       console.log(result)
       if(result.error){
        return validationErrorResponse(res, result.error.details)
       }

       next()
}

async function verificationTokenValidation(req, res, next){
    const schema = Joi.object({
        email: Joi.string().required()
    })

    const result = schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next()
}

async function resetPasswordValidation(req, res, next){
    const schema = Joi.object({
        new_password: Joi.string().min(8).required()
    })

    const result = schema.validate(req.body)

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next()
}


async function changePasswordValidation(req, res, next){
    const schema = Joi.object({
        old_password: Joi.string().min(8).required(),
        new_password: Joi.string().min(8).required(),
        confirm_new_password: Joi.ref('new_password')
    })

    const result = schema.validate(req.body)

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next();
}

function eventUploadValidation(req, res, next) {
    const Schema = Joi.object({
        title: Joi.string().required(),
        venue: Joi.string().required(),
        organiser: Joi.string().required(),
        organiser_name: Joi.string().required(),
        start_date: Joi.date().format('YYYY-MM-DD').utc().required(),
        end_date: Joi.date().format('YYYY-MM-DD').utc(),
        start_time: Joi.string().pattern(new RegExp('^(2[0-3]|1[0-9]|0[0-9]):[0-5][0-9]$')).required(),// the previous code for here dey accommodate outside of 12 and 24 hours time format
        end_time: Joi.string().pattern(new RegExp('^(2[0-3]|1[0-9]|0[0-9]):[0-5][0-9]$')),
        category: Joi.array().required(),
        location: Joi.object({
            country: Joi.string().required(),
            state: Joi.string().required(),
            city: Joi.string().required(),
            landmark: Joi.string()
        }).required(),
        banner_image_url: Joi.string().required(),
        status: Joi.string().valid('draft', 'published', 'cancelled'),
        additional_information: Joi.string(),
        promo_code: Joi.array(),
        is_ticketed: Joi.boolean().required(),
        views: Joi.number()
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next();
}

function editEventValidation(req, res, next) {
    const Schema = Joi.object({
        title: Joi.string(),
        venue: Joi.string(),
        organiser: Joi.string(),
        organiser_name: Joi.string(),
        start_date: Joi.date().format('YYYY-MM-DD').utc(),
        end_date: Joi.date().format('YYYY-MM-DD').utc(),
        start_time: Joi.string().pattern(new RegExp('^(2[0-3]|1[0-9]|0[0-9]):[0-5][0-9]$')),// the previous code for here dey accommodate outside of 12 and 24 hours time format
        end_time: Joi.string().pattern(new RegExp('^(2[0-3]|1[0-9]|0[0-9]):[0-5][0-9]$')),
        category: Joi.array(),
        location: Joi.object({
            country: Joi.string().required(),
            state: Joi.string().required(),
            city: Joi.string().required(),
            landmark: Joi.string()
        }),
        banner_image_url: Joi.string(),
        status: Joi.string().valid('draft', 'published', 'cancelled'),
        additional_information: Joi.string(),
        promo_code: Joi.array(),
        is_ticketed: Joi.boolean(),
        views: Joi.number()
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next();
}

function createTicketValidation(req, res, next){

    const Schema = Joi.object({
        event_id: Joi.string().required(),
        event_name: Joi.string().required(),
        organiser_id: Joi.string().required(),
        ticket_type: Joi.string().required(),
        ticket_price: Joi.number(),
        ticket_banner_url: Joi.string().required(),
        ticket_quantity: Joi.number(),
        restrictions: Joi.object({
            age: Joi.object({
                range: Joi.string(),
                benchmark: Joi.number()
            }),
            gender: Joi.string()
        })
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next();
}

function editTicketValidation(req, res, next){

    const Schema = Joi.object({
        event_id: Joi.string().required(),
        event_name: Joi.string(),
        organiser_id: Joi.string(),
        ticket_type: Joi.string(),
        ticket_price: Joi.number(),
        ticket_banner_url: Joi.string(),
        ticket_quantity: Joi.number(),
        restrictions: Joi.object({
            age: Joi.object({
                range: Joi.string(),
                benchmark: Joi.number()
            }),
            gender: Joi.string()
        })
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next();
}

function addToCartValidation(req, res, next){
    const Schema = Joi.object({
        quantity: Joi.number().min(1).max(50).required()
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next();
}

function checkoutValidation(req, res, next){
    const Schema = Joi.object({
        callback_url: Joi.string().required()
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return res.status(400).json({ message: 'Validation Error ', data: result.error.details });
    }

    next();
}

function withdrawalValidation(req, res, next){
    const Schema = Joi.object({
        amount: Joi.number().required()
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return res.status(400).json({ message: 'Validation Error ', data: result.error.details });
    }

    next();
}

function accountDetailsValidation(req, res, next){
    const Schema = Joi.object({
        user_id: Joi.string().required(),
        account_number: Joi.string().required(),
        bank_code: Joi.string().required(),
        bank_name: Joi.string().required()
    });

    const result = Schema.validate(req.body);

    if(result.error){
        return res.status(400).json({ message: 'Validation Error ', data: result.error.details });
    }

    next();
}

function waitListValidation(req, res, next){
    console.log("in validator", req.body, req.query)
    const schema = Joi.object({
        email: Joi.string().email().required()
    })

    const result = schema.validate(req.body);

    if(result.error){
        return validationErrorResponse(res, result.error.details)
    }

    next()
}

function validationErrorResponse(res, data){
    return res.status(400).json({message: "Validation Error ", data})
}

module.exports = {
    userRegValidation, 
    loginValidation, 
    verificationTokenValidation, 
    eventUploadValidation, 
    editEventValidation, 
    createTicketValidation,
    editTicketValidation,
    withdrawalValidation, 
    addToCartValidation, 
    checkoutValidation, 
    accountDetailsValidation,
    changePasswordValidation,
    resetPasswordValidation,
    waitListValidation
}