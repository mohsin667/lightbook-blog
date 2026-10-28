# Reddit post — lightbook.blog
(tuned for r/SideProject or r/webdev — adjust title/flair per subreddit rules)

## Title
I built a Medium clone with a RAG chatbot that only answers from the actual blog content (Python/FastAPI + React)

## Body

Been learning to code for a few months now, and instead of doing more tutorials I decided to just build something real end to end. Here's what I ended up with: lightbook, a Medium-style blogging platform.

Stack:
- FastAPI + SQLModel on Postgres, pgvector for embeddings
- React, TypeScript, Redux Toolkit on the frontend
- Dockerized, deployed on AWS EC2 with GitHub Actions for CI/CD

The part I found most interesting to build was the chat widget. It's RAG-based, it embeds the question, pulls the closest matching posts by cosine similarity, and only answers from that context. If nothing matches, it just says it doesn't have a post about that instead of making something up. Getting the retrieval actually reliable (adding keyword fallback, category matching, not leaking stale context between turns) took a lot more iteration than I expected going in.

A few bugs that taught me more than I wanted to learn at the time:
- A FastAPI route registration order bug where a static route (`/posts/count`) was getting shadowed by a dynamic one (`/posts/{slug}`) declared earlier, so it 404'd silently and broke pagination.
- A race condition on login where the UI showed "welcome back" even when the credentials were wrong, because the error from the thunk wasn't being awaited before firing the success toast.

It's live at https://lightbook.blog/ if anyone wants to poke around. Genuinely looking for feedback, what's confusing, what's slow, what you'd expect a blogging platform to have that it doesn't. Also happy to answer questions about any of the implementation if it's useful to anyone else building something similar.
