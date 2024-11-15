// src/app/page.tsx
"use client";
import Image from "next/image";
import styles from "./page.module.css";
import React, { useState } from 'react';
import 'dotenv/config';
import FormData from 'form-data';

function hexToUint8Array(hex: string) {
  hex = hex.trim();
  if (!hex) {
    throw new Error("Invalid hex string");
  }
  if (hex.startsWith("0x")) {
    hex = hex.substring(2);
  }
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(byte)) {
      throw new Error("Invalid hex string");
    }
    array[i / 2] = byte;
  }
  return array;
}

async function uploadUint8Array(data: Uint8Array) {
  const blob = new Blob([data], { type: "application/octet-stream" });
  console.log(blob);
  const file = new File([blob], "quote.bin", {
    type: "application/octet-stream",
  });
  console.log(file);
  const formData = new FormData();
  formData.append("file", file);

  const result = await fetch("https://dstack-sim-explorer.vercel.app/api/upload", {
    method: "POST",
    // @ts-ignore
    body: formData,
    mode: 'no-cors',
  });
  console.log(result);
  return result;
}

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [model, setModel] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel(e.target.value);
  };

  const handleChatQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatQuery(e.target.value);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/redpill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({model, chatQuery, apiKey}),
      });
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      setError(null);
    } catch (err) {
      setError('err');
      setResponse(null);
    }
  };

  // Define the function to be called on button click
  const handleClick = async (path: string) => {
    try {
      let response, data;
      if (path === '/api/signMessage') {
        const messageData = { message: "t/acc" };
        response = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
        data = await response.json();
        console.log(JSON.stringify(data));
        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      } else {
        response = await fetch(path);
        data = await response.json();
        console.log(JSON.stringify(data));
        if (path === '/api/remoteAttestation') {
          const remoteAttestionQuoteHex = data.quote;
          console.log(remoteAttestionQuoteHex);
          const remoteAttestationQuoteU8Array = hexToUint8Array(remoteAttestionQuoteHex);
          console.log(remoteAttestationQuoteU8Array);
          console.log('Uploading Attestation...');
          const uploadResult = await uploadUint8Array(remoteAttestationQuoteU8Array);
          console.log(uploadResult);
          console.log('Upload Complete...');
        }
        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: ' + error);
    }
  };

  return (
    <div className={styles.page}>
      
      <main className={styles.main}>
      <div>
      <h1>RedPill API Call</h1>
      <div>
        <label>
          Model:
          <input type="text" value={model} onChange={handleModelChange} />
        </label>
      </div>
      <div>
        <label>
          Chat Query:
          <input type="text" value={chatQuery} onChange={handleChatQueryChange} />
        </label>
      </div>
      <div>
        <label>
          API Key:
          <input type="text" value={apiKey} onChange={handleApiKeyChange} />
        </label>
      </div>
      <button onClick={handleSubmit}>Submit</button>
      {response && (
        <div>
          <h2>Response:</h2>
          <pre>{response}</pre>
        </div>
      )}
      {error && (
        <div>
          <h2>Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
       
      </main>
    </div>
  );
}
