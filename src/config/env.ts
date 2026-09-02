import dotenv from 'dotenv';
dotenv.config();

export const PORT = Number(process.env.PORT) || 3000;
export const DATA_PATH = process.env.DATA_PATH || './src/data/turnos.json';
export const MEDICOS_PATH =
  process.env.MEDICOS_PATH || './src/data/medicos.json';
