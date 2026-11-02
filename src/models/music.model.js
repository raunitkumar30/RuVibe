const mongooge = require("mongoose");

const musicSchema = new mongooge.Schema({
    uri:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    artist:{
        type: mongooge.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
})

const musicModel = mongooge.model("music",musicSchema);

module.exports = musicModel;