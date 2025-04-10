import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_LOW_AND_ABOVE",
  },
];

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_PUBLIC_KEY,
)

const model = genAI.getGenerativeModel({
    model:"gemini-2.0-flash",
    // safetySettings:safetySettings
})

export default model;