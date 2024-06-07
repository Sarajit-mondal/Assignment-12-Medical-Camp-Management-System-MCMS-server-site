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
    const dbRegistereduserCollection = database.collection("Resgistered_Users");
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
    //get six camp data with disending order 
   app.get('/allcamp', async(req,res) =>{

    const option = {
      sort:{ParticipantCount: -1},
      limit:6,
    }
    const result =await dbAllCampCollection.find({},option).toArray()
    res.send(result)
   })
    //get allcampdata with disending order 
   app.get('/allcampData', async(req,res) =>{
    const result =await dbAllCampCollection.find().toArray()
    res.send(result)
   })
    //get all available cams with sort 
   app.get('/allavilableCamps',async(req,res) =>{
    const sortValue = req.query.sortValue;
    const userEmail = req.query.userEmail;
    let sortWith = {}
    if(sortValue === 'ParticipantCount'){
      sortWith = {"ParticipantCount" : -1}
    }else if(sortValue === 'CampFees'){
      sortWith = {'CampFees' : -1}
    }else if(sortValue === 'alphabetical'){
      sortWith = {"CampName" : 1}
    }
    //get available data
    const available =await dbRegistereduserCollection.find({ParticipantEmail:userEmail}).toArray()
    //with out those data
    const notAvailable = available.map(camp => camp.CampName);
  

    const result =await dbAllCampCollection.find({CampName:{$nin:notAvailable}}).sort(sortWith).toArray()
    res.send(result)
   })
   //get one data 
   app.get('/campDetails/:id',async(req,res)=>{
    const Id = req.params.id
    const query = {_id: new ObjectId(Id)}
    const result = await dbAllCampCollection.findOne(query);
    res.send(result)
   })

   //update camp
   app.put('/updateCamp/:id',async(req,res) =>{
    const updateData = req.body
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const options = { upsert: true };
    // Specify the update to set a value for the plot field
    const updateDoc = {
      $set: {
        ...updateData
      },
    };
    const result = await dbAllCampCollection.updateOne(query,updateDoc,options)
    res.send(result)
   })
//delete camp
app.delete('/campDelete/:id',async(req,res)=>{
  const query = {_id: new ObjectId(req.params.id)}
  const result =await dbAllCampCollection.deleteOne(query)
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

  //check role Organigear or Particpent
  app.get('/user/:email',async(req,res)=>{
    const query = {email:req.params.email}
    const result = await dbUsersCollection.findOne(query)
    res.send(result)
  })
  // set user in database
  // set user in database
  // set user in database

  //registered user on camp
  //registered user on camp 
  //registered user
  //set registered user
  app.post('/registerCamp',async(req,res)=>{
    const userData = req.body;
    const query = {_id : new ObjectId(userData.campId)}
    const queryEmail = {ParticipantEmail : userData.ParticipantEmail}
    //check already register or not
    const alreadyUsers =await dbRegistereduserCollection.find(queryEmail).toArray()
    const alreadyRegister = alreadyUsers.filter(user => user.campId === userData.campId)
    // if registered than return from here
    if(alreadyRegister.length !== 0) return res.send(alreadyRegister)
    //how many participant has 
    const participant =await dbAllCampCollection.findOne(query)
    //participant increace fild
    const incress ={
      $set:{ 
    ParticipantCount : participant.ParticipantCount+1
      }
    }
      const result =await dbRegistereduserCollection.insertOne(userData)
      //increase Participant Count
      await dbAllCampCollection.updateOne(query,incress)
     res.send(result)
  })
  //registered user
  //registered user
  //registered user on camp



  // organigar work
  // organigar work
  // organigar work
  // organigar work
  // add new Camp
  app.post('/addCamp',async(req,res)=>{
    const campData = req.body;
    const result = await dbAllCampCollection.insertOne(campData)
    res.send(result)
  
  })

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
           

app.listen(port, () => {
  console.log(`careCamp is running on port http://localhost:${port}`)
})
