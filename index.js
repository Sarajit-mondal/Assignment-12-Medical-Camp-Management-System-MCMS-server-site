const express = require('express')
const jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId, Timestamp } = require('mongodb')

const port = process.env.PORT || 8000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  console.log("veryvify token")
  const token = req.headers.authorization.split('Bearer ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}

 const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sarajit.dhxjgpp.mongodb.net/?retryWrites=true&w=majority&appName=sarajit`
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // database collection
    // database collection
    // database collection
    const database = client.db("CareCamp");
    const dbAllCampCollection = database.collection("allCamp");
    const dbUsersCollection = database.collection("users");
    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res.send({token})
    })
   

  // allcamp data
  // allcamp data
  // allcamp data
    //get all camp data with disending order 
   app.get('/allcamp', async(req,res) =>{
    const result =await dbAllCampCollection.find().sort({ParticipantCount: -1}).toArray()
    res.send(result)
   })
    //get all available cams with sort 
   app.get('/allavilableCamps',async(req,res) =>{
    const sortValue = req.query.sortValue;
    let sortWith = {}
    if(sortValue === 'ParticipantCount'){
      sortWith = {"ParticipantCount" : -1}
    }else if(sortValue === 'CampFees'){
      sortWith = {'CampFees' : -1}
    }else if(sortValue === 'alphabetical'){
      sortWith = {"CampName" : 1}
    }
    const result =await dbAllCampCollection.find().sort(sortWith).toArray()
    res.send(result)
   })
   //get one data 
   app.get('/campDetails/:id',async(req,res)=>{
    const Id = req.params.id
    const query = {_id: new ObjectId(Id)}
    const result = await dbAllCampCollection.findOne(query);
    res.send(result)
   })
  // allcamp data
  // allcamp data
  // allcamp data
  // set user in database
  // set user in database
  // set user in database
  app.post('/users',async(req,res)=>{
   const user = req.body;
   const query = {email : user.email}
   const isUser = await dbUsersCollection.findOne(query)
   if(isUser) return isUser

   const doc ={
    ...user,
    Timestamp : Date.now()
   }
   const result =await dbUsersCollection.insertOne(doc);
  res.send(result)
  })
  // set user in database
  // set user in database
  // set user in database


    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Server is runing....')
})
app.get('/sarajit', (req, res) => {
  res.send('my name is sarajit')
})

app.listen(port, () => {
  console.log(`StayVista is running on port http://localhost:${port}`)
})
