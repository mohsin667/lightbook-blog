import {createSlice} from "@reduxjs/toolkit"
import {checkAuth,  registerUser, logoutUser, loginUser, updateProfile} from './checkAuthSlice'
import type { User } from '../../types'
// import { createAsyncThunk } from "@reduxjs/toolkit"

// export const loginUser = createAsyncThunk('auth/login', async (credentials:{email: string, password: string}, {rejectWithValue})=> {
//     const res = await fetch('http://localhost:8000/api/auth/login', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         credentials: 'include',
//         body: JSON.stringify(credentials)
//     })
//     if(!res.ok) {
//         return rejectWithValue((await res.json()).detail)
//     }
//     const result = await res.json()
//     return result;
// })

interface AuthState {
    user: User | null,
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null,
}

const initialState: AuthState  = {
    user: null,
    status: 'idle',
    error: null as string | null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.user = action.payload
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.payload as string
        })
        .addCase(registerUser.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.user = action.payload
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.payload as string
        })
        .addCase(checkAuth.pending, (state) => {
            state.status = "loading"
            state.error = null
        })
        .addCase(checkAuth.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.user = action.payload
        })
        .addCase(checkAuth.rejected, (state) => {
            state.status = 'failed'
            state.user = null
        })
        .addCase(logoutUser.fulfilled, (state) => {
            state.user = null
            state.status = 'succeeded'
        })
        .addCase(updateProfile.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(updateProfile.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.user = action.payload
        })
        .addCase(updateProfile.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.payload as string
        })
    }
})

export default authSlice.reducer