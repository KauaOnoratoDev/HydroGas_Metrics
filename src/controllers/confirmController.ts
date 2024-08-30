import { Request, Response } from 'express'
import Customer from '../models/Customer'

// Função para validar os dados do request
const validateRequestData = (req: Request): string | null => {
  const { measure_uuid, confirmed_value } = req.body

  if (!measure_uuid || typeof measure_uuid !== 'string') {
    return 'measure_uuid é obrigatório e deve ser uma string.'
  }
  if (typeof confirmed_value !== 'number') {
    return 'confirmed_value é obrigatório e deve ser um número.'
  }

  return null
}

// Função para validar se a medição existe e se já foi confirmada
const validateMeasure = async (
  measure_uuid: string
): Promise<number | null> => {
  const customer = await Customer.findOne({
    'measures.measure_uuid': measure_uuid
  })

  if (!customer) {
    return 404
  }

  const measure = customer.measures.find(
    (measure) => measure.measure_uuid === measure_uuid
  )
  if (measure && measure.has_confirmed) {
    return 409 // Medição já confirmada
  }

  return null
}

const confirmController = async (req: Request, res: Response) => {
  try {
    // Valida os dados
    const validationDataError = validateRequestData(req)
    if (validationDataError) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: validationDataError
      })
    }

    const { measure_uuid, confirmed_value } = req.body

    // Verifica se a medição existe e se já foi confirmada
    const validationMeasureError = await validateMeasure(measure_uuid)
    if (validationMeasureError) {
      return res.status(validationMeasureError).json({
        error_code:
          validationMeasureError === 404
            ? 'MEASURE_NOT_FOUND'
            : 'CONFIRMATION_DUPLICATE',
        error_description:
          validationMeasureError === 404
            ? 'Medição não encontrada.'
            : 'Medição já confirmada.'
      })
    }

    // Atualiza a medição no banco de dados
    await Customer.updateOne(
      { 'measures.measure_uuid': measure_uuid },
      {
        $set: {
          'measures.$.measure_value': confirmed_value,
          'measures.$.has_confirmed': true
        }
      }
    )

    // Retorna uma resposta de sucesso
    return res.status(200).json({
      message: 'Medição confirmada com sucesso.'
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message_error: 'Erro interno do servidor' })
  }
}

export default confirmController
