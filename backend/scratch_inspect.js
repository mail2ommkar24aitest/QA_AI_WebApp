import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('dummy');
console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));
