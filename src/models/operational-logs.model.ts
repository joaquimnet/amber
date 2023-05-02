import { Schema, model } from 'mongoose';

export interface IOperationalLog {
  type: string;
  message?: string;
  meta: any;
}

const operationalLogsSchema = new Schema<IOperationalLog>(
  {
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    meta: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export interface OperationalLogsDocument extends IOperationalLog, Document {}

export const OperationalLog = model<IOperationalLog>('OperationalLog', operationalLogsSchema);
