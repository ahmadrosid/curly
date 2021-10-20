import axios from 'axios'
import Head from 'next/head'
import { useRef, useState, useEffect } from 'react'
import parseCurl from '../lib/parse-curl'

export default function Home() {
  const [response, setResponse] = useState(false)
  const [cmDoc, setCodeMirror] = useState(null)

  const codeMirrorRef = useRef()

  useEffect(() => {
    if (!cmDoc) {
      require('codemirror/mode/shell/shell')
      const CodeMirror = require('codemirror')
      const instanceInput = CodeMirror.fromTextArea(codeMirrorRef.current, {
        lineNumbers: false,
        lineWrapping: true,
        mode: "text/x-sh"
      })
      instanceInput.setSize("100%", "100%")
      setCodeMirror(instanceInput)
    }
  }, [])

  const clearTextArea = () => {
    setResponse(false)
    cmDoc.getDoc().setValue('')
  }

  const runRequest = (e) => {
    e.preventDefault()
    const source = cmDoc.getValue()
    if (!source) {
      setResponse(false)
      return;
    }

    const request = parseCurl(source)
    if (!request) {
      setResponse({
        error: "Failed to parse curl request!"
      })
      return;
    }

    axios(request)
      .then(response => setResponse(response))
      .catch(err => {
        setResponse({ err: err.message, response: err.response?.data })
      })
  }

  return (
    <div className="w-full flex justify-center">
      <Head>
        <title>Web Curl - Run curl request from browser</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="space-y-10 mt-[100px] pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-gray-700 uppercase font-bold text-3xl">web curl</h1>
          <p className="text-gray-700">Run CURL Request from your browser.</p>
        </div>

        <div className="w-full flex justify-center gap-x-6">
          <button onClick={runRequest} className="bg-gray-500 rounded-md py-2 shadow-md w-[120px] text-white">Run</button>
          <button onClick={clearTextArea} className="rounded-md py-2 shadow-md w-[120px] text-gray-800 border-2 border-gray-500">Clear</button>
        </div>

        <div>
          <div className="h-[150px] w-[700px] text-white">
            <textarea ref={codeMirrorRef}></textarea>
          </div>
        </div>

        {response && (
          <div className="bg-gray-800 rounded-md max-w-[700px]">
            <pre className="p-4 text-white">
              {JSON.stringify(response, null, '    ')}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
