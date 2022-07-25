const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const router = require("./routes/route")
const port = process.env.PORT || 3000
const app = express()
const multer = require('multer')

app.use(bodyParser.json())
app.use( multer().any())

mongoose.connect("mongodb+srv://kaluram123:iKetOTUhK5vten7w@cluster0.4yhyg.mongodb.net/group44Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDB is connected successfully........"))
    .catch((Err) => console.log(Err))

app.use("/", router)

app.listen(port, function () {
    console.log(`Server is connected on Port ${port} ✅✅✅`)
})