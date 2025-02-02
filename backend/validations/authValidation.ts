import vine from "@vinejs/vine";


export const registerSchema = vine.object({
    name: vine.string().minLength(2).maxLength(155),
    email: vine.string().email(),
    password: vine.string().minLength(6).maxLength(100).confirmed(),
    country: vine.string(),
    industry: vine.string(),

});

export const loginSchema = vine.object({
    email: vine.string().email(),
    password: vine.string()
});

export const updateUserSchema = vine.object({
    name: vine.string().minLength(2).maxLength(155).optional(),  
    email: vine.string().email().optional(), 
    password: vine.string().minLength(6).maxLength(100).optional(), 
    country: vine.string().optional(),  
    industry: vine.string().optional(),  
});