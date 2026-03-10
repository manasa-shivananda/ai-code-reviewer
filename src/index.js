import Anthropic from '@anthropic-ai/sdk'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

console.log('Starting server...')
console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO')

const app = express()
app.use(cors())
app.use(express.json())

const client = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
})

app.post('/api/review', async (req, res) => {
  try {
    const { code, language } = req.body

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: `You are a senior software engineer doing a 
      thorough code review. Analyse the code and respond 
      in this exact format:

      🐛 BUGS
      List any bugs or errors found. If none, write "None found."

      ⚡ PERFORMANCE
      List performance improvements. If none, write "Looks good."

      🔒 SECURITY
      List security issues. If none, write "No issues found."

      📖 READABILITY
      List readability improvements. If none, write "Clean code."

      ✅ WHATS GOOD
      List what is done well in the code.

      Be specific, practical, and beginner-friendly.`,
      messages: [{
        role: 'user',
        content: `Review this ${language} code:\n\n${code}`
      }]
    })

    const review = response.content[0].text
    console.log('\n--- CODE REVIEW ---\n')
    console.log(review)
    console.log('\n-------------------\n')
    res.json({ review })

  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
}).on('error', (err) => {
  console.error('Server error:', err.message)
})
