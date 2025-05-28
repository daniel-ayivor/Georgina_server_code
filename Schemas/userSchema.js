const userSchema = {
    type:"object",
    properties:{
        id:{type:"integer"},
        name:{type:"string"},
        email:{type:"string"},
        contact:{type:"string"},
        password:{type:"string"}
    }
}


module.exports =userSchema;