import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { config as configDotenv } from 'dotenv'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { Request, Response } from 'express'

configDotenv()

const decoderb64 = async (
  req: Request,
  res: Response
): Promise<string | null> => {
  let imagePath = 'image.png'

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('API_KEY não definido no ambiente')
    }

    const fileManager = new GoogleAIFileManager(apiKey)
    const genAI = new GoogleGenerativeAI(apiKey)

    const validateBase64Image = (base64String: string): boolean => {
      const base64Regex =
        /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/
      return base64Regex.test(base64String)
    }

    if (!validateBase64Image(req.body.image)) {
      throw new Error('A imagem enviada não está em um formato base64 válido')
    }

    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    writeFileSync(imagePath, imageBuffer)

    const uploadResponse = await fileManager.uploadFile(imagePath, {
      mimeType: 'image/png',
      displayName: 'imagem'
    })

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    })

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri
        }
      },
      {
        text: 'Analise o medidor na imagem e o valor da medição em inteiro, um link curto temporário para a imagem e um GUID, separados por vírgula e no formato valor,link,GUID'
      }
    ])

    const responseText = result.response.text()
    return responseText.trim()
  } catch (error) {
    console.error('Erro ao processar a imagem:', error)
    return null
  } finally {
    if (existsSync(imagePath)) {
      try {
        unlinkSync(imagePath)
      } catch (err) {
        console.error(`Erro ao deletar o arquivo ${imagePath}:`, err)
      }
    }
  }
}

export default decoderb64
