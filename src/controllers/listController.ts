import { Request, Response } from 'express'
import Customer from '../models/Customer'

const listController = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findOne({
      customer_code: req.params.customer_code
    })

    if (!customer) {
      return res.status(404).json({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada'
      })
    }

    let measures = customer.measures
    const measure_type = req.query.measure_type

    if (measure_type) {
      if (measure_type != 'WATER' && measure_type != 'GAS') {
        return res.status(400).json({
          error_code: 'INVALID_TYPE',
          error_description: 'Tipo de medição não permitida'
        })
      }

      measures = customer.measures.filter(
        (measure) => measure.measure_type === measure_type
      )
    }

    return res.json({
      customer_code: customer.customer_code,
      measures: measures
    })
  } catch (error) {
    res.status(500).json({ message_error: 'Erro interno do servidor' })
  }
}

export default listController
