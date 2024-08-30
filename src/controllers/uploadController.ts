import { Request, Response } from 'express'
import Customer from '../models/Customer'
import decoderb64 from '../decoderb64'

type Data = {
  image_url: string
  measure_value: number | string
  measure_uiid: string
}

type Measure = {
  measure_uuid: string
  measure_value: number | string
  measure_datetime: string
  measure_type: string
  has_confirmed: boolean
  image_url: string
}

type CustomerData = {
  customer_code: string
  measures: Measure[]
}

const validateRequestData = (req: Request): string | null => {
  const { customer_code, measure_datetime, measure_type, image } = req.body

  if (!customer_code || typeof customer_code !== 'string') {
    return 'customer_code é obrigatório e deve ser uma string.'
  }

  if (!measure_datetime || isNaN(Date.parse(measure_datetime))) {
    return 'measure_datetime é obrigatório e deve ser uma data válida.'
  }

  if (!measure_type || typeof measure_type !== 'string') {
    return 'measure_type é obrigatório e deve ser uma string.'
  }

  if (
    !image ||
    typeof image !== 'string' ||
    !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(image)
  ) {
    return 'image é obrigatório, deve ser uma string em formato base64 válida.'
  }

  return null
}

const uploadController = async (req: Request, res: Response) => {
  try {
    // Valida os dados da requisição
    const validationError = validateRequestData(req)
    if (validationError) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: validationError
      })
    }

    // Converte o measure_datetime da requisição para um objeto Date
    const measureDatetime = new Date(req.body.measure_datetime)
    const requestYear = measureDatetime.getFullYear()
    const requestMonth = measureDatetime.getMonth()

    // Verifica se existe alguma medição no banco de dados no mesmo mês e ano para o mesmo customer_code
    const existingMeasure = await Customer.findOne({
      customer_code: req.body.customer_code,
      'measures.measure_datetime': {
        $gte: new Date(requestYear, requestMonth, 1).toISOString(),
        $lt: new Date(requestYear, requestMonth + 1, 1).toISOString()
      },
      'measures.measure_type': req.body.measure_type
    })

    if (existingMeasure) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Já existe uma medição registrada para este mês.'
      })
    }

    // Decodifica a imagem e processa os dados
    const result = await decoderb64(req, res)

    if (result) {
      const resultArray = result.trim().split(',')

      const data: Data = {
        image_url: resultArray[1],
        measure_value: resultArray[0],
        measure_uiid: resultArray[2]
      }

      const customer = await Customer.findOne({
        customer_code: req.body.customer_code
      })

      if (!customer) {
        const new_customer: CustomerData = {
          customer_code: req.body.customer_code,
          measures: [
            {
              measure_uuid: data.measure_uiid,
              measure_value: data.measure_value,
              measure_datetime: req.body.measure_datetime,
              measure_type: req.body.measure_type,
              has_confirmed: false,
              image_url: data.image_url
            }
          ]
        }

        await Customer.create(new_customer)
        return res.json(data)
      }

      await customer.updateOne({
        $push: {
          measures: {
            measure_uuid: data.measure_uiid,
            measure_value: data.measure_value,
            measure_datetime: req.body.measure_datetime,
            measure_type: req.body.measure_type,
            has_confirmed: false,
            image_url: data.image_url
          }
        }
      })

      return res.json(data)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message_error: 'Erro interno do servidor' })
  }
}

export default uploadController
