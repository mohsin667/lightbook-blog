import { createAsyncThunk } from "@reduxjs/toolkit";
import  refreshAPI  from "../../api/refreshAPI";

interface CreatePostResponse {
    title: string;
    excerpt: string;
    content: string;
    cover_image_url?: string;
    category_id?: string;
    tags?: string[];
    publish: boolean;
}

export const createPosts = createAsyncThunk('post/create', async (input: CreatePostResponse, {rejectWithValue}) => {
    const res = await refreshAPI('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
})

export const getAllPosts = createAsyncThunk('post/getAll', async (_,{rejectWithValue}) => {
    const res = await refreshAPI('/api/posts');
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
})
export const getPost = createAsyncThunk('post/getPost', async (id,{rejectWithValue}) => {
    const res = await refreshAPI(`/api/posts/${id}`);
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
})