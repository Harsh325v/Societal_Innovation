import { useEffect, useState } from 'react'

export default function SahyogChat() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Namaste! Main Sahyog Assistant hoon. Aapki kya madad kar sakta hoon?'
    }
  ])

  // Allow other parts of Sahyog to open the chatbot
  useEffect(() => {
    const openChat = () => {
      setOpen(true)
    }

    window.addEventListener('open-sahyog-chat', openChat)

    return () => {
      window.removeEventListener('open-sahyog-chat', openChat)
    }
  }, [])

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage = message.trim()

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage
      }
    ])

    setMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {})
          },
          body: JSON.stringify({
            message: userMessage,
            conversationId: 'sahyog-chat'
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Chat request failed')
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response
        }
      ])
    } catch (error) {
      console.error('Chat error:', error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection issue. Please try again.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // 🎤 Voice input
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript

      setMessage(transcript)
    }

    recognition.onerror = (event) => {
      console.error(
        'Speech recognition error:',
        event.error
      )
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
  }

  // 🔊 Voice output
  const speakMessage = (text) => {
    if (!window.speechSynthesis) {
      alert('Voice output is not supported in this browser.')
      return
    }

    window.speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance(text)

    speech.lang = 'en-IN'
    speech.rate = 0.95
    speech.pitch = 1

    window.speechSynthesis.speak(speech)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: '30px',
          bottom: '30px',
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          backgroundColor: '#e7b58c',
          color: '#111827',
          border: '3px solid white',
          fontSize: '30px',
          cursor: 'pointer',
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)'
        }}
      >
        💬
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        width: '425px',
        height: '570px',
        backgroundColor: '#f7f4ed',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 2147483647,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: '58px',
          backgroundColor: '#193d35',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          fontWeight: 'bold',
          fontSize: '18px'
        }}
      >
        <span>🤖 Sahyog Assistant</span>

        <button
          onClick={() => {
            window.speechSynthesis?.cancel()
            setOpen(false)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* MESSAGES */}
      <div
        style={{
          height: '455px',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf:
                msg.role === 'user'
                  ? 'flex-end'
                  : 'flex-start',
              maxWidth: '88%'
            }}
          >
            <div
              style={{
                padding: '12px 15px',
                borderRadius: '10px',
                backgroundColor:
                  msg.role === 'user'
                    ? '#193d35'
                    : 'white',
                color:
                  msg.role === 'user'
                    ? 'white'
                    : '#333',
                fontSize: '15px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}
            >
              {msg.content}
            </div>

            {/* Speaker button for AI responses */}
            {msg.role === 'assistant' && (
              <button
                onClick={() => speakMessage(msg.content)}
                title="Read aloud"
                style={{
                  marginTop: '5px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '17px'
                }}
              >
                🔊
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div
            style={{
              padding: '12px 15px',
              backgroundColor: 'white',
              borderRadius: '10px',
              color: '#555'
            }}
          >
            Thinking...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div
        style={{
          height: '57px',
          display: 'flex',
          backgroundColor: '#111827'
        }}
      >
        {/* MIC */}
        <button
          onClick={startListening}
          disabled={loading}
          title="Speak"
          style={{
            width: '55px',
            border: 'none',
            backgroundColor: listening
              ? '#ef4444'
              : '#111827',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          {listening ? '🔴' : '🎤'}
        </button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            listening
              ? 'Listening...'
              : 'Apna sawaal likhein...'
          }
          disabled={loading}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '0 8px',
            fontSize: '15px'
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !message.trim()}
          style={{
            width: '70px',
            border: 'none',
            backgroundColor: '#e7b58c',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}