import { OPENAI_API_KEY_STORAGE_KEY } from "@/lib/constants"
import { getProviderByModel } from "@/utils/llm"
import { streamText, type CoreMessage } from "ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

async function createCompletion(
  model: string = "gpt-3.5-turbo",
  prompt: string,
  context: any
) {
  console.log("Creating Chat Completion")

  const aiProvider = getProviderByModel(model, context)

  const parsed = context.transcript.events
    .filter((x: { segs: any }) => x.segs)
    .map((x: { segs: any[] }) => x.segs.map((y: { utf8: any }) => y.utf8).join(" "))
    .join(" ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")

  const USER = `${prompt}\n\nVideo Title: ${context.metadata.title}\nVideo Transcript: ${parsed}`

  console.log("User Prompt")
  console.log(USER)

  const messages = [{ role: "user", content: USER }] satisfies CoreMessage[]

  const result = await streamText({
    model: aiProvider(model),
    messages
  })

  return result.textStream
}

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  let cumulativeDelta = ""

  const prompt = req.body.prompt
  const model = req.body.model
  const context = req.body.context

  // console.log("Prompt")
  // console.log(prompt)
  // console.log("Model")
  // console.log(model)
  // console.log("Context")
  // console.log(context)

  try {
    const completion = await createCompletion(model, prompt, context)

    for await (const delta of completion) {
      cumulativeDelta += delta

      res.send({ message: cumulativeDelta, error: null, isEnd: false })
    }

    res.send({ message: "END", error: null, isEnd: true })
  } catch (error) {
    console.log(error)
    res.send({ error: "something went wrong" })
  }
}

export default handler
