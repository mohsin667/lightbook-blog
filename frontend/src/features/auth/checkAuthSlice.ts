import { createAsyncThunk } from "@reduxjs/toolkit";

export const checkAuth = createAsyncThunk('/api/auth/me', async (_, {rejectWithValue}) => {
    const res = await fetch('http://localhost:8000/api/auth/me', {credentials: 'include'})
    if(!res.ok) return rejectWithValue('Not authenticated')
    return res.json()
})

export const loginUser = createAsyncThunk('auth/login', async (credentials:{email: string, password: string}, {rejectWithValue})=> {
    const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(credentials)
    })
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail)
    }
    const result = await res.json()
    return result;
})

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    credentials: { username: string, email: string; password: string; display_name: string },
    { rejectWithValue }
  ) => {
    const res = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    })
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail)
    }
    return res.json()
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async (_,{ rejectWithValue }) => {
    const res = await fetch('http://localhost:8000/api/auth/logout',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        }
    )
    if (!res.ok) {
      return rejectWithValue('Logout failed')
    }
    return null
  }
)