import express, { Application } from 'express'
import bodyParser from 'body-parser'
import routes from './routes'
import connectDb from './database'

const app: Application = express()

connectDb()

app.use(bodyParser.json())
app.use('/', routes)

export default app
