'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase
      .from('waitlist')
      .insert([{ name, email }])

    if (error) {
      alert('Something went wrong. Please try again.')
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-5xl font-bold mb-6">
          Your business data has the answers.
          <br />
          <span className="text-blue-400">We help you find them.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          Upload your sales data and get an AI-powered report showing exactly 
          where you're losing money — in minutes, not months.
        </p>
        <a href="#waitlist" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-full text-lg">
          Join the waitlist
        </a>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-900 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            You have data. But do you have clarity?
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Most business owners have spreadsheets full of numbers but no idea what they mean.
          </p>
          <div className="grid grid-cols-1 gap-6 mt-10 text-left">
            <div className="bg-gray-800 p-6 rounded-xl">
              <p className="text-white font-semibold mb-2">Where is my revenue leaking?</p>
              <p className="text-gray-400">You know something is off but can't pinpoint it.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <p className="text-white font-semibold mb-2">What's actually working?</p>
              <p className="text-gray-400">You're guessing which products or services to push.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <p className="text-white font-semibold mb-2">What should I do next?</p>
              <p className="text-gray-400">The data exists. The answers are hidden inside it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">How Revela works</h2>
          <p className="text-gray-400 text-lg mb-16">Three steps. No technical knowledge needed.</p>
          <div className="grid grid-cols-1 gap-8 text-left">
            <div className="flex gap-6 items-start">
              <div className="bg-blue-500 text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">Upload your data</p>
                <p className="text-gray-400">CSV, Excel, whatever you have. We handle the rest.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="bg-blue-500 text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">We analyze it</p>
                <p className="text-gray-400">Our system cleans, analyzes, and finds what matters using AI and data science.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="bg-blue-500 text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">Get your report</p>
                <p className="text-gray-400">Plain English insights. Exact problems. Clear actions to take.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="bg-blue-600 px-6 py-24">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Be the first to get access</h2>
          <p className="text-blue-100 text-lg mb-10">
            We're launching soon. Join the waitlist and get early access free.
          </p>
          {submitted ? (
            <div className="bg-white text-blue-600 font-semibold px-8 py-6 rounded-xl text-lg">
              You're on the list. We'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="px-5 py-4 rounded-xl text-black text-lg outline-none"
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-5 py-4 rounded-xl text-black text-lg outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-gray-900"
              >
                {loading ? 'Submitting...' : 'Get early access'}
              </button>
            </form>
          )}
          <p className="text-blue-200 text-sm mt-6">No spam. Just your access link when we launch.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-center py-8 text-gray-600 text-sm">
        © 2025 Revela. All rights reserved.
      </footer>

    </main>
  )
}


