# LinkedIn post — lightbook.blog

They say if you just watch tutorials, you end up in tutorial hell. Honestly, they're right.

So I took a different route. Instead of learning through video tutorials, I built something real and learned (still learning) along the way.

The result is lightbook, a Medium style blogging platform I built solo, in Python. A few things I pushed myself on:

- Backend in Python: FastAPI + SQLModel on PostgreSQL, with pgvector for embeddings
- A RAG powered chat assistant that answers reader questions grounded strictly in the actual posts. No hallucinated answers, it just says "I don't have a post about that" when it doesn't know
- Semantic search across every post, not just keyword matching
- AI assisted drafting to help go from a title to a full post
- React, TypeScript and Redux on the frontend, fully mobile responsive
- Dockerized and deployed to AWS EC2 with GitHub Actions CI/CD and HTTPS

The part I'm most proud of isn't any single feature. It's that I debugged this like real production software. A FastAPI route ordering bug that silently broke pagination. A race condition in the login flow that showed "welcome back" even on failed logins. Real bugs, real fixes, real deploys.

I'm a few months into learning to code seriously, and building something end to end (backend, frontend, infra, AI) has taught me more than any tutorial ever did.

Go check it out and poke around: https://lightbook.blog/

I'd genuinely love feedback. Try the chat assistant, break something, tell me what's confusing or what you'd want to see next.

If you're hiring for anything Python or full-stack, or just want to trade notes on FastAPI and pgvector, I'd love to connect.

What's one bug that taught you more than it should have? And if you try the site, what should I fix first?

#Python #FastAPI #FullStackDevelopment #BuildInPublic #WebDevelopment #OpenToWork
