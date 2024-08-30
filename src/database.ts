import mongoose from 'mongoose'
import { configDotenv } from 'dotenv'

configDotenv()

const connectDb = async () => {
  try {
    const mongo_uri = process.env.MONGO_URI
    if (mongo_uri) {
      const connect = await mongoose.connect(mongo_uri)
      console.log(`Banco de dados conectado: ${connect.connection.host}`)
    }
  } catch (error) {
    console.log(`Erro na conexão com o banco de dados: ${error}`)
    process.exit(1)
  }
}

export default connectDb
