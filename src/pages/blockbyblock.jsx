import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'
import Link from 'next/link';
import { useRouter } from 'next/router';
import SketchfabIntegration from '@/components/dom/SketchfabIntegration';
import { BlockByBlock } from '@/components/canvas/BlockByBlock';




//const BlockByBlock = dynamic(() => import('@/components/canvas/BlockByBlock'), { ssr: false })
const AUTHENTICATION_URL = `https://sketchfab.com/oauth2/authorize/?state=123456789&response_type=token&client_id=${process.env.CLIENT_ID}`;
const sketchfabIntegration = new SketchfabIntegration();


export default function Page() {
  const [urls, setURLs] = useState([])

  const fetchURLs = async () => {
    const response = await fetch('/api/urls')
    const data = await response.json()
    setURLs(data)
    console.log(urls)
  }
  const inputURL = useRef();
  console.log(inputURL);
  //sketchfabIntegration.checkToken()

  const onURLSubmit = async (e) => {
    console.log("pressed submit!")
    e.preventDefault();


    const urlValue = inputURL.current.value;

    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlValue })
      })
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      const data = await response.json();
      console.log("POST", data)
    } catch (e) {
      console.log('ERROR', e)
    }

    fetchURLs();
  }

  const onCompareSubmit = async (e) => {
    console.log("pressed submit!", url1, url2)
    e.preventDefault();


  }
  const [url1, setURL1] = useState();
  const [url2, setURL2] = useState();

  return (
    <div id="container" className='container'>
      <div className="header" >
        <a target="_blank" href={AUTHENTICATION_URL}>
          <div>Login to Sketchfab</div>
        </a>
        <form onSubmit={onURLSubmit}>
          <label>Paste Downloadable Sketchfab URL</label>
          <input ref={inputURL} id="url" type="url" style={{ color: '#000000' }} required></input>
          <input type="submit" value="Submit" />
        </form>
        {urls.map((url) => {
          return (
            <div key={url.id}>
              {url.id} {url.title} {url.url}
            </div>
          )
        })}
        <form onSubmit={onCompareSubmit}>
          <label>Compare Two Builds</label>
          <select
            value={url1}
            onChange={(e) => {
              setURL1(e.target.value);
            }}>
            {
              urls.map((url) => {
                return (
                  <option key={url.id} value={url.url} style={{ color: '#000000' }}>{url.title}</option>
                )
              })
            }
          </select>
          <select
            value={url2}
            onChange={(e) => {
              setURL2(e.target.value);
            }}>
            {
              urls.map((url) => {
                return (
                  <option key={url.id} value={url.url} style={{ color: '#000000' }}>{url.title}</option>
                )
              })
            }
          </select>
          <input type="submit" value="Submit" />
        </form>
      </div >
      <BlockByBlock url1={url1} url2={url2} />
    </div >



  )
}

export async function getServerSideProps() {
  console.log("server");

  //const res = await fetch("https://api.nal.usda.gov/fdc/v1/foods/search?query=cheese&api_key=" + process.env.APIKEY)

  //const data = await res.json();
  //console.log(data);

  return {
    props: {
      title: 'Block by Block Extension'
    }
  }
}

//Page.canvas = (props) => <BlockByBlock route="/" />


/*function checkToken() {
  // Check if there's a new token from the URL
  const url = new URL("")
  // Extract the token and save it
  const hashParams = url.hash.split('&');
  for (let param of hashParams) {
    if (param.indexOf("access_token") !== -1) {
      const token = param.replace('#access_token=', '');
      console.log("Detected Sketchfab token: ", token);
      localStorage.setItem("sb_token", token);
    }
  }

  // Load token from local storage
  //const token = localStorage.getItem("sb_token");
}*/

/*export async function getStaticProps() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users')
  const data = await response.json()
  console.log(data)
  return {
    props: {
      title: 'Block by Block',
      users: data,
    }
  }
}*/

