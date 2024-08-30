import mongoose, { Document, Schema } from 'mongoose'

export interface IMeasure extends Document {
  measure_uuid: string
  measure_datetime: Date
  measure_type: string
  measure_value: number
  has_confirmed: boolean
  image_url?: string
}

const measureSchema = new Schema<IMeasure>({
  measure_uuid: {
    type: String,
    required: true,
    unique: true
  },
  measure_value: {
    type: Number,
    required: true
  },
  measure_datetime: {
    type: Date,
    required: true
  },
  measure_type: {
    type: String,
    required: true
  },
  has_confirmed: {
    type: Boolean,
    required: true
  },
  image_url: {
    type: String,
    required: false
  }
})

export interface ICustomer extends Document {
  customer_code: string
  measures: IMeasure[]
}

const customerSchema = new Schema<ICustomer>({
  customer_code: {
    type: String,
    required: true,
    unique: true
  },
  measures: [measureSchema]
})

const Customer = mongoose.model<ICustomer>('Customer', customerSchema)

export default Customer
