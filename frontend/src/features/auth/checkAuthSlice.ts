import { createAsyncThunk } from "@reduxjs/toolkit";
import  refreshAPI  from "../../api/refreshAPI";

export const checkAuth = createAsyncThunk('/api/auth/me', async (_, {rejectWithValue}) => {
    const res = await refreshAPI('/api/auth/me')
    if(!res.ok) return rejectWithValue('Not authenticated')
    return res.json()
})

export const loginUser = createAsyncThunk('auth/login', async (credentials:{email: string, password: string}, {rejectWithValue})=> {
    const res = await refreshAPI('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
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
    const res = await refreshAPI('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail)
    }
    return res.json()
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async (_,{ rejectWithValue }) => {
    const res = await refreshAPI('/api/auth/logout',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }
    )
    if (!res.ok) {
      return rejectWithValue('Logout failed')
    }
    return null
  }
)
