import { useState } from 'react'

function AuthPage({ title, emailId, passwordId, isRegister, onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isRegister) {
        await onSubmit({ name, email, password })
      } else {
        await onSubmit({ email, password })
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="form-page">
      <h2>{title}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <label htmlFor="auth-name">Name</label>
            <input id="auth-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </>
        )}

        <label htmlFor={emailId}>Email</label>
        <input id={emailId} type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label htmlFor={passwordId}>Password</label>
        <input id={passwordId} type="password" value={password} onChange={e => setPassword(e.target.value)} required />

        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
      </form>
    </section>
  )
}

export default AuthPage
