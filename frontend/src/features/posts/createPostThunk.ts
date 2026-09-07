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

export const PAGE_SIZE = 20;

export const getAllPosts = createAsyncThunk(
  'post/getAll',
  async (params: { skip?: number } | undefined, {rejectWithValue}) => {
    const skip = params?.skip ?? 0;
    const res = await refreshAPI(`/api/posts?skip=${skip}&limit=${PAGE_SIZE}`);
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return { posts: result, skip };
})
export const getPost = createAsyncThunk('post/getPost', async (id:{id: string},{rejectWithValue}) => {
    const res = await refreshAPI(`/api/posts/${id.id}`);
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
})

export const searchPosts = createAsyncThunk(
  'post/search',
  async (params:{q: string; skip?: number},{rejectWithValue}) => {
    const skip = params.skip ?? 0;
    const res = await refreshAPI(
        `/api/search?q=${encodeURIComponent(params.q)}&skip=${skip}&limit=${PAGE_SIZE}`);
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return { posts: result, skip };
})

export const getDrafts = createAsyncThunk('post/getDrafts', async (_, {rejectWithValue}) => {
    const res = await refreshAPI('/api/posts/drafts');
    if(!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
})
export const toggleLike = createAsyncThunk(
    'post/toggleLike',
    async (params: { postId: string; liked: boolean }, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${params.postId}/like`, {
            method: params.liked ? 'DELETE' : 'POST',
        });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        const result = await res.json();
        return { postId: params.postId, liked: result.liked, like_count: result.like_count };
    }
)

export const reportPost = createAsyncThunk(
    'post/report',
    async (params: { postId: string; reason?: string }, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${params.postId}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: params.reason ?? null }),
        });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        return params.postId;
    }
)

export const getReportedPosts = createAsyncThunk('post/getReported', async (_, { rejectWithValue }) => {
    const res = await refreshAPI('/api/admin/reports');
    if (!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
})

export const dismissFlag = createAsyncThunk(
    'post/dismissFlag',
    async (postId: string, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${postId}/reports`, { method: 'DELETE' });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        return postId;
    }
)

export const unpublishPost = createAsyncThunk(
    'post/unpublish',
    async (postId: string, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${postId}/unpublish`, { method: 'POST' });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        const result = await res.json();
        return result;
    }
)

export const setFeatured = createAsyncThunk(
    'post/setFeatured',
    async (postId: string, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${postId}/feature`, { method: 'PATCH' });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        const result = await res.json();
        return result;
    }
)

export const updatePost = createAsyncThunk(
    'post/update',
    async (
        params: { id: string; updates: Partial<CreatePostResponse> & { tags?: string[] } },
        { rejectWithValue }
    ) => {
        const res = await refreshAPI(`/api/posts/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params.updates),
        });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        const result = await res.json();
        return result;
    }
)

export const publishPost = createAsyncThunk(
    'post/publish',
    async (postId: string, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${postId}/publish`, { method: 'POST' });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        const result = await res.json();
        return result;
    }
)

export const deletePost = createAsyncThunk(
    'post/delete',
    async (postId: string, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${postId}`, { method: 'DELETE' });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        return postId;
    }
)

export const toggleBookmark = createAsyncThunk(
    'post/toggleBookmark',
    async (params: { postId: string; bookmarked: boolean }, { rejectWithValue }) => {
        const res = await refreshAPI(`/api/posts/${params.postId}/bookmark`, {
            method: params.bookmarked ? 'DELETE' : 'POST',
        });
        if (!res.ok) {
            return rejectWithValue((await res.json()).detail);
        }
        const result = await res.json();
        return { postId: params.postId, bookmarked: result.bookmarked };
    }
)

export const getBookmarks = createAsyncThunk('post/getBookmarks', async (_, { rejectWithValue }) => {
    const res = await refreshAPI('/api/users/me/bookmarks');
    if (!res.ok) {
        return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
})
