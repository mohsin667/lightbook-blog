# Reddit — for the pinned monthly showcase thread (comment, not a standalone post)

**lightbook** — a Medium-style blogging platform I built solo over the last few months (still learning to code, built this instead of doing more tutorials).

https://lightbook.blog/

Stack: FastAPI + SQLModel on Postgres (pgvector for embeddings), React/TypeScript/Redux on the frontend, Dockerized and deployed on EC2 with GitHub Actions CI/CD.

The part I had the most fun with is the chat widget, it's RAG-based, embeds your question, pulls the closest matching posts by cosine similarity, and only answers from that context (says it doesn't know rather than making something up if nothing matches). Also has semantic search and AI-assisted drafting.

Would love feedback, what's confusing, what's missing, anything that feels off. Happy to answer questions about the implementation too.
