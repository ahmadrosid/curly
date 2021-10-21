import axios from 'axios'
import Head from 'next/head'
import { useRef, useState, useEffect } from 'react'
import { registerPlaceholderAddon } from '../lib/codemirror-placeholder'
import parseCurl from '../lib/parse-curl'

export default function Home() {
  const [cmInput, setCodeMirror] = useState(null)
  const [cmOoutput, setCodeMirrorOut] = useState(null)

  const codeMirrorRef = useRef()
  const codeMirrorRefOut = useRef()
  const proxyCheckboxRef = useRef()

  useEffect(() => {
    window.axios = axios
    if (!cmInput) {
      require('codemirror/mode/shell/shell')
      const CodeMirror = require('codemirror')
      registerPlaceholderAddon(CodeMirror)
      const instanceInput = CodeMirror.fromTextArea(codeMirrorRef.current, {
        lineNumbers: false,
        lineWrapping: true,
        mode: "text/x-sh"
      })
      instanceInput.setSize("100%", "100%")
      setCodeMirror(instanceInput)
    }

    if (!cmOoutput) {
      require('codemirror/mode/javascript/javascript')
      const CodeMirror = require('codemirror')
      const instanceOutput = CodeMirror.fromTextArea(codeMirrorRefOut.current, {
        lineNumbers: false,
        mode: "javascript",
        readOnly: true
      })
      instanceOutput.setSize("100%", "100%")
      setCodeMirrorOut(instanceOutput)
    }
  }, [])

  const clearTextArea = () => {
    cmInput.getDoc().setValue('')
    cmOoutput.getDoc().setValue('')
  }

  const runRequest = (e) => {
    e.preventDefault()
    cmOoutput.getDoc().setValue('Loading...')

    const source = cmInput.getValue()
    if (!source) {
      return;
    }

    let request = parseCurl(source)
    if (!request) {
      alert("no value request")
      cmOoutput.getDoc().setValue(JSON.stringify({
        error: "Failed to parse curl request!"
      }, null, '    '))
      return;
    }

    if (proxyCheckboxRef.current.checked) {
      const proxy = {
        data: request,
        url: '/api/proxy',
        method: 'POST',
        headers: {
          "content-type": "application/json"
        }
      }
      request = proxy
      console.log('here', request)
    }

    axios(request)
      .then(response => {
        cmOoutput.getDoc().setValue(JSON.stringify(response.data, null, '    '))
      })
      .catch(err => {
        cmOoutput.getDoc().setValue(JSON.stringify({
          error: err.message, ...err.response?.data
        }, null, '    '))
      })
  }

  return (
    <div className="">
      <Head>
        <meta property="og:url" content={`https://webcurl.verce.app`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Run curl request from browser" />
        <meta property="og:description" content="Run curl request from browser" />
        <meta property="og:image" content="/webcurl.png" />
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

        <div className="flex flex-col gap-8 max-w-[700px] mx-auto">
          <div className="w-[700px] h-[200px] text-white">
            <textarea ref={codeMirrorRef} placeholder="Paste curl here..."></textarea>
          </div>

          <div className="flex gap-2 items-center">
            <input ref={proxyCheckboxRef} type="checkbox" value="off" placeholder="Use proxy" />
            <label className="text-sm text-gray-500">Use proxy to baypass cors.</label>
          </div>

          <div className="max-h-[500px] w-[700px]">
            <textarea ref={codeMirrorRefOut}></textarea>
          </div>
        </div>
      </main>

      <footer className="text-center">
        <p className="text-gray-600">Created with 💖 by <a href="https://ahmadrosid.com">Ahmad Rosid</a></p>
      </footer>
    </div>
  )
}
